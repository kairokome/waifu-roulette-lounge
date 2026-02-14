import { useState, useEffect, useCallback } from 'react'
import { Coins, RotateCcw, Volume2, VolumeX, Trophy, TrendingUp, Target, Flame } from 'lucide-react'
import { 
  spinRoulette, 
  getRandomSpinDuration, 
  getNumberColor,
  CHIP_DENOMINATIONS,
  DEFAULT_BET_AMOUNTS 
} from './rouletteEngine'
import { 
  calculatePayouts, 
  createInitialAnalytics, 
  updateAnalytics, 
  getWinRate 
} from './payoutResolver'

const INITIAL_BANKROLL = 1000

// ============= LOCAL STORAGE =============
function loadGameState() {
  try {
    const saved = localStorage.getItem('waifuRoulette')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load:', e)
  }
  return null
}

function saveGameState(state) {
  try {
    localStorage.setItem('waifuRoulette', JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save:', e)
  }
}

// ============= COMPONENTS =============
const DealerAvatar = ({ mood }) => {
  const moods = { happy: '😊', excited: '😄', neutral: '😐', sad: '😢', shocked: '😱', winning: '🥳', losing: '😤' }
  return <div className="text-8xl animate-bounce-slow filter drop-shadow-lg">{moods[mood] || '🎰'}</div>
}

const SpeechBubble = ({ message, visible }) => {
  if (!visible) return null
  return (
    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-4 py-2 rounded-xl shadow-lg z-20">
      {message}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-white"></div>
    </div>
  )
}

const MoodMeter = ({ mood }) => {
  const colors = { happy: 'bg-green-400', excited: 'bg-yellow-400', neutral: 'bg-gray-400', sad: 'bg-blue-400', shocked: 'bg-red-400', winning: 'bg-pink-400', losing: 'bg-purple-400' }
  const widths = { happy: 90, excited: 80, neutral: 50, sad: 30, shocked: 95, winning: 100, losing: 20 }
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Mood</span>
      <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${colors[mood]} transition-all duration-500`} style={{ width: `${widths[mood]}%` }}></div>
      </div>
    </div>
  )
}

const RouletteWheel = ({ spinning, result }) => {
  const numbers = Array.from({ length: 37 }, (_, i) => i)
  const getColor = (n) => n === 0 ? 'bg-green-500' : (RED_NUMBERS.includes(n) ? 'bg-red-600' : 'bg-gray-800')
  const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
  
  return (
    <div className="relative w-64 h-64 rounded-full border-8 border-yellow-600 bg-gray-900 flex items-center justify-center overflow-hidden shadow-2xl">
      <div className={`absolute inset-0 transition-transform ${spinning ? 'animate-spin-slow' : ''}`}
           style={{ animationDuration: spinning ? '2s' : '0s', animationTimingFunction: 'ease-out' }}>
        {numbers.map((num, i) => {
          const angle = (i * 360) / 37
          return (
            <div key={num} className={`absolute w-7 h-7 ${getColor(num)} rounded-full flex items-center justify-center text-xs font-bold text-white`}
                 style={{ top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-100px) rotate(-${angle}deg)` }}>
              {num}
            </div>
          )
        })}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center shadow-inner z-10">
          <span className="text-2xl font-bold text-yellow-900">{result !== null ? result : '🎰'}</span>
        </div>
      </div>
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-yellow-500 z-20"></div>
    </div>
  )
}

const ChipSelector = ({ selected, onSelect }) => (
  <div className="flex justify-center gap-2 mb-4">
    {CHIP_DENOMINATIONS.map(denom => (
      <button key={denom} onClick={() => onSelect(denom)}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                selected === denom 
                  ? 'bg-yellow-400 text-yellow-900 scale-110 shadow-lg shadow-yellow-400/50' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}>
        {denom}
      </button>
    ))}
  </div>
)

const ChipStack = ({ amount }) => {
  if (amount <= 0) return null
  const stacks = Math.min(Math.ceil(amount / 100), 3)
  return (
    <div className="relative w-8 h-8">
      {Array.from({ length: stacks }).map((_, i) => (
        <div key={i} className="absolute w-8 h-2 bg-yellow-500 rounded-full border border-yellow-400"
             style={{ bottom: `${i * 4}px`, zIndex: stacks - i }}></div>
      ))}
    </div>
  )
}

const AnalyticsPanel = ({ analytics }) => {
  const winRate = getWinRate(analytics)
  return (
    <div className="bg-black/40 rounded-xl p-4 mt-4">
      <h3 className="font-orbitron text-pink-400 text-sm mb-3 flex items-center">
        <TrendingUp className="w-4 h-4 mr-2" /> SESSION ANALYTICS
      </h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-800/50 rounded p-2">
          <span className="text-gray-400">Win Rate</span>
          <div className="text-xl font-bold text-green-400">{winRate}%</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2">
          <span className="text-gray-400">Spins</span>
          <div className="text-xl font-bold text-white">{analytics.totalSpins}</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2">
          <span className="text-gray-400">Biggest Win</span>
          <div className="text-xl font-bold text-yellow-400">{analytics.biggestWin}</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2">
          <span className="text-gray-400">Current Streak</span>
          <div className={`text-xl font-bold ${analytics.currentStreakType === 'win' ? 'text-green-400' : analytics.currentStreakType === 'loss' ? 'text-red-400' : 'text-gray-400'}`}>
            {analytics.currentStreak > 0 ? `${analytics.currentStreak} ${analytics.currentStreakType === 'win' ? '🔥' : '💨'}` : '-'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============= MAIN APP =============
function App() {
  const [bankroll, setBankroll] = useState(() => loadGameState()?.bankroll || INITIAL_BANKROLL)
  const [history, setHistory] = useState(() => loadGameState()?.history || [])
  const [analytics, setAnalytics] = useState(() => loadGameState()?.analytics || createInitialAnalytics())
  const [bets, setBets] = useState({ ...DEFAULT_BET_AMOUNTS, straight: {} })
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [mood, setMood] = useState('neutral')
  const [speech, setSpeech] = useState('')
  const [showSpeech, setShowSpeech] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [chipDenom, setChipDenom] = useState(10)
  const [showStraightBet, setShowStraightBet] = useState(false)
  const [straightBetInput, setStraightBetInput] = useState('')
  
  const totalBet = Object.values(bets).reduce((sum, val) => {
    if (typeof val === 'object') return sum + Object.values(val).reduce((a, b) => a + b, 0)
    return sum + val
  }, 0)
  
  // Save on change
  useEffect(() => {
    saveGameState({ bankroll, history, analytics, settings: { sound: soundEnabled } })
  }, [bankroll, history, analytics, soundEnabled])
  
  // Place bet helper
  const placeBet = useCallback((type, amount) => {
    if (spinning || amount <= 0) return
    const currentTotal = totalBet + amount
    if (currentTotal > bankroll) {
      setSpeech('Not enough chips!')
      setShowSpeech(true)
      setTimeout(() => setShowSpeech(false), 2000)
      return
    }
    
    if (type === 'straight') {
      setBets(prev => ({
        ...prev,
        straight: { ...prev.straight, [straightBetInput]: (prev.straight[straightBetInput] || 0) + amount }
      }))
    } else {
      setBets(prev => ({ ...prev, [type]: prev[type] + amount }))
    }
  }, [spinning, totalBet, bankroll, straightBetInput])
  
  // Quick bet buttons
  const BetButton = ({ label, type, color }) => (
    <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2 mb-1">
      <span className={`font-bold text-sm ${color}`}>{label}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => placeBet(type, -chipDenom)} className="bg-gray-700 hover:bg-gray-600 w-6 h-6 rounded text-xs" disabled={spinning}>-</button>
        <span className="w-10 text-center text-yellow-400 text-sm">{type === 'straight' ? ' Straight' : (bets[type] || 0)}</span>
        <button onClick={() => placeBet(type, chipDenom)} className="bg-gray-700 hover:bg-gray-600 w-6 h-6 rounded text-xs" disabled={spinning}>+</button>
      </div>
    </div>
  )
  
  // Dozen buttons
  const DozenButton = ({ label, type }) => (
    <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2 mb-1">
      <span className="font-bold text-sm text-orange-400">{label}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => placeBet(type, -chipDenom)} className="bg-gray-700 hover:bg-gray-600 w-6 h-6 rounded text-xs" disabled={spinning}>-</button>
        <span className="w-10 text-center text-yellow-400 text-sm">{bets[type]}</span>
        <button onClick={() => placeBet(type, chipDenom)} className="bg-gray-700 hover:bg-gray-600 w-6 h-6 rounded text-xs" disabled={spinning}>+</button>
      </div>
    </div>
  )
  
  // Straight bet panel
  const StraightBetPanel = () => (
    <div className="mt-4 pt-4 border-t border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-purple-400 font-bold">Straight Bet (35:1)</span>
        <button onClick={() => setShowStraightBet(!showStraightBet)} className="text-xs text-gray-400">
          {showStraightBet ? '▼ Hide' : '▲ Show'}
        </button>
      </div>
      {showStraightBet && (
        <div>
          <div className="flex gap-2 mb-2">
            <input type="number" min="0" max="36" value={straightBetInput}
                   onChange={(e) => setStraightBetInput(e.target.value)}
                   placeholder="0-36" className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center text-white text-sm" />
            <button onClick={() => placeBet('straight', chipDenom)} disabled={spinning || straightBetInput === ''}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 rounded text-white text-sm py-1">
              Bet {chipDenom}
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 37 }, (_, i) => (
              <button key={i} onClick={() => { setStraightBetInput(String(i)); placeBet('straight', chipDenom) }}
                      disabled={spinning}
                      className={`w-6 h-6 rounded-full text-xs font-bold ${
                        getNumberColor(i) === 'red' ? 'bg-red-600' : getNumberColor(i) === 'black' ? 'bg-gray-800' : 'bg-green-600'
                      } text-white ${bets.straight[i] > 0 ? 'ring-2 ring-yellow-400' : ''}`}>
                {i}
              </button>
            ))}
          </div>
          {Object.entries(bets.straight).filter(([_, v]) => v > 0).map(([num, amt]) => (
            <div key={num} className="flex justify-between text-xs mt-1">
              <span className="text-purple-400">Number {num}</span>
              <span className="text-yellow-400">{amt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
  
  const clearBets = () => { if (!spinning) setBets({ ...DEFAULT_BET_AMOUNTS, straight: {} }) }
  
  const spin = () => {
    if (spinning || totalBet === 0) return
    
    const duration = getRandomSpinDuration()
    setSpinning(true)
    setMood('excited')
    setSpeech('Good luck!')
    setShowSpeech(true)
    
    let spinCount = 0
    const spinInterval = setInterval(() => {
      setResult(Math.floor(Math.random() * 37))
      spinCount++
      if (spinCount > Math.floor(duration / 80)) {
        clearInterval(spinInterval)
        
        const spinResult = spinRoulette()
        setResult(spinResult.number)
        
        const payout = calculatePayouts(spinResult, bets)
        const newBankroll = bankroll + payout.netGain
        
        setBankroll(newBankroll)
        
        const newHistory = [{ spin: history.length + 1, number: spinResult.number, color: spinResult.color, result: payout.netGain }, ...history].slice(0, 10)
        setHistory(newHistory)
        
        const newAnalytics = updateAnalytics(analytics, payout)
        setAnalytics(newAnalytics)
        
        setTimeout(() => {
          setSpinning(false)
          
          if (payout.isWin) {
            setMood(payout.netGain > 100 ? 'winning' : 'happy')
            setSpeech(`You won ${payout.netGain} chips! 🎉`)
          } else if (payout.isLoss) {
            setMood('losing')
            setSpeech(`Lost ${Math.abs(payout.netGain)}... Try again!`)
          } else {
            setMood('neutral')
            setSpeech('Push - no change')
          }
          
          setTimeout(() => setShowSpeech(false), 3000)
          clearBets()
        }, 1500)
      }
    }, 80)
  }
  
  const resetGame = () => {
    if (spinning) return
    setBankroll(INITIAL_BANKROLL)
    setHistory([])
    setAnalytics(createInitialAnalytics())
    clearBets()
    setMood('neutral')
    setSpeech('Game reset! Good luck!')
    setShowSpeech(true)
    setTimeout(() => setShowSpeech(false), 2000)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-sm border-b border-pink-500/30 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center">
            <span className="text-4xl mr-3">🎰</span>
            <div>
              <h1 className="font-orbitron font-bold text-2xl text-pink-400">WAIFU ROULETTE</h1>
              <p className="text-pink-300/60 text-xs">♥ Lounge Edition</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-black/40 px-4 py-2 rounded-full">
              <Coins className="text-yellow-400 mr-2" />
              <span className="font-orbitron text-2xl text-yellow-400">{bankroll.toLocaleString()}</span>
              <span className="text-yellow-600/60 ml-1">CHIPS</span>
            </div>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-full bg-black/40">
              {soundEnabled ? <Volume2 className="text-pink-400" /> : <VolumeX className="text-gray-500" />}
            </button>
            <button onClick={resetGame} className="p-2 rounded-full bg-black/40 hover:bg-red-900/60" disabled={spinning}>
              <RotateCcw className="text-pink-400" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Dealer + Analytics */}
          <div className="space-y-4">
            <div className="bg-black/40 rounded-2xl p-6 flex flex-col items-center">
              <h2 className="font-orbitron text-pink-400 mb-4">DEALER</h2>
              <div className="relative mb-4">
                <DealerAvatar mood={mood} />
                <SpeechBubble message={speech} visible={showSpeech} />
              </div>
              <MoodMeter mood={mood} />
            </div>
            
            <AnalyticsPanel analytics={analytics} />
          </div>
          
          {/* CENTER: Wheel */}
          <div className="bg-black/40 rounded-2xl p-6 flex flex-col items-center">
            <h2 className="font-orbitron text-pink-400 mb-4">ROULETTE</h2>
            <RouletteWheel spinning={spinning} result={result} />
            
            <button onClick={spin} disabled={spinning || totalBet === 0}
                    className={`mt-6 px-8 py-3 rounded-full font-orbitron font-bold text-xl transition-all ${
                      spinning || totalBet === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-lg hover:shadow-pink-500/50'
                    }`}>
              {spinning ? 'SPINNING...' : totalBet === 0 ? 'PLACE BETS' : 'SPIN!'}
            </button>
            
            <div className="mt-6 w-full">
              <h3 className="text-gray-400 text-sm mb-2 text-center">LAST 10 SPINS</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {history.length === 0 ? (
                  <span className="text-gray-500 text-sm">No spins yet</span>
                ) : (
                  history.map((h, i) => (
                    <span key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      h.color === 'red' ? 'bg-red-600' : h.color === 'black' ? 'bg-gray-800' : 'bg-green-600'
                    } text-white`}>
                      {h.number}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* RIGHT: Bets */}
          <div className="bg-black/40 rounded-2xl p-6">
            <h2 className="font-orbitron text-pink-400 mb-2">BETS</h2>
            <div className="text-center mb-4 pb-4 border-b border-gray-700">
              <span className="text-gray-400">Total: </span>
              <span className="text-yellow-400 font-orbitron text-xl">{totalBet}</span>
            </div>
            
            <ChipSelector selected={chipDenom} onSelect={setChipDenom} />
            
            <BetButton label="🔴 Red" type="red" color="text-red-400" />
            <BetButton label="⚫ Black" type="black" color="text-gray-400" />
            <BetButton label="Odd" type="odd" color="text-pink-400" />
            <BetButton label="Even" type="even" color="text-blue-400" />
            
            <div className="my-4 border-t border-gray-700 pt-4">
              <p className="text-gray-400 text-sm mb-2">Dozens (2:1)</p>
              <DozenButton label="1-12" type="first12" />
              <DozenButton label="13-24" type="second12" />
              <DozenButton label="25-36" type="third12" />
            </div>
            
            <StraightBetPanel />
            
            {totalBet > 0 && !spinning && (
              <button onClick={clearBets} className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300">
                Clear Bets
              </button>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500 text-center">
              Red/Black, Odd/Even: 1:1 • Dozens: 2:1 • Straight: 35:1
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-black/40 border-t border-pink-500/30 py-4 mt-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-pink-300/60 text-sm">🎮 Entertainment only. No real wagering. Fake chips have no value. 🎮</p>
        </div>
      </footer>
    </div>
  )
}

export default App
