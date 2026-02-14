# Sprint 3 Planning - Showtime Upgrade

## UI Approach

### Roulette Wheel
- Use CSS transform for rotation
- Ease-out deceleration (cubic-bezier)
- Winning number highlight with glow effect
- Ball animation at end

### Betting Table
- Grid layout with click zones
- Red/Black rows (1-18, 19-36)
- Dozens columns
- Straight numbers 0-36 in grid
- Visual chip stacking on each zone

## Dealer Personality System

### Moods
- **HAPPY**: Win streak > 2, or big win (>100 chips)
- **NEUTRAL**: Default state
- **TILTED**: Loss streak > 3

### Lines Pool
```
HAPPY: ["Nice win! 🎉", "You're on fire! 🔥", "Another one! ✨", "Lucky you! 💕"]
NEUTRAL: ["Place your bets!", "Good luck!", "Let's go!", "Fingers crossed!"]
TILTED: ["Ouch...", "Better luck next time...", "Don't give up!", "The house always wins... or does it?"]
```

## Run Mode
- 10 automatic spins
- Track: total wagered, total won, net profit/loss
- Grade: S (>50% profit), A (>20%), B (>0%), C (break even), D (loss), F (>20% loss)
- Recap modal with stats

## Bet Zone Data Model
```js
{
  red: { amount: 0, chips: [] },
  black: { amount: 0, chips: [] },
  odd: { amount: 0, chips: [] },
  even: { amount: 0, chips: [] },
  first12: { amount: 0, chips: [] },
  second12: { amount: 0, chips: [] },
  third12: { amount: 0, chips: [] },
  straight: { 0: {amount: 0}, 1: {amount: 0}, ... }
}
```

## Undo Behavior
- Last bet can be undone with "Undo" button
- Removes chips from most recent zone clicked
- Cannot undo after spin starts
