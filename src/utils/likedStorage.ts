const LIKED_SKILLS_KEY = 'skill-hub-liked-skills'
const LIKED_GROUPS_KEY = 'skill-hub-liked-groups'

export function getLikedSkills(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LIKED_SKILLS_KEY) || '[]')) }
  catch { return new Set() }
}

export function saveLikedSkill(id: string) {
  const s = getLikedSkills(); s.add(id)
  localStorage.setItem(LIKED_SKILLS_KEY, JSON.stringify([...s]))
}

export function removeLikedSkill(id: string) {
  const s = getLikedSkills(); s.delete(id)
  localStorage.setItem(LIKED_SKILLS_KEY, JSON.stringify([...s]))
}

export function getLikedGroups(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LIKED_GROUPS_KEY) || '[]')) }
  catch { return new Set() }
}

export function saveLikedGroup(id: string) {
  const s = getLikedGroups(); s.add(id)
  localStorage.setItem(LIKED_GROUPS_KEY, JSON.stringify([...s]))
}

export function removeLikedGroup(id: string) {
  const s = getLikedGroups(); s.delete(id)
  localStorage.setItem(LIKED_GROUPS_KEY, JSON.stringify([...s]))
}
