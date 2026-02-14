// ============= PROGRESSION SYSTEM =============
// XP and Leveling for Waifu Roulette Lounge

// XP Configuration
export const XP_CONFIG = {
  BASE_XP_PER_SPIN: 10,
  WIN_BONUS_MULTIPLIER: 1.5,
  STRAIGHT_BONUS_MULTIPLIER: 5,
  STREAK_BONUS_PER_STreak: 2,
  LEVEL_SCALING_BASE: 100,
  LEVEL_SCALING_EXPONENT: 1.5,
}

// Level thresholds: XP required to reach each level
export function getLevelThreshold(level) {
  return Math.floor(XP_CONFIG.LEVEL_SCALING_BASE * Math.pow(level, XP_CONFIG.LEVEL_SCALING_EXPONENT))
}

// Calculate total XP needed for a level
export function getTotalXPForLevel(level) {
  let total = 0
  for (let i = 1; i <= level; i++) {
    total += getLevelThreshold(i)
  }
  return total
}

// Calculate current level from total XP
export function calculateLevel(totalXP) {
  let level = 1
  let xpNeeded = getLevelThreshold(level)
  let xpAccumulated = 0
  
  while (xpAccumulated + xpNeeded <= totalXP) {
    xpAccumulated += xpNeeded
    level++
    xpNeeded = getLevelThreshold(level)
  }
  
  return {
    level,
    currentXP: totalXP - xpAccumulated,
    xpToNextLevel: xpNeeded,
    progressPercent: Math.round((totalXP - xpAccumulated) / xpNeeded * 100)
  }
}

// Calculate XP earned from a spin
export function calculateXPEarned(payout, isStraightHit, streakCount, isWin) {
  let xp = XP_CONFIG.BASE_XP_PER_SPIN
  
  if (isWin) {
    xp *= XP_CONFIG.WIN_BONUS_MULTIPLIER
  }
  
  if (isStraightHit) {
    xp *= XP_CONFIG.STRAIT_BONUS_MULTIPLIER
  }
  
  if (streakCount > 1) {
    xp += (streakCount - 1) * XP_CONFIG.STREAK_BONUS_PER_STreak
  }
  
  return Math.floor(xp)
}

// ============= COSMETIC UNLOCKS =============
export const COSMETICS = {
  TABLE_SKINS: {
    default: { id: 'default', name: 'Classic Green', level: 1, color: '#0f2d1a', border: '#22c55e' },
    ocean: { id: 'ocean', name: 'Deep Ocean', level: 5, color: '#0a1f2d', border: '#0ea5e9' },
    sunset: { id: 'sunset', name: 'Sunset Blvd', level: 10, color: '#2d1a0f', border: '#f97316' },
    neon: { id: 'neon', name: 'Neon Tokyo', level: 15, color: '#1a0a2e', border: '#a855f7' },
    gold: { id: 'gold', name: 'Golden Fortune', level: 25, color: '#2d2a0f', border: '#eab308' },
  },
  BORDER_STYLES: {
    default: { id: 'default', name: 'Standard', level: 1, class: '' },
    pink: { id: 'pink', name: 'Neon Pink', level: 3, class: 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]' },
    cyan: { id: 'cyan', name: 'Cyber Cyan', level: 8, class: 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' },
    gold: { id: 'gold', name: 'Royal Gold', level: 20, class: 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]' },
    rainbow: { id: 'rainbow', name: 'Rainbow', level: 30, class: 'border-gradient-to-r from-pink-500 via-cyan-500 to-yellow-500' },
  },
  DEALER_PERSONALITIES: {
    default: { id: 'default', name: 'Classic', level: 1 },
    sassy: { id: 'sassy', name: 'Sassy', level: 7 },
    wise: { id: 'wise', name: 'Wise Old', level: 12 },
    hype: { id: 'hype', name: 'Hype Man', level: 18 },
  }
}

// Get all unlocked cosmetics for a level
export function getUnlockedCosmetics(level) {
  const unlocked = { tables: [], borders: [], dealers: [] }
  
  Object.values(COSMETICS.TABLE_SKINS).forEach(skin => {
    if (skin.level <= level) unlocked.tables.push(skin)
  })
  
  Object.values(COSMETICS.BORDER_STYLES).forEach(border => {
    if (border.level <= level) unlocked.borders.push(border)
  })
  
  Object.values(COSMETICS.DEALER_PERSONALITIES).forEach(dealer => {
    if (dealer.level <= level) unlocked.dealers.push(dealer)
  })
  
  return unlocked
}

// Get next unlock for a category
export function getNextUnlock(level, category) {
  const items = Object.values(COSMETICS[category])
  const next = items.find(item => item.level > level)
  return next ? { ...next, xpNeeded: getLevelThreshold(level + 1) } : null
}

// ============= GRADE SYSTEM =============
export const GRADES = {
  S: { min: 50, label: 'LEGENDARY!', color: 'text-yellow-400', icon: '🏆' },
  A: { min: 20, label: 'Excellent!', color: 'text-green-400', icon: '⭐' },
  B: { min: 0, label: 'Good job!', color: 'text-blue-400', icon: '👍' },
  C: { min: -20, label: 'Break even', color: 'text-gray-400', icon: '😐' },
  D: { min: -50, label: 'Ouch...', color: 'text-orange-400', icon: '😢' },
  F: { min: -Infinity, label: 'RUN COMPLETE', color: 'text-red-400', icon: '💀' },
}

export function calculateRunGrade(runResults) {
  if (runResults.length === 0) return null
  
  const totalWagered = runResults.reduce((sum, r) => sum + r.bet, 0)
  const totalWon = runResults.reduce((sum, r) => sum + (r.result > 0 ? r.result : 0), 0)
  const netProfit = totalWon - totalWagered
  const profitPercent = totalWagered > 0 ? Math.round((netProfit / totalWagered) * 100) : 0
  
  return Object.entries(GRADES).find(([key, g]) => profitPercent >= g.min)[1]
}

// ============= EMOTIONAL ESCALATION =============
export function getEscalationLevel(streakCount, isWinStreak) {
  if (!isWinStreak || streakCount < 2) return 0
  if (streakCount >= 5) return 3
  if (streakCount >= 3) return 2
  return 1
}

export function getEscalationStyles(streakCount, isWinStreak) {
  const level = getEscalationLevel(streakCount, isWinStreak)
  
  const styles = [
    '', // 0 - normal
    'animate-pulse', // 1 - slight
    'animate-bounce', // 2 - medium
    'shadow-[0_0_40px_rgba(236,72,153,0.8)]', // 3 - intense
  ]
  
  return styles[level]
}

// ============= PERSISTENCE =============
const PROGRESSION_KEY = 'waifuRouletteProgression'

export function loadProgression() {
  try {
    const saved = localStorage.getItem(PROGRESSION_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) { console.error('Load progression error:', e) }
  return createInitialProgression()
}

export function createInitialProgression() {
  return {
    totalXP: 0,
    totalSpins: 0,
    bestGrade: null,
    bestStreak: 0,
    unlockedCosmetics: ['default'],
    selectedTable: 'default',
    selectedBorder: 'default',
    selectedDealer: 'default',
    stats: {
      totalWins: 0,
      totalStraightHits: 0,
      runsCompleted: 0,
    }
  }
}

export function saveProgression(progression) {
  try {
    localStorage.setItem(PROGRESSION_KEY, JSON.stringify(progression))
  } catch (e) { console.error('Save progression error:', e) }
}

export function addXP(progression, xpAmount) {
  const newProgression = {
    ...progression,
    totalXP: progression.totalXP + xpAmount,
    totalSpins: progression.totalSpins + 1,
  }
  
  // Check for new unlocks
  const newLevel = calculateLevel(newProgression.totalXP).level
  const oldLevel = calculateLevel(progression.totalXP).level
  
  if (newLevel > oldLevel) {
    const unlocked = getUnlockedCosmetics(newLevel)
    // Add any newly unlocked cosmetics
    unlocked.tables.forEach(table => {
      if (!newProgression.unlockedCosmetics.includes(table.id)) {
        newProgression.unlockedCosmetics.push(table.id)
      }
    })
  }
  
  return newProgression
}
