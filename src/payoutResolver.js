// payoutResolver.js - Pure payout calculation logic

// Payout multipliers
const PAYOUTS = {
  // Even money bets (1:1)
  red: 2,
  black: 2,
  odd: 2,
  even: 2,
  // Dozens (2:1)
  first12: 3,
  second12: 3,
  third12: 3,
  // Straight bet (35:1)
  straight: 36 // 35:1 means get 35x + original bet = 36x total
}

/**
 * Calculate payouts for a single spin
 * @param {Object} spinResult - Result from rouletteEngine
 * @param {Object} bets - { red: 0, black: 0, odd: 0, even: 0, first12: 0, second12: 0, third12: 0, straight: { 0: 0, 1: 0, ... } }
 * @returns {Object} { totalWinnings, totalBet, netGain, winningBets: [] }
 */
export function calculatePayouts(spinResult, bets) {
  const { number, isZero, isRed, isBlack, isOdd, isEven, isFirstDozen, isSecondDozen, isThirdDozen } = spinResult
  
  let totalWinnings = 0
  let totalBet = 0
  const winningBets = []
  
  // Calculate even-money bets
  if (bets.red > 0) {
    totalBet += bets.red
    if (isRed && !isZero) {
      const win = bets.red * PAYOUTS.red
      totalWinnings += win
      winningBets.push({ type: 'red', amount: bets.red, win })
    }
  }
  
  if (bets.black > 0) {
    totalBet += bets.black
    if (isBlack && !isZero) {
      const win = bets.black * PAYOUTS.black
      totalWinnings += win
      winningBets.push({ type: 'black', amount: bets.black, win })
    }
  }
  
  if (bets.odd > 0) {
    totalBet += bets.odd
    if (isOdd && !isZero) {
      const win = bets.odd * PAYOUTS.odd
      totalWinnings += win
      winningBets.push({ type: 'odd', amount: bets.odd, win })
    }
  }
  
  if (bets.even > 0) {
    totalBet += bets.even
    if (isEven && !isZero) {
      const win = bets.even * PAYOUTS.even
      totalWinnings += win
      winningBets.push({ type: 'even', amount: bets.even, win })
    }
  }
  
  // Dozens
  if (bets.first12 > 0) {
    totalBet += bets.first12
    if (isFirstDozen) {
      const win = bets.first12 * PAYOUTS.first12
      totalWinnings += win
      winningBets.push({ type: 'first12', amount: bets.first12, win })
    }
  }
  
  if (bets.second12 > 0) {
    totalBet += bets.second12
    if (isSecondDozen) {
      const win = bets.second12 * PAYOUTS.second12
      totalWinnings += win
      winningBets.push({ type: 'second12', amount: bets.second12, win })
    }
  }
  
  if (bets.third12 > 0) {
    totalBet += bets.third12
    if (isThirdDozen) {
      const win = bets.third12 * PAYOUTS.third12
      totalWinnings += win
      winningBets.push({ type: 'third12', amount: bets.third12, win })
    }
  }
  
  // Straight bets (single numbers)
  if (bets.straight && typeof bets.straight === 'object') {
    for (const [num, amount] of Object.entries(bets.straight)) {
      if (amount > 0) {
        totalBet += amount
        if (parseInt(num) === number) {
          const win = amount * PAYOUTS.straight
          totalWinnings += win
          winningBets.push({ type: 'straight', number: parseInt(num), amount, win })
        }
      }
    }
  }
  
  const netGain = totalWinnings - totalBet
  
  return {
    totalWinnings,
    totalBet,
    netGain,
    winningBets,
    isWin: netGain > 0,
    isLoss: netGain < 0,
    isPush: netGain === 0 && totalBet > 0
  }
}

/**
 * Create initial analytics state
 */
export function createInitialAnalytics() {
  return {
    totalBets: 0,
    totalSpins: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    biggestWin: 0,
    currentStreak: 0,
    currentStreakType: null, // 'win' or 'loss'
    longestWinStreak: 0,
    longestLossStreak: 0,
    totalWagered: 0,
    totalWon: 0
  }
}

/**
 * Update analytics after a spin
 */
export function updateAnalytics(analytics, payoutResult) {
  if (payoutResult.totalBet === 0) return analytics
  
  const newAnalytics = { ...analytics }
  
  newAnalytics.totalSpins++
  newAnalytics.totalBets++
  newAnalytics.totalWagered += payoutResult.totalBet
  newAnalytics.totalWon += payoutResult.totalWinnings
  
  if (payoutResult.isWin) {
    newAnalytics.wins++
    newAnalytics.biggestWin = Math.max(newAnalytics.biggestWin, payoutResult.netGain)
    
    // Update streaks
    if (newAnalytics.currentStreakType === 'win') {
      newAnalytics.currentStreak++
      newAnalytics.longestWinStreak = Math.max(newAnalytics.longestWinStreak, newAnalytics.currentStreak)
    } else {
      newAnalytics.currentStreak = 1
      newAnalytics.currentStreakType = 'win'
    }
  } else if (payoutResult.isLoss) {
    newAnalytics.losses++
    
    // Update streaks
    if (newAnalytics.currentStreakType === 'loss') {
      newAnalytics.currentStreak++
      newAnalytics.longestLossStreak = Math.max(newAnalytics.longestLossStreak, newAnalytics.currentStreak)
    } else {
      newAnalytics.currentStreak = 1
      newAnalytics.currentStreakType = 'loss'
    }
  } else {
    newAnalytics.pushes++
    // Push doesn't break streak but doesn't continue it
  }
  
  return newAnalytics
}

/**
 * Calculate win rate percentage
 */
export function getWinRate(analytics) {
  if (analytics.totalSpins === 0) return 0
  return Math.round((analytics.wins / analytics.totalSpins) * 100)
}
