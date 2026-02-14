// ============= SHOP ECONOMY =============
// Shop data model for Waifu Roulette Lounge

// Shop Tiers
export const SHOP_TIERS = {
  TIER_1: { unlockLevel: 2, label: 'Tier 1' },
  TIER_2: { unlockLevel: 5, label: 'Tier 2' },
  TIER_3: { unlockLevel: 10, label: 'Tier 3' },
  TIER_4: { unlockLevel: 15, label: 'Tier 4' },
}

// Item Types
export const ITEM_TYPES = {
  TABLE_SKIN: 'table_skin',
  BORDER_STYLE: 'border_style',
  DEALER_PERSONA: 'dealer_persona',
  COSMETIC_ITEM: 'cosmetic_item',
}

// Shop Catalog
export const SHOP_CATALOG = {
  // Table Skins
  table_ocean: {
    id: 'table_ocean',
    name: 'Deep Ocean',
    description: 'Calm blue waters',
    type: ITEM_TYPES.TABLE_SKIN,
    tier: SHOP_TIERS.TIER_1,
    price: 200,
    color: '#0a1f2d',
    border: '#0ea5e9',
  },
  table_sunset: {
    id: 'table_sunset',
    name: 'Sunset Blvd',
    description: 'Warm evening colors',
    type: ITEM_TYPES.TABLE_SKIN,
    tier: SHOP_TIERS.TIER_2,
    price: 350,
    color: '#2d1a0f',
    border: '#f97316',
  },
  table_neon: {
    id: 'table_neon',
    name: 'Neon Tokyo',
    description: 'Vibrant purple glow',
    type: ITEM_TYPES.TABLE_SKIN,
    tier: SHOP_TIERS.TIER_3,
    price: 600,
    color: '#1a0a2e',
    border: '#a855f7',
  },
  table_gold: {
    id: 'table_gold',
    name: 'Golden Fortune',
    description: 'Luxury gold finish',
    type: ITEM_TYPES.TABLE_SKIN,
    tier: SHOP_TIERS.TIER_4,
    price: 1200,
    color: '#2d2a0f',
    border: '#eab308',
  },

  // Border Styles
  border_pink: {
    id: 'border_pink',
    name: 'Neon Pink',
    description: 'Hot pink glow',
    type: ITEM_TYPES.BORDER_STYLE,
    tier: SHOP_TIERS.TIER_1,
    price: 150,
    class: 'border-pink-500',
  },
  border_cyan: {
    id: 'border_cyan',
    name: 'Cyber Cyan',
    description: 'Electric blue',
    type: ITEM_TYPES.BORDER_STYLE,
    tier: SHOP_TIERS.TIER_2,
    price: 400,
    class: 'border-cyan-500',
  },
  border_gold: {
    id: 'border_gold',
    name: 'Royal Gold',
    description: 'Regal golden edge',
    type: ITEM_TYPES.BORDER_STYLE,
    tier: SHOP_TIERS.TIER_3,
    price: 650,
    class: 'border-yellow-500',
  },

  // Cosmetic Items
  item_cassette: {
    id: 'item_cassette',
    name: 'Cassette Charm',
    description: '80s music vibes',
    type: ITEM_TYPES.COSMETIC_ITEM,
    tier: SHOP_TIERS.TIER_1,
    price: 120,
    icon: '📼',
  },
  item_ramen: {
    id: 'item_ramen',
    name: 'Ramen Pass',
    description: 'Free ramen coupon',
    type: ITEM_TYPES.COSMETIC_ITEM,
    tier: SHOP_TIERS.TIER_1,
    price: 180,
    icon: '🍜',
  },
  item_neon_tag: {
    id: 'item_neon_tag',
    name: 'Shibuya Neon Tag',
    description: 'Glowing city tag',
    type: ITEM_TYPES.COSMETIC_ITEM,
    tier: SHOP_TIERS.TIER_2,
    price: 260,
    icon: '🏮',
  },
  item_vinyl: {
    id: 'item_vinyl',
    name: 'City Pop Vinyl',
    description: 'Rare collector\'s item',
    type: ITEM_TYPES.COSMETIC_ITEM,
    tier: SHOP_TIERS.TIER_3,
    price: 400,
    icon: '💿',
  },
  item_watch: {
    id: 'item_watch',
    name: 'Bubble Era Watch',
    description: 'Luxury timepiece',
    type: ITEM_TYPES.COSMETIC_ITEM,
    tier: SHOP_TIERS.TIER_4,
    price: 700,
    icon: '⌚',
  },
  item_banner: {
    id: 'item_banner',
    name: 'Midnight Kanji',
    description: 'Mysterious banner',
    type: ITEM_TYPES.COSMETIC_ITEM,
    tier: SHOP_TIERS.TIER_4,
    price: 950,
    icon: '🏴',
  },
}

// Load shop state
export function loadShopState() {
  try {
    const saved = localStorage.getItem('waifuRouletteShop')
    if (saved) return JSON.parse(saved)
  } catch (e) { console.error('Load shop error:', e) }
  return createInitialShopState()
}

export function createInitialShopState() {
  return {
    ownedItems: {},
    equipped: {
      tableSkin: 'default',
      border: 'default',
      cosmeticItems: [],
    },
  }
}

export function saveShopState(state) {
  try {
    localStorage.setItem('waifuRouletteShop', JSON.stringify(state))
  } catch (e) { console.error('Save shop error:', e) }
}

// Check if player can afford item
export function canAfford(itemId, chips) {
  const item = SHOP_CATALOG[itemId]
  if (!item) return { canAfford: false, reason: 'Item not found' }
  return {
    canAfford: chips >= item.price,
    price: item.price,
    reason: chips >= item.price ? null : 'Not enough chips',
  }
}

// Check if player meets level requirement
export function meetsLevelRequirement(itemId, playerLevel) {
  const item = SHOP_CATALOG[itemId]
  if (!item) return false
  return playerLevel >= item.tier.unlockLevel
}

// Purchase item
export function purchaseItem(itemId, currentChips, currentLevel, shopState) {
  const item = SHOP_CATALOG[itemId]
  
  if (!item) {
    return { success: false, reason: 'Item not found', chips: currentChips }
  }
  
  if (shopState.ownedItems[itemId]) {
    return { success: false, reason: 'Already owned', chips: currentChips }
  }
  
  if (currentLevel < item.tier.unlockLevel) {
    return { success: false, reason: `Requires Level ${item.tier.unlockLevel}`, chips: currentChips }
  }
  
  if (currentChips < item.price) {
    return { success: false, reason: 'Not enough chips', chips: currentChips }
  }
  
  // Deduct chips and add to inventory
  const newChips = currentChips - item.price
  const newOwnedItems = { ...shopState.ownedItems, [itemId]: true }
  
  return {
    success: true,
    item: item,
    chips: newChips,
    ownedItems: newOwnedItems,
    toast: { title: 'Purchased!', text: item.name, type: 'positive' },
  }
}

// Equip item
export function equipItem(itemId, shopState) {
  const item = SHOP_CATALOG[itemId]
  
  if (!item) {
    return { success: false, reason: 'Item not found' }
  }
  
  if (!shopState.ownedItems[itemId]) {
    return { success: false, reason: 'Item not owned' }
  }
  
  const newEquipped = { ...shopState.equipped }
  
  switch (item.type) {
    case ITEM_TYPES.TABLE_SKIN:
      newEquipped.tableSkin = itemId
      break
    case ITEM_TYPES.BORDER_STYLE:
      newEquipped.border = itemId
      break
    case ITEM_TYPES.COSMETIC_ITEM:
      if (!newEquipped.cosmeticItems.includes(itemId)) {
        newEquipped.cosmeticItems = [...newEquipped.cosmeticItems, itemId]
      }
      break
    default:
      return { success: false, reason: 'Unknown item type' }
  }
  
  return {
    success: true,
    equipped: newEquipped,
    toast: { title: 'Equipped!', text: item.name, type: 'positive' },
  }
}

// Get available items for player level
export function getAvailableItems(playerLevel) {
  return Object.values(SHOP_CATALOG).filter(item => 
    item.tier.unlockLevel <= playerLevel
  )
}

// Get locked items for player level
export function getLockedItems(playerLevel) {
  return Object.values(SHOP_CATALOG).filter(item => 
    item.tier.unlockLevel > playerLevel
  )
}
