import express from 'express'
import cors from 'cors'
import fs from 'fs'
import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || 'localhost'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const DATA_DIR = process.env.DATA_DIR 
  ? path.isAbsolute(process.env.DATA_DIR) 
    ? process.env.DATA_DIR 
    : path.join(__dirname, process.env.DATA_DIR)
  : path.join(__dirname, 'data', 'skills')

const LOGIN_RATE_LIMIT = {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 5 * 60 * 1000,
    LOCK_MS: 15 * 60 * 1000
}

const SESSION_TIMEOUT = 30 * 60 * 1000

const loginAttempts = new Map()
const activeTokens = new Map()

const LOG_DIR = path.join(__dirname, 'logs')
const AUTH_LOG_FILE = path.join(LOG_DIR, 'auth.log')

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
}

function logAuthEvent(ip, event, details = {}) {
    const timestamp = new Date().toISOString()
    const logLine = JSON.stringify({ timestamp, ip, event, ...details }) + '\n'
    fs.appendFile(AUTH_LOG_FILE, logLine, (err) => {
        if (err) console.error('Failed to write auth log:', err)
    })
}

function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
        || req.headers['x-real-ip'] 
        || req.connection?.remoteAddress 
        || req.socket?.remoteAddress 
        || 'unknown'
}

setInterval(() => {
    const now = Date.now()
    for (const [ip, record] of loginAttempts) {
        if (record.lockedUntil && now > record.lockedUntil) {
            loginAttempts.delete(ip)
        }
        else if (!record.lockedUntil && now - record.firstAttempt > LOGIN_RATE_LIMIT.WINDOW_MS) {
            loginAttempts.delete(ip)
        }
    }
    for (const [token, info] of activeTokens) {
        if (now - info.createdAt > SESSION_TIMEOUT) {
            activeTokens.delete(token)
        }
    }
}, 10 * 60 * 1000)

function requireAuth(req, res, next) {
    const token = req.headers['x-auth-token']
    if (!token) {
        return res.status(401).json({ error: '未提供认证令牌' })
    }
    const session = activeTokens.get(token)
    if (!session) {
        return res.status(401).json({ error: '认证令牌无效或已过期' })
    }
    if (Date.now() - session.createdAt > SESSION_TIMEOUT) {
        activeTokens.delete(token)
        return res.status(401).json({ error: '认证令牌已过期，请重新登录' })
    }
    next()
}

const LIKE_RATE_LIMIT = {
    MAX_PER_MINUTE: 10,
    WINDOW_MS: 60 * 1000
}
const likeAttempts = new Map()

function rateLimitLikes(req, res, next) {
    const ip = getClientIP(req)
    const now = Date.now()
    let record = likeAttempts.get(ip)
    if (!record || now - record.firstAttempt > LIKE_RATE_LIMIT.WINDOW_MS) {
        record = { count: 0, firstAttempt: now }
    }
    record.count++
    likeAttempts.set(ip, record)
    if (record.count > LIKE_RATE_LIMIT.MAX_PER_MINUTE) {
        return res.status(429).json({ error: '操作过于频繁，请稍后再试' })
    }
    next()
}

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
}

const app = express()

const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://blankls.xyz',
            'https://www.blankls.xyz',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3001'
        ]
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}
app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }))

function sanitizeId(id) {
    if (!id || typeof id !== 'string') return null
    if (id.includes('..') || id.includes('/') || id.includes('\\') || id.includes('\0')) return null
    return id
}

function readSkillFile(id) {
    const safeId = sanitizeId(id)
    if (!safeId) return null
    const filePath = path.join(DATA_DIR, `${safeId}.json`)
    if (!fs.existsSync(filePath)) return null
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
}

function writeSkillFile(id, data) {
    const safeId = sanitizeId(id)
    if (!safeId) throw new Error('Invalid skill ID')
    const filePath = path.join(DATA_DIR, `${safeId}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

function deleteSkillFile(id) {
    const safeId = sanitizeId(id)
    if (!safeId) return
    const filePath = path.join(DATA_DIR, `${safeId}.json`)
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
    }
}

// GET /api/skills - 获取所有技能（支持标签过滤和搜索）
app.get('/api/skills', (req, res) => {
    try {
        const { tag, q } = req.query
        const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'))
        let skills = files.map(f => {
            const raw = fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')
            return JSON.parse(raw)
        })
        
        // 标签过滤
        if (tag) {
            skills = skills.filter(skill => 
                skill.tags && skill.tags.includes(tag)
            )
        }
        
        // 关键词搜索
        if (q) {
            const query = q.toLowerCase()
            skills = skills.filter(skill =>
                skill.name.toLowerCase().includes(query) ||
                (skill.description && skill.description.toLowerCase().includes(query)) ||
                (skill.tags && skill.tags.some(t => t.toLowerCase().includes(query)))
            )
        }
        
        skills.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        res.json(skills)
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

// GET /api/skills/:id - 获取单个技能
app.get('/api/skills/:id', (req, res) => {
    try {
        const skill = readSkillFile(req.params.id)
        if (!skill) return res.status(404).json({ error: 'Skill not found' })
        res.json(skill)
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

// POST /api/skills - 创建技能
app.post('/api/skills', requireAuth, (req, res) => {
    try {
        const skill = req.body
        if (!skill.id) {
            return res.status(400).json({ error: 'Skill id is required' })
        }
        writeSkillFile(skill.id, skill)
        res.status(201).json(skill)
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

// PUT /api/skills/:id - 更新技能
app.put('/api/skills/:id', requireAuth, (req, res) => {
    try {
        const existing = readSkillFile(req.params.id)
        if (!existing) return res.status(404).json({ error: 'Skill not found' })
        writeSkillFile(req.params.id, req.body)
        res.json(req.body)
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

// DELETE /api/skills/:id - 删除技能
app.delete('/api/skills/:id', requireAuth, (req, res) => {
    try {
        const existing = readSkillFile(req.params.id)
        if (!existing) return res.status(404).json({ error: 'Skill not found' })
        deleteSkillFile(req.params.id)
        res.json({ success: true })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

// POST /api/skills/:id/like - 点赞/取消点赞
app.post('/api/skills/:id/like', rateLimitLikes, (req, res) => {
    try {
        const skill = readSkillFile(req.params.id)
        if (!skill) return res.status(404).json({ error: 'Skill not found' })
        
        const { unlike } = req.body
        if (unlike) {
            skill.likes = Math.max(0, (skill.likes || 1) - 1)
        } else {
            skill.likes = (skill.likes || 0) + 1
        }
        
        writeSkillFile(req.params.id, skill)
        res.json({ likes: skill.likes })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

// POST /api/auth/verify - 校验管理员密码（带限流）
app.post('/api/auth/verify', (req, res) => {
    try {
        const ip = getClientIP(req)
        const { password } = req.body
        const now = Date.now()
        
        // 获取或初始化该 IP 的记录
        let record = loginAttempts.get(ip)
        
        // 检查是否被锁定
        if (record?.lockedUntil && now < record.lockedUntil) {
            const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000)
            logAuthEvent(ip, 'login_blocked', { remainingMinutes })
            return res.status(429).json({ 
                error: `尝试次数过多，请 ${remainingMinutes} 分钟后再试`,
                lockUntil: new Date(record.lockedUntil).toISOString()
            })
        }
        
        // 检查密码是否为空
        if (!password) {
            return res.status(400).json({ error: '密码不能为空' })
        }
        
        // 验证密码
        if (password === ADMIN_PASSWORD) {
            loginAttempts.delete(ip)
            const token = crypto.randomBytes(32).toString('hex')
            activeTokens.set(token, { createdAt: Date.now(), ip })
            logAuthEvent(ip, 'login_success')
            return res.json({ success: true, token })
        }
        
        // 登录失败，更新记录
        if (!record || now - record.firstAttempt > LOGIN_RATE_LIMIT.WINDOW_MS) {
            // 新窗口，重置计数
            record = { count: 0, firstAttempt: now, lockedUntil: null }
        }
        
        record.count++
        
        // 检查是否触发锁定
        if (record.count >= LOGIN_RATE_LIMIT.MAX_ATTEMPTS) {
            record.lockedUntil = now + LOGIN_RATE_LIMIT.LOCK_MS
            loginAttempts.set(ip, record)
            logAuthEvent(ip, 'login_locked', { attempts: record.count })
            return res.status(429).json({ 
                error: '尝试次数过多，账户已锁定 15 分钟',
                lockUntil: new Date(record.lockedUntil).toISOString()
            })
        }
        
        loginAttempts.set(ip, record)
        logAuthEvent(ip, 'login_failed', { attempts: record.count })
        
        const attemptsLeft = LOGIN_RATE_LIMIT.MAX_ATTEMPTS - record.count
        res.status(401).json({ 
            error: '密码错误', 
            attemptsLeft 
        })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

app.listen(PORT, HOST, () => {
    console.log(`📦 SkillHub Storage API running at http://${HOST}:${PORT}`)
    console.log(`📁 Data directory: ${DATA_DIR}`)
    if (!process.env.ADMIN_PASSWORD) {
        console.log(`⚠️  ADMIN_PASSWORD 未设置，管理功能不可用，请在 .env 中配置自定义密码`)
    }
})
