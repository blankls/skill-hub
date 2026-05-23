import type { Skill } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function restoreDates(skill: Skill): Skill {
    if (typeof skill.createdAt === 'string') skill.createdAt = new Date(skill.createdAt)
    if (typeof skill.updatedAt === 'string') skill.updatedAt = new Date(skill.updatedAt)
    if (skill.source?.lastSync && typeof skill.source.lastSync === 'string') {
        skill.source.lastSync = new Date(skill.source.lastSync)
    }
    return skill
}

function getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    try {
        const stored = sessionStorage.getItem('skh_auth')
        if (stored) {
            const data = JSON.parse(stored)
            if (data.token) {
                headers['X-Auth-Token'] = data.token
            }
        }
    } catch { /* empty */ }
    return headers
}

export const db = {
    async getAll(): Promise<Skill[]> {
        const res = await fetch(`${API_BASE}/skills`)
        if (!res.ok) throw new Error(`Failed to fetch skills: ${res.status}`)
        const skills: Skill[] = await res.json()
        return skills.map(restoreDates)
    },

    async get(id: string): Promise<Skill | null> {
        const res = await fetch(`${API_BASE}/skills/${encodeURIComponent(id)}`)
        if (res.status === 404) return null
        if (!res.ok) throw new Error(`Failed to fetch skill: ${res.status}`)
        const skill: Skill = await res.json()
        return restoreDates(skill)
    },

    async put(skill: Skill): Promise<void> {
        const check = await fetch(`${API_BASE}/skills/${encodeURIComponent(skill.id)}`)
        const method = check.status === 404 ? 'POST' : 'PUT'
        const url = method === 'POST'
            ? `${API_BASE}/skills`
            : `${API_BASE}/skills/${encodeURIComponent(skill.id)}`

        const res = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(skill)
        })
        if (res.status === 401) throw new Error('认证已过期，请重新登录')
        if (!res.ok) throw new Error(`Failed to save skill: ${res.status}`)
    },

    async delete(id: string): Promise<void> {
        const res = await fetch(`${API_BASE}/skills/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
        if (res.status === 401) throw new Error('认证已过期，请重新登录')
        if (!res.ok) throw new Error(`Failed to delete skill: ${res.status}`)
    },

    async clear(): Promise<void> {
        const skills = await this.getAll()
        for (const skill of skills) {
            await this.delete(skill.id)
        }
    }
}
