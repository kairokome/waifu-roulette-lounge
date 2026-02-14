// ============= OUTFIT SYSTEM v1 =============
// Cosmetic outfits for the dealer - purely cosmetic, no gameplay impact

export const OUTFIT_TIERS = {
  TIER_1: { unlockLevel: 1, label: 'Lounge Standard' },
  TIER_2: { unlockLevel: 5, label: 'After Hours' },
  TIER_3: { unlockLevel: 10, label: '80s Icon' },
}

export const OUTFITS = {
  // Tier 1 - Lounge Standard
  outfit_blazer: {
    id: 'outfit_blazer',
    name: 'Velvet Blazer',
    description: 'Classic lounge elegance',
    tier: OUTFIT_TIERS.TIER_1,
    price: 200,
    colors: { primary: '#7c2d12', accent: '#dc2626' },
  },
  outfit_cocktail: {
    id: 'outfit_cocktail',
    name: 'Silk Cocktail',
    description: 'Smooth silk finish',
    tier: OUTFIT_TIERS.TIER_1,
    price: 250,
    colors: { primary: '#be185d', accent: '#f472b6' },
  },
  outfit_croupier: {
    id: 'outfit_croupier',
    name: 'Classic Croupier',
    description: 'Traditional casino style',
    tier: OUTFIT_TIERS.TIER_1,
    price: 180,
    colors: { primary: '#1f2937', accent: '#ef4444' },
  },
  outfit_neon_vest: {
    id: 'outfit_neon_vest',
    name: 'Neon Trim Vest',
    description: 'Subtle glow accents',
    tier: OUTFIT_TIERS.TIER_1,
    price: 300,
    colors: { primary: '#312e81', accent: '#06b6d4' },
  },

  // Tier 2 - After Hours
  outfit_jazz_dress: {
    id: 'outfit_jazz_dress',
    name: 'Midnight Jazz Dress',
    description: 'After-hours sophistication',
    tier: OUTFIT_TIERS.TIER_2,
    price: 450,
    colors: { primary: '#0f172a', accent: '#8b5cf6' },
  },
  outfit_street_jacket: {
    id: 'outfit_street_jacket',
    name: 'Leather Street Jacket',
    description: 'Urban edge',
    tier: OUTFIT_TIERS.TIER_2,
    price: 500,
    colors: { primary: '#451a03', accent: '#f97316' },
  },
  outfit_high_roller: {
    id: 'outfit_high_roller',
    name: 'High Roller Suit',
    description: 'Luxury redefined',
    tier: OUTFIT_TIERS.TIER_2,
    price: 550,
    colors: { primary: '#1c1917', accent: '#eab308' },
  },
  outfit_golden_lounge: {
    id: 'outfit_golden_lounge',
    name: 'Golden Lounge Gown',
    description: 'Pure elegance',
    tier: OUTFIT_TIERS.TIER_2,
    price: 600,
    colors: { primary: '#422006', accent: '#fbbf24' },
  },

  // Tier 3 - 80s Icon
  outfit_city_pop: {
    id: 'outfit_city_pop',
    name: 'City Pop Stage',
    description: '80s superstar vibes',
    tier: OUTFIT_TIERS.TIER_3,
    price: 800,
    colors: { primary: '#831843', accent: '#f472b6' },
  },
  outfit_bubble_gold: {
    id: 'outfit_bubble_gold',
    name: 'Bubble Economy Gold',
    description: 'Excess and luxury',
    tier: OUTFIT_TIERS.TIER_3,
    price: 1000,
    colors: { primary: '#713f12', accent: '#fbbf24' },
  },
}

// Load outfit state
export function loadOutfitState() {
  try {
    const saved = localStorage.getItem('waifuRouletteOutfits')
    if (saved) return JSON.parse(saved)
  } catch (e) { console.error('Load outfit error:', e) }
  return createInitialOutfitState()
}

export function createInitialOutfitState() {
  return {
    ownedOutfits: ['outfit_croupier'],
    equippedOutfit: 'outfit_croupier',
  }
}

export function saveOutfitState(state) {
  try {
    localStorage.setItem('waifuRouletteOutfits', JSON.stringify(state))
  } catch (e) { console.error('Save outfit error:', e) }
}

export function canAffordOutfit(outfitId, chips) {
  const outfit = OUTFITS[outfitId]
  if (!outfit) return { canAfford: false, reason: 'Not found' }
  return { canAfford: chips >= outfit.price, price: outfit.price }
}

export function purchaseOutfit(outfitId, chips, playerLevel, state) {
  const outfit = OUTFITS[outfitId]
  if (!outfit) return { success: false, reason: 'Not found' }
  if (state.ownedOutfits.includes(outfitId)) return { success: false, reason: 'Already owned' }
  if (playerLevel < outfit.tier.unlockLevel) return { success: false, reason: `Level ${outfit.tier.unlockLevel} required` }
  if (chips < outfit.price) return { success: false, reason: 'Not enough chips' }
  
  return {
    success: true,
    outfit,
    chips: chips - outfit.price,
    ownedOutfits: [...state.ownedOutfits, outfitId],
  }
}

export function equipOutfit(outfitId, state) {
  const outfit = OUTFITS[outfitId]
  if (!outfit) return { success: false, reason: 'Not found' }
  if (!state.ownedOutfits.includes(outfitId)) return { success: false, reason: 'Not owned' }
  
  return {
    success: true,
    equippedOutfit: outfitId,
  }
}
