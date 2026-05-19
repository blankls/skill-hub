import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 读取环境变量
const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || 'localhost'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
// 配置数据目录：如果环境变量配置了则使用，否则使用默认的 data/skills
const DATA_DIR = process.env.DATA_DIR 
  ? path.isAbsolute(process.env.DATA_DIR) 
    ? process.env.DATA_DIR 
    : path.join(__dirname, process.env.DATA_DIR)
  : path.join(__dirname, 'data', 'skills')

// ==================== 登录限流配置 ====================
const LOGIN_RATE_LIMIT = {
    MAX_ATTEMPTS: 5,              // 最大失败次数
    WINDOW_MS: 5 * 60 * 1000,     // 5 分钟窗口
    LOCK_MS: 15 * 60 * 1000       // 锁定 15 分钟
}

// 内存存储：IP -> { count, firstAttempt, lockedUntil }
const loginAttempts = new Map()

// 日志文件路径
const LOG_DIR = path.join(__dirname, 'logs')
const AUTH_LOG_FILE = path.join(LOG_DIR, 'auth.log')

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
}

// 写入认证日志
function logAuthEvent(ip, event, details = {}) {
    const timestamp = new Date().toISOString()
    const logLine = JSON.stringify({ timestamp, ip, event, ...details }) + '\n'
    fs.appendFile(AUTH_LOG_FILE, logLine, (err) => {
        if (err) console.error('Failed to write auth log:', err)
    })
}

// 获取客户端真实 IP
function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
        || req.headers['x-real-ip'] 
        || req.connection?.remoteAddress 
        || req.socket?.remoteAddress 
        || 'unknown'
}

// 定期清理过期记录（每 10 分钟）
setInterval(() => {
    const now = Date.now()
    for (const [ip, record] of loginAttempts) {
        // 锁定已过期
        if (record.lockedUntil && now > record.lockedUntil) {
            loginAttempts.delete(ip)
        }
        // 窗口已过期
        else if (!record.lockedUntil && now - record.firstAttempt > LOGIN_RATE_LIMIT.WINDOW_MS) {
            loginAttempts.delete(ip)
        }
    }
}, 10 * 60 * 1000)

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
}

const app = express()

app.use(cors())
app.use(express.json({ limit: '50mb' }))

function readSkillFile(id) {
    const filePath = path.join(DATA_DIR, `${id}.json`)
    if (!fs.existsSync(filePath)) return null
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
}

function writeSkillFile(id, data) {
    const filePath = path.join(DATA_DIR, `${id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

function deleteSkillFile(id) {
    const filePath = path.join(DATA_DIR, `${id}.json`)
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
app.post('/api/skills', (req, res) => {
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
app.put('/api/skills/:id', (req, res) => {
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
app.delete('/api/skills/:id', (req, res) => {
    try {
        const existing = readSkillFile(req.params.id)
        if (!existing) return res.status(404).json({ error: 'Skill not found' })
        deleteSkillFile(req.params.id)
        res.json({ success: true })
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
            // 登录成功，清除失败记录
            loginAttempts.delete(ip)
            logAuthEvent(ip, 'login_success')
            return res.json({ success: true })
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
})
