// rouletteEngine.js - Pure roulette spin logic

// Constants
export const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
export const BLACK_NUMBERS = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35]
export const ALL_NUMBERS = Array.from({ length: 37 }, (_, i) => i)

// Get color for a number
export function getNumberColor(number) {
  if (number === 0) return 'green'
  return RED_NUMBERS.includes(number) ? 'red' : 'black'
}

// Spin the roulette wheel - returns pure result object
export function spinRoulette() {
  const number = Math.floor(Math.random() * 37) // 0-36
  
  return {
    number,
    color: getNumberColor(number),
    isZero: number === 0,
    isRed: RED_NUMBERS.includes(number),
    isBlack: BLACK_NUMBERS.includes(number),
    isOdd: number !== 0 && number % 2 === 1,
    isEven: number !== 0 && number % 2 === 0,
    isFirstDozen: number >= 1 && number <= 12,
    isSecondDozen: number >= 13 && number <= 24,
    isThirdDozen: number >= 25 && number <= 36
  }
}

// Get random spin duration between min and max milliseconds
export function getRandomSpinDuration(minMs = 2000, maxMs = 4000) {
  return Math.floor(Math.random() * (maxMs - minMs)) + minMs
}

// Validate bet amount
export function validateBet(amount, bankroll, currentTotalBet) {
  if (amount < 0) return { valid: false, reason: 'Bet cannot be negative' }
  if (currentTotalBet + amount > bankroll) {
    return { valid: false, reason: 'Insufficient bankroll' }
  }
  return { valid: true }
}

// Default bet amounts
export const DEFAULT_BET_AMOUNTS = {
  red: 0,
  black: 0,
  odd: 0,
  even: 0,
  first12: 0,
  second12: 0,
  third12: 0
}

// Chip denominations
export const CHIP_DENOMINATIONS = [10, 25, 50, 100]
