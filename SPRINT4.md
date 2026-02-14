# Sprint 4 Planning - Live Event Casino Mode

## Event System
Events modify payout multipliers and visual theme. One active per session.

### Event Types
- **Lucky Day**: 1.5x all payouts
- **Hot Streak**: Red/Black 2x, others normal
- **Cold Numbers**: Dozens 2x
- **Double Zero**: Both zeros active (0, 00) - special mode
- **VIP Night**: Straight bets 40x (instead of 35x)

### Event Config Schema
```js
{
  id: 'lucky_day',
  name: 'Lucky Day',
  multiplier: 1.5,
  theme: { accent: 'gold', glow: true },
  description: '1.5x payouts!'
}
```

## Risk Mode
- Toggle for "Double or Nothing"
- On win: payout * 2
- On loss: loss * 2
- Stacks with event modifiers

## Hot/Cold Numbers
- Track last 50 spins
- Top 3 hot (most frequent)
- Bottom 3 cold (least frequent)
- Display with visual heat indicators

## Achievements
- first_straight: Hit a straight bet
- five_wins: 5 win streak
- profit_500: Reach +500 chips from starting
- spin_100: Play 100 spins
- big_win: Win 100+ chips single spin
- lucky_day: Win on Lucky Day event

## Mobile Layout
- Single column on < 640px
- Wheel scales to fit
- Dealer below wheel
- Full-width betting table
