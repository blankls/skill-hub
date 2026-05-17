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
// 配置数据目录：如果环境变量配置了则使用，否则使用默认的 data/skills
const DATA_DIR = process.env.DATA_DIR 
  ? path.isAbsolute(process.env.DATA_DIR) 
    ? process.env.DATA_DIR 
    : path.join(__dirname, process.env.DATA_DIR)
  : path.join(__dirname, 'data', 'skills')

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

// GET /api/skills - 获取所有技能
app.get('/api/skills', (req, res) => {
    try {
        const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'))
        const skills = files.map(f => {
            const raw = fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')
            return JSON.parse(raw)
        })
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

app.listen(PORT, HOST, () => {
    console.log(`📦 SkillHub Storage API running at http://${HOST}:${PORT}`)
    console.log(`📁 Data directory: ${DATA_DIR}`)
})
