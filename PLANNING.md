# Waifu Roulette Lounge - Sprint Planning

## Red List (Prohibited)
- No real money transactions
- No payment processing
- No cashout functionality
- No connection to real banking
- No cryptocurrency
- No wagering with real value

## Payout Table
| Bet Type | Payout | Odds |
|----------|---------|------|
| Red/Black | 1:1 | 18/37 |
| Odd/Even | 1:1 | 18/37 |
| Dozens (1-12, 13-24, 25-36) | 2:1 | 12/37 |
| Single Number | 35:1 | 1/37 |

## State Machine
```
IDLE → (user places bet) → BET_PLACED
BET_PLACED → (user clicks spin) → SPINNING
SPINNING → (animation complete) → RESOLVED
RESOLVED → (payout complete) → IDLE
```

## Roulette Engine Rules
- Numbers: 0-36
- Red: 1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
- Black: 2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35
- Zero (0): Green - loses all even-money bets

## Bet Validation
- Minimum bet: 1 chip
- Maximum bet: Cannot exceed current bankroll
- Multiple bets allowed per spin
- Total bet cannot exceed bankroll

## localStorage Schema
```json
{
  "waifuRoulette": {
    "bankroll": 1000,
    "history": [{ "spin": 0, "result": 7, "color": "red", "net": 100 }],
    "settings": { "sound": true }
  }
}
```
