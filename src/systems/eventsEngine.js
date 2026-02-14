// ============= EVENT ENGINE v1 =============
// Random Event System for Waifu Roulette Lounge

// Event Types
export const EVENT_TYPES = {
  FINANCIAL: 'FINANCIAL',
  SOCIAL: 'SOCIAL',
  RISK: 'RISK',
  LUCK: 'LUCK',
  PENALTY: 'PENALTY',
}

// Event Rarities
export const EVENT_RARITY = {
  COMMON: { weight: 70, label: 'COMMON' },
  RARE: { weight: 25, label: 'RARE' },
  EPIC: { weight: 5, label: 'EPIC' },
}

// ============= EVENT DEFINITIONS =============
export const EVENTS = {
  // COMMON (14)
  ramen_discount: {
    id: 'ramen_discount',
    title: 'Late-night ramen discount',
    text: 'Found a coupon in your pocket.',
    type: EVENT_TYPES.FINANCIAL,
    rarity: 'COMMON',
    cooldownSpins: 5,
    apply: (state) => ({
      chips: state.chips + 25,
      toast: { title: 'Ramen Discount!', text: '+25 chips', type: 'positive' }
    })
  },
  arcade_find: {
    id: 'arcade_find',
    title: 'Arcade cabinet find',
    text: 'Found coins under the cabinet.',
    type: EVENT_TYPES.FINANCIAL,
    rarity: 'COMMON',
    cooldownSpins: 4,
    apply: (state) => ({
      chips: state.chips + 15,
      toast: { title: 'Arcade Find!', text: '+15 chips', type: 'positive' }
    })
  },
  train_delay: {
    id: 'train_delay',
    title: 'Train delay',
    text: 'Compensation from the station.',
    type: EVENT_TYPES.FINANCIAL,
    rarity: 'COMMON',
    cooldownSpins: 6,
    apply: (state) => ({
      chips: state.chips + 10,
      toast: { title: 'Train Delay!', text: '+10 chips', type: 'positive' }
    })
  },
  lucky_charm: {
    id: 'lucky_charm',
    title: 'Lucky charm glows',
    text: 'Your charm is vibrating!',
    type: EVENT_TYPES.LUCK,
    rarity: 'COMMON',
    cooldownSpins: 5,
    apply: (state) => ({
      xp: state.xp + 10,
      toast: { title: 'Lucky Charm!', text: '+10 XP', type: 'positive' }
    })
  },
  street_performer: {
    id: 'street_performer',
    title: 'Street performer',
    text: 'Busker\'s rhythm boosts you.',
    type: EVENT_TYPES.LUCK,
    rarity: 'COMMON',
    cooldownSpins: 4,
    apply: (state) => ({
      xpModifier: 5,
      duration: 1,
      toast: { title: 'Street Rhythm!', text: '+5 XP next spin', type: 'positive' }
    })
  },
  bubble_tip: {
    id: 'bubble_tip',
    title: 'Bubble-era tip',
    text: 'Tip jar overflows.',
    type: EVENT_TYPES.FINANCIAL,
    rarity: 'COMMON',
    cooldownSpins: 5,
    apply: (state) => ({
      chips: state.chips + 20,
      toast: { title: 'Bubble Tip!', text: '+20 chips', type: 'positive' }
    })
  },
  phone_booth: {
    id: 'phone_booth',
    title: 'Phone booth call',
    text: '"Bet black!" — anonymous tip.',
    type: EVENT_TYPES.RISK,
    rarity: 'COMMON',
    cooldownSpins: 8,
    duration: 1,
    apply: (state, result) => {
      if (result?.color === 'black') {
        return {
          chips: state.chips + 30,
          toast: { title: 'Tip Was Right!', text: '+30 chips', type: 'positive' }
        }
      }
      return {
        chips: Math.max(0, state.chips - 10),
        toast: { title: 'Tip Was Wrong!', text: '-10 chips', type: 'negative' }
      }
    }
  },
  neon_focus: {
    id: 'neon_focus',
    title: 'Neon focus',
    text: 'The lights sharpen your vision.',
    type: EVENT_TYPES.LUCK,
    rarity: 'COMMON',
    cooldownSpins: 6,
    duration: 3,
    modifier: { streakBonus: 2 },
    apply: (state) => ({
      modifiers: [{ id: 'neon_focus', streakBonus: 2, duration: 3 }],
      toast: { title: 'Neon Focus!', text: '+2 streak bonus (3 spins)', type: 'positive' }
    })
  },
  cashier_error: {
    id: 'cashier_error',
    title: 'Cashier error',
    text: 'Oops! Extra change.',
    type: EVENT_TYPES.FINANCIAL,
    rarity: 'COMMON',
    cooldownSpins: 7,
    apply: (state) => ({
      chips: state.chips + 30,
      toast: { title: 'Cashier Error!', text: '+30 chips', type: 'positive' }
    })
  },
  mood_lift: {
    id: 'mood_lift',
    title: 'Dealer smiles',
    text: 'The dealer winks at you.',
    type: EVENT_TYPES.SOCIAL,
    rarity: 'COMMON',
    cooldownSpins: 5,
    apply: (state) => ({
      moodBoost: 10,
      toast: { title: 'Mood Lift!', text: 'Dealer +10 mood', type: 'positive' }
    })
  },
  taxi_meter: {
    id: 'taxi_meter',
    title: 'Taxi meter',
    text: 'Meter ran too long.',
    type: EVENT_TYPES.PENALTY,
    rarity: 'COMMON',
    cooldownSpins: 6,
    apply: (state) => ({
      chips: Math.max(0, state.chips - 15),
      toast: { title: 'Taxi Fare', text: '-15 chips', type: 'negative' }
    })
  },
  coin_drop: {
    id: 'coin_drop',
    title: 'Coin drop',
    text: 'Oops! Stack fell.',
    type: EVENT_TYPES.PENALTY,
    rarity: 'COMMON',
    cooldownSpins: 4,
    apply: (state) => ({
      chips: Math.max(0, state.chips - 10),
      toast: { title: 'Coin Drop!', text: '-10 chips', type: 'negative' }
    })
  },
  good_omen: {
    id: 'good_omen',
    title: 'Good omen',
    text: 'The stars align.',
    type: EVENT_TYPES.LUCK,
    rarity: 'COMMON',
    cooldownSpins: 8,
    duration: 1,
    modifier: { payoutBonus: 0.10 },
    apply: (state) => ({
      modifiers: [{ id: 'good_omen', payoutBonus: 0.10, duration: 1 }],
      toast: { title: 'Good Omen!', text: '+10% payout next spin', type: 'positive' }
    })
  },
  static_glitch: {
    id: 'static_glitch',
    title: 'CRT static',
    text: 'Signal interference...',
    type: EVENT_TYPES.PENALTY,
    rarity: 'COMMON',
    cooldownSpins: 7,
    duration: 1,
    modifier: { noXP: true },
    apply: (state) => ({
      modifiers: [{ id: 'static_glitch', noXP: true, duration: 1 }],
      toast: { title: 'Static Glitch!', text: 'No XP this spin', type: 'neutral' }
    })
  },

  // RARE (5)
  lucky_spin: {
    id: 'lucky_spin',
    title: 'Lucky Spin!',
    text: 'Fortune favors you!',
    type: EVENT_TYPES.LUCK,
    rarity: 'RARE',
    cooldownSpins: 15,
    apply: (state) => ({
      chips: state.chips + 60,
      toast: { title: 'LUCKY!', text: '+60 chips', type: 'epic' }
    })
  },
  rival_bump: {
    id: 'rival_bump',
    title: 'Rival encounter',
    text: 'Bumped into a rival player!',
    type: EVENT_TYPES.RISK,
    rarity: 'RARE',
    cooldownSpins: 12,
    apply: (state) => ({
      streakReset: true,
      toast: { title: 'Rival!', text: 'Streak reset!', type: 'negative' }
    })
  },
  high_roller: {
    id: 'high_roller',
    title: 'High roller energy',
    text: 'You feel like a VIP!',
    type: EVENT_TYPES.LUCK,
    rarity: 'RARE',
    cooldownSpins: 15,
    duration: 3,
    modifier: { payoutBonus: 0.15 },
    apply: (state) => ({
      modifiers: [{ id: 'high_roller', payoutBonus: 0.15, duration: 3 }],
      toast: { title: 'High Roller!', text: '+15% payouts (3 spins)', type: 'epic' }
    })
  },
  night_market: {
    id: 'night_market',
    title: 'Night market hustle',
    text: 'Quick thinking pays off.',
    type: EVENT_TYPES.FINANCIAL,
    rarity: 'RARE',
    cooldownSpins: 12,
    apply: (state) => ({
      chips: state.chips + 25,
      xp: state.xp + 15,
      toast: { title: 'Night Market!', text: '+25 chips, +15 XP', type: 'epic' }
    })
  },
  dealer_dare: {
    id: 'dealer_dare',
    title: 'Dealer dares you',
    text: '"Straight bet. Go big or go home."',
    type: EVENT_TYPES.RISK,
    rarity: 'RARE',
    cooldownSpins: 15,
    duration: 1,
    apply: (state, result) => {
      const hasStraightBet = result?.hadStraightBet
      if (hasStraightBet && result?.won) {
        return {
          chips: state.chips + 100,
          toast: { title: 'Dare Won!', text: '+100 chips!', type: 'epic' }
        }
      }
      return {
        chips: Math.max(0, state.chips - 25),
        toast: { title: 'Dare Lost', text: '-25 chips', type: 'negative' }
      }
    }
  },

  // EPIC (1)
  police_raid: {
    id: 'police_raid',
    title: 'POLICE RAID!',
    text: 'Everyone runs! But you kept your cool.',
    type: EVENT_TYPES.RISK,
    rarity: 'EPIC',
    cooldownSpins: 25,
    apply: (state) => ({
      chips: Math.max(0, state.chips - 80),
      xp: state.xp + 150,
      toast: { title: 'POLICE RAID!', text: '-80 chips, +150 XP!', type: 'epic' }
    })
  },
}

// ============= EVENT ENGINE =============
export class EventsEngine {
  constructor() {
    this.state = this.loadState()
  }

  loadState() {
    try {
      const saved = localStorage.getItem('waifuRouletteEvents')
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          spinCount: parsed.spinCount || 0,
          nextEventAt: parsed.nextEventAt || 5,
          activeModifiers: parsed.activeModifiers || [],
          eventHistory: parsed.eventHistory || [],
          cooldowns: parsed.cooldowns || {},
        }
      }
    } catch (e) { console.error('Load events error:', e) }
    return this.createInitialState()
  }

  createInitialState() {
    return {
      spinCount: 0,
      nextEventAt: 5,
      activeModifiers: [],
      eventHistory: [],
      cooldowns: {},
    }
  }

  saveState() {
    try {
      localStorage.setItem('waifuRouletteEvents', JSON.stringify(this.state))
    } catch (e) { console.error('Save events error:', e) }
  }

  // Check if any event is on cooldown
  isOnCooldown(eventId) {
    return (this.state.cooldowns[eventId] || 0) > this.state.spinCount
  }

  // Get available events by rarity
  getAvailableEvents(rarity) {
    return Object.values(EVENTS).filter(e => 
      e.rarity === rarity && !this.isOnCooldown(e.id)
    )
  }

  // Roll for event
  rollForEvent() {
    if (this.state.spinCount < this.state.nextEventAt) {
      return null
    }

    // Determine rarity
    const roll = Math.random() * 100
    let rarity
    if (roll < 70) rarity = 'COMMON'
    else if (roll < 95) rarity = 'RARE'
    else rarity = 'EPIC'

    const available = this.getAvailableEvents(rarity)
    if (available.length === 0) {
      // Fallback to any available
      const allAvailable = Object.values(EVENTS).filter(e => !this.isOnCooldown(e.id))
      if (allAvailable.length === 0) {
        this.scheduleNextEvent()
        return null
      }
      const event = allAvailable[Math.floor(Math.random() * allAvailable.length)]
      return this.triggerEvent(event)
    }

    const event = available[Math.floor(Math.random() * available.length)]
    return this.triggerEvent(event)
  }

  // Trigger an event
  triggerEvent(event) {
    // Set cooldown
    this.state.cooldowns[event.id] = this.state.spinCount + event.cooldownSpins
    
    // Add to history
    this.state.eventHistory = [
      { id: event.id, spin: this.state.spinCount, timestamp: Date.now() },
      ...this.state.eventHistory
    ].slice(0, 10)

    // Schedule next event (4-9 spins from now)
    this.scheduleNextEvent()
    
    this.saveState()
    return event
  }

  // Schedule next event trigger
  scheduleNextEvent() {
    this.state.nextEventAt = this.state.spinCount + 4 + Math.floor(Math.random() * 6)
  }

  // Process modifiers after spin
  processModifiers(result) {
    const activeMods = this.state.activeModifiers.filter(m => m.duration > 0)
    const expired = this.state.activeModifiers.filter(m => m.duration <= 0)
    
    // Decrease duration
    activeMods.forEach(m => m.duration--)
    
    this.state.activeModifiers = activeMods
    this.saveState()
    
    return { active: activeMods, expired }
  }

  // Get active modifier bonuses
  getModifierBonuses() {
    const bonuses = {
      streakBonus: 0,
      payoutBonus: 0,
      noXP: false,
    }
    
    for (const mod of this.state.activeModifiers) {
      if (mod.streakBonus) bonuses.streakBonus += mod.streakBonus
      if (mod.payoutBonus) bonuses.payoutBonus += mod.payoutBonus
      if (mod.noXP) bonuses.noXP = true
    }
    
    return bonuses
  }

  // Increment spin count and check for events
  onSpin(result = {}) {
    this.state.spinCount++
    
    // Process modifier durations
    this.processModifiers()
    
    // Check for new event
    const event = this.rollForEvent()
    
    this.saveState()
    
    return {
      event,
      modifiers: this.state.activeModifiers,
      bonuses: this.getModifierBonuses(),
    }
  }

  // Apply event effect
  applyEvent(event, currentState, spinResult) {
    if (!event.apply) return { ...currentState, toast: null }
    
    const result = event.apply(currentState, spinResult)
    
    // Handle modifiers
    let modifiers = currentState.modifiers || []
    if (result.modifiers) {
      modifiers = [...modifiers, ...result.modifiers]
      this.state.activeModifiers = modifiers
    }
    
    // Handle streak reset
    if (result.streakReset) {
      this.state.activeModifiers = this.state.activeModifiers.filter(m => m.id !== 'streakBonus')
    }
    
    this.saveState()
    
    return {
      ...currentState,
      chips: Math.max(0, (currentState.chips || 0) + (result.chips || 0)),
      xp: (currentState.xp || 0) + (result.xp || 0),
      modifiers,
      toast: result.toast,
    }
  }

  // Reset state
  reset() {
    this.state = this.createInitialState()
    this.saveState()
  }

  // Get state for display
  getState() {
    return {
      spinCount: this.state.spinCount,
      nextEventAt: this.state.nextEventAt,
      activeModifiers: this.state.activeModifiers,
      eventHistory: this.state.eventHistory,
    }
  }
}

// Singleton instance
export const eventsEngine = new EventsEngine()
