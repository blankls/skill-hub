import type { Skill, SkillGroup } from '@/types'

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

    async create(skill: Skill): Promise<void> {
        const res = await fetch(`${API_BASE}/skills`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(skill)
        })
        if (res.status === 401) throw new Error('认证已过期，请重新登录')
        if (!res.ok) throw new Error(`Failed to create skill: ${res.status}`)
    },

    async update(skill: Skill): Promise<void> {
        const res = await fetch(`${API_BASE}/skills/${encodeURIComponent(skill.id)}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(skill)
        })
        if (res.status === 401) throw new Error('认证已过期，请重新登录')
        if (!res.ok) throw new Error(`Failed to update skill: ${res.status}`)
    },

    async put(skill: Skill): Promise<void> {
        const existing = await this.get(skill.id)
        if (existing) {
            await this.update(skill)
        } else {
            await this.create(skill)
        }
    },

    async delete(id: string): Promise<void> {
        const res = await fetch(`${API_BASE}/skills/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
        if (res.status === 401) throw new Error('认证已过期，请重新登录')
        if (!res.ok) throw new Error(`Failed to delete skill: ${res.status}`)
    }
}

function restoreGroupDates(group: SkillGroup): SkillGroup {
    if (typeof group.createdAt === 'string') group.createdAt = new Date(group.createdAt)
    if (typeof group.updatedAt === 'string') group.updatedAt = new Date(group.updatedAt)
    return group
}

export const groupDb = {
    async getAll(): Promise<SkillGroup[]> {
        const res = await fetch(`${API_BASE}/groups`)
        if (!res.ok) throw new Error(`Failed to fetch groups: ${res.status}`)
        const groups: SkillGroup[] = await res.json()
        return groups.map(restoreGroupDates)
    },

    async create(group: SkillGroup): Promise<void> {
        const res = await fetch(`${API_BASE}/groups`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(group)
        })
        if (res.status === 401) throw new Error('认证已过期，请重新登录')
        if (!res.ok) throw new Error(`Failed to create group: ${res.status}`)
    },

    async update(group: SkillGroup): Promise<void> {
        const res = await fetch(`${API_BASE}/groups/${encodeURIComponent(group.id)}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(group)
        })
        if (res.status === 401) throw new Error('认证已过期，请重新登录')
        if (!res.ok) throw new Error(`Failed to update group: ${res.status}`)
    },

    async delete(id: string): Promise<void> {
        const res = await fetch(`${API_BASE}/groups/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
        if (res.status === 401) throw new Error('认证已过期，请重新登录')
        if (!res.ok) throw new Error(`Failed to delete group: ${res.status}`)
    }
}
