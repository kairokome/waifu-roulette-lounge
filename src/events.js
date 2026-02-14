// events.js - Event system configuration

export const EVENTS = {
  normal: {
    id: 'normal',
    name: 'Normal Play',
    multiplier: 1,
    straightMultiplier: 1,
    description: 'Standard roulette rules',
    theme: { accent: 'pink', glow: false },
    active: true
  },
  lucky_day: {
    id: 'lucky_day',
    name: 'Lucky Day!',
    multiplier: 1.5,
    straightMultiplier: 1.5,
    description: '1.5x on all payouts!',
    theme: { accent: 'gold', glow: true },
    active: true
  },
  hot_streak: {
    id: 'hot_streak',
    name: 'Hot Streak',
    multiplier: 1,
    straightMultiplier: 1,
    redBlackMultiplier: 2,
    description: 'Red/Black pay 2x!',
    theme: { accent: 'red', glow: true },
    active: true
  },
  cold_numbers: {
    id: 'cold_numbers',
    name: 'Cold Numbers',
    multiplier: 1,
    straightMultiplier: 1,
    dozenMultiplier: 2,
    description: 'Dozens pay 2x!',
    theme: { accent: 'cyan', glow: true },
    active: true
  },
  vip_night: {
    id: 'vip_night',
    name: 'VIP Night',
    multiplier: 1,
    straightMultiplier: 40/35,
    description: 'Straight bets 40x!',
    theme: { accent: 'purple', glow: true },
    active: true
  }
}

// Get random event
export function getRandomEvent() {
  const eventKeys = Object.keys(EVENTS).filter(k => k !== 'normal')
  const randomKey = eventKeys[Math.floor(Math.random() * eventKeys.length)]
  return EVENTS[randomKey]
}

// Apply event multiplier to payout
export function applyEventMultiplier(basePayout, betType, event) {
  if (!event || event.id === 'normal') return basePayout
  
  let multiplier = event.multiplier || 1
  
  // Special bet type multipliers
  if (betType === 'straight' && event.straightMultiplier) {
    multiplier = event.straightMultiplier
  } else if ((betType === 'red' || betType === 'black') && event.redBlackMultiplier) {
    multiplier = event.redBlackMultiplier
  } else if ((betType === 'first12' || betType === 'second12' || betType === 'third12') && event.dozenMultiplier) {
    multiplier = event.dozenMultiplier
  }
  
  return basePayout * multiplier
}

// Event banner config
export function getEventBanner(event) {
  if (!event || event.id === 'normal') return null
  
  return {
    title: event.name,
    description: event.description,
    theme: event.theme
  }
}
