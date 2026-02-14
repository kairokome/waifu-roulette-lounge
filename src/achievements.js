// achievements.js - Achievement system

export const ACHIEVEMENTS = {
  first_straight: {
    id: 'first_straight',
    name: 'Straight Shot',
    description: 'Hit a straight bet (35:1)',
    icon: '🎯',
    points: 100
  },
  five_wins: {
    id: 'five_wins',
    name: 'On Fire!',
    description: '5 win streak',
    icon: '🔥',
    points: 150
  },
  profit_500: {
    id: 'profit_500',
    name: 'High Roller',
    description: 'Reach +500 chips profit',
    icon: '💰',
    points: 200
  },
  spin_100: {
    id: 'spin_100',
    name: 'Regular',
    description: 'Play 100 spins',
    icon: '🎰',
    points: 50
  },
  big_win: {
    id: 'big_win',
    name: 'Jackpot',
    description: 'Win 100+ chips in one spin',
    icon: '⭐',
    points: 100
  },
  lucky_day_winner: {
    id: 'lucky_day_winner',
    name: 'Lucky!',
    description: 'Win during Lucky Day event',
    icon: '🍀',
    points: 75
  },
  ten_runs: {
    id: 'ten_runs',
    name: 'Dedicated',
    description: 'Complete 10 run modes',
    icon: '🏃',
    points: 100
  },
  come_back: {
    id: 'come_back',
    name: 'Comeback Kid',
    description: 'Win after 5+ loss streak',
    icon: '💪',
    points: 125
  }
}

// Load achievements from localStorage
export function loadAchievements() {
  try {
    const saved = localStorage.getItem('waifuAchievements')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load achievements:', e)
  }
  return {
    unlocked: [],
    stats: {
      totalSpins: 0,
      totalWins: 0,
      totalLosses: 0,
      biggestWin: 0,
      longestWinStreak: 0,
      runsCompleted: 0
    }
  }
}

// Save achievements
export function saveAchievements(data) {
  try {
    localStorage.setItem('waifuAchievements', JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save achievements:', e)
  }
}

// Check and unlock achievements
export function checkAchievements(currentData, gameState, event) {
  const newlyUnlocked = []
  const { unlocked, stats } = currentData
  
  // First straight hit
  if (!unlocked.includes('first_straight') && gameState.lastWinType === 'straight') {
    newlyUnlocked.push(ACHIEVEMENTS.first_straight)
    unlocked.push('first_straight')
  }
  
  // Five win streak
  if (!unlocked.includes('five_wins') && gameState.winStreak >= 5) {
    newlyUnlocked.push(ACHIEVEMENTS.five_wins)
    unlocked.push('five_wins')
  }
  
  // Profit 500
  if (!unlocked.includes('profit_500') && gameState.profit >= 500) {
    newlyUnlocked.push(ACHIEVEMENTS.profit_500)
    unlocked.push('profit_500')
  }
  
  // Spin 100
  if (!unlocked.includes('spin_100') && stats.totalSpins >= 100) {
    newlyUnlocked.push(ACHIEVEMENTS.spin_100)
    unlocked.push('spin_100')
  }
  
  // Big win
  if (!unlocked.includes('big_win') && gameState.lastWinAmount >= 100) {
    newlyUnlocked.push(ACHIEVEMENTS.big_win)
    unlocked.push('big_win')
  }
  
  // Lucky day winner
  if (!unlocked.includes('lucky_day_winner') && event?.id === 'lucky_day' && gameState.lastWinAmount > 0) {
    newlyUnlocked.push(ACHIEVEMENTS.lucky_day_winner)
    unlocked.push('lucky_day_winner')
  }
  
  // Comeback
  if (!unlocked.includes('come_back') && gameState.lossStreak >= 5 && gameState.lastWinAmount > 0) {
    newlyUnlocked.push(ACHIEVEMENTS.come_back)
    unlocked.push('come_back')
  }
  
  return newlyUnlocked
}

// Calculate total points
export function calculatePoints(unlocked) {
  return unlocked.reduce((sum, id) => {
    const achievement = ACHIEVEMENTS[id]
    return sum + (achievement?.points || 0)
  }, 0)
}
