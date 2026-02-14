# Waifu Roulette Sprint 2 - Planning

## Red List (Unchanged)
- No real money
- No payments/cashout
- Fake chips only

## New Features

### Straight Bets
- Bet on single number 0-36
- Payout: 35:1 (bet 10 → win 350 + return 10 = 360 total)

### Zero Handling
- 0 is GREEN
- Loses all: Red, Black, Odd, Even, Dozens
- Wins only if bet on 0 directly

### Refactoring
- `rouletteEngine.js` - Pure spin logic
- `payoutResolver.js` - Pure payout calculation

### UI Enhancements
- Chip denominations: 10, 25, 50, 100
- Visual chip stacking
- Spin duration: 2000-4000ms random
- Session analytics panel

## Analytics Panel
- Total bets placed
- Win rate %
- Biggest single win
- Current streak (win/loss)
- Longest streak
