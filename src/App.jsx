import { useState, useEffect, useCallback, useRef } from 'react'
import { Coins, RotateCcw, Volume2, VolumeX, Trophy, TrendingUp, Share2, Play, X, Copy, Check } from 'lucide-react'
import { 
  spinRoulette, 
  getRandomSpinDuration, 
  getNumberColor,
  CHIP_DENOMINATIONS,
  DEFAULT_BET_AMOUNTS,
  RED_NUMBERS,
  BLACK_NUMBERS
} from './rouletteEngine'
import { 
  calculatePayouts, 
  createInitialAnalytics, 
  updateAnalytics, 
  getWinRate 
} from './payoutResolver'

const INITIAL_BANKROLL = 1000

// ============= DEALER PERSONALITY =============
const DEALER_LINES = {
  happy: ["Nice win! 🎉", "You're on fire! 🔥", "Another one! ✨", "Lucky you! 💕", "Amazing! 🌟"],
  neutral: ["Place your bets!", "Good luck!", "Let's go!", "Fingers crossed!", "Ready when you are!"],
  tilted: ["Ouch...", "Better luck next time...", "Don't give up!", "The house always wins... 🤔", "It's just a phase!"],
  winning: ["Jackpot! 💰", "INCREDIBLE! 🎊", "You're a legend! 👑", "Big winner! ⭐"],
  losing: ["Tough break...", "The wheel spins for everyone...", "We'll get 'em next time!", "Chin up! 💪"]
}

const GRADES = [
  { min: 50, grade: 'S', label: 'LEGENDARY! 🏆', color: 'text-yellow-400' },
  { min: 20, grade: 'A', label: 'Excellent! 🌟', color: 'text-green-400' },
  { min: 0, grade: 'B', label: 'Good job! 👍', color: 'text-blue-400' },
  { min: -20, grade: 'C', label: 'Break even 😐', color: 'text-gray-400' },
  { min: -50, grade: 'D', label: 'Ouch... 😢', color: 'text-orange-400' },
  { min: -Infinity, grade: 'F', label: 'RUN COMPLETE 💀', color: 'text-red-500' }
]

// ============= LOCAL STORAGE =============
function loadGameState() {
  try {
    const saved = localStorage.getItem('waifuRoulette')
    if (saved) return JSON.parse(saved)
  } catch (e) { console.error('Load error:', e) }
  return null
}

function saveGameState(state) {
  try { localStorage.setItem('waifuRoulette', JSON.stringify(state)) } 
  catch (e) { console.error('Save error:', e) }
}

// ============= COMPONENTS =============
const DealerAvatar = ({ mood }) => {
  const moods = { 
    happy: { emoji: '😊', size: 'text-8xl' },
    excited: { emoji: '😄', size: 'text-8xl' },
    winning: { emoji: '🥳', size: 'text-8xl' },
    neutral: { emoji: '😐', size: 'text-8xl' },
    tilted: { emoji: '😤', size: 'text-8xl' },
    losing: { emoji: '😢', size: 'text-8xl' },
    shocked: { emoji: '😱', size: 'text-8xl' }
  }
  const m = moods[mood] || moods.neutral
  return <div className={`${m.size} animate-bounce-slow filter drop-shadow-lg`}>{m.emoji}</div>
}

const SpeechBubble = ({ message, visible }) => {
  if (!visible) return null
  return (
    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-4 py-2 rounded-xl shadow-lg z-20 whitespace-nowrap">
      {message}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-white"></div>
    </div>
  )
}

const MoodMeter = ({ mood }) => {
  const colors = { happy: 'bg-green-400', excited: 'bg-yellow-400', winning: 'bg-pink-400', neutral: 'bg-gray-400', tilted: 'bg-orange-400', losing: 'bg-blue-400', shocked: 'bg-red-400' }
  const widths = { happy: 90, excited: 80, winning: 100, neutral: 50, tilted: 30, losing: 20, shocked: 95 }
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Mood</span>
      <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${colors[mood]} transition-all duration-500`} style={{ width: `${widths[mood]}%` }}></div>
      </div>
    </div>
  )
}

// ============= ROULETTE WHEEL =============
const RouletteWheel = ({ spinning, result, spinAngle }) => {
  const numbers = Array.from({ length: 37 }, (_, i) => i)
  return (
    <div className="relative w-72 h-72 rounded-full border-8 border-yellow-600 bg-gray-900 flex items-center justify-center overflow-hidden shadow-2xl">
      {/* Spinning wheel */}
      <div 
        className={`absolute inset-0 transition-transform`}
        style={{ 
          transform: `rotate(${spinAngle}deg)`,
          transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
        }}
      >
        {numbers.map((num, i) => {
          const angle = (i * 360) / 37
          const color = num === 0 ? '#22c55e' : RED_NUMBERS.includes(num) ? '#dc2626' : '#374151'
          return (
            <div key={num} className="absolute w-8 h-8 flex items-center justify-center text-xs font-bold text-white"
                 style={{
                   top: '50%', left: '50%',
                   transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-115px) rotate(-${angle}deg)`,
                   backgroundColor: color,
                   borderRadius: '50%'
                 }}>
              {num}
            </div>
          )
        })}
      </div>
      
      {/* Center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center shadow-inner z-10 border-4 border-yellow-400">
          <span className="text-3xl font-bold text-yellow-900">{result !== null ? result : '🎰'}</span>
        </div>
      </div>
      
      {/* Pointer */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-10 border-r-10 border-b-20 border-l-transparent border-r-transparent border-b-yellow-500 z-20"></div>
    </div>
  )
}

// ============= BETTING TABLE =============
const BettingTable = ({ bets, onBet, chipDenom }) => {
  const numbers = Array.from({ length: 37 }, (_, i) => i)
  
  return (
    <div className="bg-green-800 rounded-xl p-2 text-xs">
      {/* Zero */}
      <div className="flex justify-center mb-1">
        <button onClick={() => onBet('straight', 0)} 
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                  bets[0]?.amount > 0 ? 'ring-2 ring-yellow-400 scale-105' : 'bg-green-500 hover:bg-green-400'
                }`}>
          0
          {bets[0]?.amount > 0 && <span className="absolute -top-1 -right-1 bg-yellow-400 text-green-900 rounded-full w-4 h-4 text-xs">{bets[0].amount}</span>}
        </button>
      </div>
      
      {/* Numbers grid */}
      <div className="grid grid-cols-6 gap-0.5 mb-1">
        {numbers.slice(1).map(num => {
          const color = RED_NUMBERS.includes(num) ? 'bg-red-600' : 'bg-gray-800'
          return (
            <button key={num} onClick={() => onBet('straight', num)}
                    className={`${color} h-8 rounded flex items-center justify-center text-white font-bold hover:brightness-125 transition-all relative ${
                      bets[num]?.amount > 0 ? 'ring-2 ring-yellow-400' : ''
                    }`}>
              {num}
              {bets[num]?.amount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-green-900 rounded-full w-4 h-4 text-xs flex items-center justify-center">
                  {bets[num].amount >= 100 ? '✓' : bets[num].amount}
                </span>
              )}
            </button>
          )
        })}
      </div>
      
      {/* Outside bets */}
      <div className="grid grid-cols-3 gap-1 mt-2">
        <button onClick={() => onBet('first12')} className={`bg-blue-600 h-10 rounded hover:brightness-125 ${bets.first12 > 0 ? 'ring-2 ring-yellow-400' : ''}`}>
          <span className="text-white font-bold">1st 12</span>
          {bets.first12 > 0 && <span className="block text-yellow-300 text-xs">{bets.first12}</span>}
        </button>
        <button onClick={() => onBet('second12')} className={`bg-blue-600 h-10 rounded hover:brightness-125 ${bets.second12 > 0 ? 'ring-2 ring-yellow-400' : ''}`}>
          <span className="text-white font-bold">2nd 12</span>
          {bets.second12 > 0 && <span className="block text-yellow-300 text-xs">{bets.second12}</span>}
        </button>
        <button onClick={() => onBet('third12')} className={`bg-blue-600 h-10 rounded hover:brightness-125 ${bets.third12 > 0 ? 'ring-2 ring-yellow-400' : ''}`}>
          <span className="text-white font-bold">3rd 12</span>
          {bets.third12 > 0 && <span className="block text-yellow-300 text-xs">{bets.third12}</span>}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-1 mt-1">
        <button onClick={() => onBet('odd')} className={`h-10 rounded font-bold text-white transition-all ${bets.odd > 0 ? 'bg-pink-500 ring-2 ring-yellow-400' : 'bg-pink-700 hover:bg-pink-600'}`}>
          ODD {bets.odd > 0 && `(${bets.odd})`}
        </button>
        <button onClick={() => onBet('even')} className={`h-10 rounded font-bold text-white transition-all ${bets.even > 0 ? 'bg-blue-500 ring-2 ring-yellow-400' : 'bg-blue-700 hover:bg-blue-600'}`}>
          EVEN {bets.even > 0 && `(${bets.even})`}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-1 mt-1">
        <button onClick={() => onBet('red')} className={`h-10 rounded font-bold transition-all ${bets.red > 0 ? 'ring-2 ring-yellow-400' : 'bg-red-600 hover:bg-red-500'}`}>
          🔴 RED {bets.red > 0 && `(${bets.red})`}
        </button>
        <button onClick={() => onBet('black')} className={`h-10 rounded font-bold text-gray-200 transition-all ${bets.black > 0 ? 'ring-2 ring-yellow-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
          ⚫ BLACK {bets.black > 0 && `(${bets.black})`}
        </button>
      </div>
    </div>
  )
}

// ============= SHARE CARD =============
const ShareCard = ({ result, bankroll, onClose }) => {
  const [copied, setCopied] = useState(false)
  
  const text = `🎰 Waifu Roulette Results 🎰
Number: ${result.number} (${result.color.toUpperCase()})
Bankroll: ${bankroll.toLocaleString()} chips

🎮 waifu-roulette-lounge`
  
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-900 to-pink-900 p-6 rounded-2xl max-w-sm w-full mx-4 border-2 border-pink-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-orbitron text-xl text-pink-400">Result Card</h3>
          <button onClick={onClose}><X className="text-gray-400" /></button>
        </div>
        
        <div className="text-center mb-4">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl font-bold mb-2 ${
            result.color === 'red' ? 'bg-red-600' : result.color === 'black' ? 'bg-gray-800' : 'bg-green-600'
          } text-white`}>
            {result.number}
          </div>
          <p className="text-gray-300">{result.color.toUpperCase()}</p>
        </div>
        
        <button onClick={copy} className="w-full bg-pink-600 hover:bg-pink-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  )
}

// ============= RUN RECAP MODAL =============
const RunRecapModal = ({ runResults, bankroll, onClose }) => {
  const totalWagered = runResults.reduce((sum, r) => sum + r.bet, 0)
  const totalWon = runResults.reduce((sum, r) => sum + (r.result > 0 ? r.result : 0), 0)
  const netProfit = totalWon - totalWagered
  const profitPercent = totalWagered > 0 ? Math.round((netProfit / totalWagered) * 100) : 0
  
  const grade = GRADES.find(g => profitPercent >= g.min)
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-900 to-pink-900 p-6 rounded-2xl max-w-md w-full mx-4 border-2 border-pink-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-orbitron text-xl text-pink-400">Run Complete!</h3>
          <button onClick={onClose}><X className="text-gray-400" /></button>
        </div>
        
        <div className="text-center mb-6">
          <div className={`text-6xl font-orbitron mb-2 ${grade.color}`}>{grade.grade}</div>
          <div className="text-gray-300">{grade.label}</div>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between bg-black/30 p-3 rounded">
            <span className="text-gray-400">Spins</span>
            <span className="text-white font-bold">{runResults.length}</span>
          </div>
          <div className="flex justify-between bg-black/30 p-3 rounded">
            <span className="text-gray-400">Total Wagered</span>
            <span className="text-yellow-400 font-bold">{totalWagered.toLocaleString()}</span>
          </div>
          <div className="flex justify-between bg-black/30 p-3 rounded">
            <span className="text-gray-400">Total Won</span>
            <span className="text-green-400 font-bold">{totalWon.toLocaleString()}</span>
          </div>
          <div className="flex justify-between bg-black/30 p-3 rounded">
            <span className="text-gray-400">Net Profit</span>
            <span className={`font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()} ({profitPercent}%)
            </span>
          </div>
          <div className="flex justify-between bg-black/30 p-3 rounded">
            <span className="text-gray-400">Final Bankroll</span>
            <span className="text-yellow-400 font-bold">{bankroll.toLocaleString()}</span>
          </div>
        </div>
        
        <button onClick={onClose} className="w-full bg-pink-600 hover:bg-pink-500 text-white py-3 rounded-xl font-bold">
          Continue Playing
        </button>
      </div>
    </div>
  )
}

// ============= MAIN APP =============
function App() {
  // State
  const [bankroll, setBankroll] = useState(() => loadGameState()?.bankroll || INITIAL_BANKROLL)
  const [history, setHistory] = useState(() => loadGameState()?.history || [])
  const [analytics, setAnalytics] = useState(() => loadGameState()?.analytics || createInitialAnalytics())
  const [bets, setBets] = useState(() => ({ 
    red: 0, black: 0, odd: 0, even: 0, 
    first12: 0, second12: 0, third12: 0,
    ...Object.fromEntries(Array.from({length: 37}, (_, i) => [i, 0]))
  }))
  const [betHistory, setBetHistory] = useState([])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [spinAngle, setSpinAngle] = useState(0)
  const [mood, setMood] = useState('neutral')
  const [speech, setSpeech] = useState('')
  const [showSpeech, setShowSpeech] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [chipDenom, setChipDenom] = useState(10)
  const [shareCard, setShareCard] = useState(null)
  const [runMode, setRunMode] = useState(false)
  const [runResults, setRunResults] = useState([])
  const [runRecap, setRunRecap] = useState(false)
  
  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0)
  
  // Save
  useEffect(() => {
    saveGameState({ bankroll, history, analytics, settings: { sound: soundEnabled } })
  }, [bankroll, history, analytics, soundEnabled])
  
  // Update dealer mood based on streak
  useEffect(() => {
    if (analytics.currentStreakType === 'win' && analytics.currentStreak >= 2) {
      setMood(analytics.currentStreak >= 3 ? 'winning' : 'happy')
    } else if (analytics.currentStreakType === 'loss' && analytics.currentStreak >= 3) {
      setMood('tilted')
    }
  }, [analytics.currentStreak, analytics.currentStreakType])
  
  // Place bet
  const placeBet = useCallback((type, num) => {
    if (spinning) return
    const amount = chipDenom
    const currentTotal = totalBet + amount
    if (currentTotal > bankroll) {
      setSpeech('Not enough chips!')
      setShowSpeech(true)
      setTimeout(() => setShowSpeech(false), 2000)
      return
    }
    
    setBets(prev => {
      const updated = { ...prev }
      if (typeof updated[type] === 'number') {
        updated[type] += amount
      } else if (type === 'straight' && num !== undefined) {
        updated[num] = (updated[num] || 0) + amount
      }
      return updated
    })
    
    setBetHistory(prev => [...prev, { type, num, amount }])
  }, [spinning, chipDenom, totalBet, bankroll])
  
  // Undo
  const undoBet = useCallback(() => {
    if (spinning || betHistory.length === 0) return
    const last = betHistory[betHistory.length - 1]
    setBets(prev => {
      const updated = { ...prev }
      if (typeof updated[last.type] === 'number') {
        updated[last.type] = Math.max(0, updated[last.type] - last.amount)
      } else if (last.type === 'straight' && last.num !== undefined) {
        updated[last.num] = Math.max(0, (updated[last.num] || 0) - last.amount)
      }
      return updated
    })
    setBetHistory(prev => prev.slice(0, -1))
  }, [spinning, betHistory])
  
  // Spin
  const spin = useCallback(() => {
    if (spinning || totalBet === 0) return
    
    const duration = getRandomSpinDuration()
    const extraSpins = 5
    const newAngle = spinAngle + (360 * extraSpins) + Math.floor(Math.random() * 360)
    
    setSpinning(true)
    setMood('excited')
    const lines = DEALER_LINES.neutral
    setSpeech(lines[Math.floor(Math.random() * lines.length)])
    setShowSpeech(true)
    
    let spinCount = 0
    const spinInterval = setInterval(() => {
      setResult(Math.floor(Math.random() * 37))
      spinCount++
      if (spinCount > Math.floor(duration / 60)) {
        clearInterval(spinInterval)
        
        const spinResult = spinRoulette()
        setResult(spinResult.number)
        setSpinAngle(newAngle)
        
        // Build bets object for payout
        const betsObj = {
          red: bets.red,
          black: bets.black,
          odd: bets.odd,
          even: bets.even,
          first12: bets.first12,
          second12: bets.second12,
          third12: bets.third12,
          straight: Object.fromEntries(Object.entries(bets).filter(([k,v]) => typeof k === 'string' && !isNaN(parseInt(k))).map(([k,v]) => [k,v]))
        }
        
        const payout = calculatePayouts(spinResult, betsObj)
        const newBankroll = bankroll + payout.netGain
        setBankroll(newBankroll)
        
        const newHistory = [{ spin: history.length + 1, number: spinResult.number, color: spinResult.color, result: payout.netGain }, ...history].slice(0, 10)
        setHistory(newHistory)
        
        const newAnalytics = updateAnalytics(analytics, payout)
        setAnalytics(newAnalytics)
        
        // Update mood
        if (payout.isWin) {
          setMood(payout.netGain > 100 ? 'winning' : 'happy')
          const lines = payout.netGain > 100 ? DEALER_LINES.winning : DEALER_LINES.happy
          setSpeech(lines[Math.floor(Math.random() * lines.length)])
        } else if (payout.isLoss) {
          setMood(newAnalytics.currentStreak >= 3 ? 'tilted' : 'losing')
          const lines = DEALER_LINES.losing
          setSpeech(lines[Math.floor(Math.random() * lines.length)])
        } else {
          setMood('neutral')
          setSpeech('Push!')
        }
        
        // Run mode tracking
        if (runMode) {
          setRunResults(prev => [...prev, { bet: totalBet, result: payout.netGain, number: spinResult.number, color: spinResult.color }])
        }
        
        setTimeout(() => {
          setSpinning(false)
          setShowSpeech(true)
          setShareCard({ number: spinResult.number, color: spinResult.color })
          
          // Run mode check
          if (runMode && newAnalytics.totalSpins % 10 === 0) {
            setRunRecap(true)
            setRunMode(false)
          }
          
          setTimeout(() => setShowSpeech(false), 3000)
          
          // Clear bets
          setBets({ red: 0, black: 0, odd: 0, even: 0, first12: 0, second12: 0, third12: 0, ...Object.fromEntries(Array.from({length: 37}, (_, i) => [i, 0])) })
          setBetHistory([])
        }, 1500)
      }
    }, 60)
  }, [spinning, totalBet, bankroll, spinAngle, bets, history, analytics, runMode])
  
  const resetGame = () => {
    if (spinning) return
    setBankroll(INITIAL_BANKROLL)
    setHistory([])
    setAnalytics(createInitialAnalytics())
    setBets({ red: 0, black: 0, odd: 0, even: 0, first12: 0, second12: 0, third12: 0, ...Object.fromEntries(Array.from({length: 37}, (_, i) => [i, 0])) })
    setBetHistory([])
    setMood('neutral')
    setSpeech('New game! Good luck!')
    setShowSpeech(true)
    setTimeout(() => setShowSpeech(false), 2000)
  }
  
  const startRunMode = () => {
    setRunMode(true)
    setRunResults([])
    setSpeech('Starting 10-spin run!')
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
      <main className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* LEFT: Dealer */}
          <div className="space-y-4">
            <div className="bg-black/40 rounded-2xl p-4 flex flex-col items-center">
              <h2 className="font-orbitron text-pink-400 mb-2">DEALER</h2>
              <div className="relative mb-2">
                <DealerAvatar mood={mood} />
                <SpeechBubble message={speech} visible={showSpeech} />
              </div>
              <MoodMeter mood={mood} />
            </div>
            
            {/* Stats */}
            <div className="bg-black/40 rounded-xl p-4">
              <h3 className="font-orbitron text-pink-400 text-sm mb-2 flex items-center"><TrendingUp className="w-4 h-4 mr-2" />STATS</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-800/50 p-2 rounded">
                  <span className="text-gray-400">Win Rate</span>
                  <div className="text-lg font-bold text-green-400">{getWinRate(analytics)}%</div>
                </div>
                <div className="bg-gray-800/50 p-2 rounded">
                  <span className="text-gray-400">Spins</span>
                  <div className="text-lg font-bold text-white">{analytics.totalSpins}</div>
                </div>
                <div className="bg-gray-800/50 p-2 rounded">
                  <span className="text-gray-400">Biggest Win</span>
                  <div className="text-lg font-bold text-yellow-400">{analytics.biggestWin}</div>
                </div>
                <div className="bg-gray-800/50 p-2 rounded">
                  <span className="text-gray-400">Streak</span>
                  <div className="text-lg font-bold text-pink-400">{analytics.currentStreak > 0 ? `${analytics.currentStreak}${analytics.currentStreakType === 'win' ? '🔥' : '💨'}` : '-'}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* CENTER: Wheel */}
          <div className="bg-black/40 rounded-2xl p-4 flex flex-col items-center">
            <h2 className="font-orbitron text-pink-400 mb-2">ROULETTE</h2>
            <RouletteWheel spinning={spinning} result={result} spinAngle={spinAngle} />
            
            <div className="flex gap-2 mt-4 w-full">
              <button onClick={undoBet} disabled={spinning || betHistory.length === 0}
                      className="flex-1 bg-gray-700 disabled:opacity-50 text-white py-2 rounded-lg font-bold text-sm">
                UNDO
              </button>
              <button onClick={spin} disabled={spinning || totalBet === 0}
                      className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                        spinning || totalBet === 0 
                          ? 'bg-gray-700 text-gray-500' 
                          : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500'
                      }`}>
                {spinning ? 'SPINNING...' : totalBet === 0 ? 'PLACE BETS' : 'SPIN!'}
              </button>
            </div>
            
            {/* Last 10 */}
            <div className="mt-4 w-full">
              <h3 className="text-gray-400 text-xs text-center mb-2">LAST 10</h3>
              <div className="flex flex-wrap justify-center gap-1">
                {history.length === 0 ? (
                  <span className="text-gray-500 text-xs">No spins yet</span>
                ) : (
                  history.slice(0, 10).map((h, i) => (
                    <span key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      h.color === 'red' ? 'bg-red-600' : h.color === 'black' ? 'bg-gray-800' : 'bg-green-600'
                    } text-white`}>
                      {h.number}
                    </span>
                  ))
                )}
              </div>
            </div>
            
            {/* Run mode */}
            <div className="mt-4 w-full flex gap-2">
              <button onClick={startRunMode} disabled={spinning || runMode}
                      className="flex-1 bg-purple-600 disabled:opacity-50 hover:bg-purple-500 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />10-SPIN RUN
              </button>
            </div>
            {runMode && <p className="text-pink-400 text-xs mt-2">Run in progress... {analytics.totalSpins % 10}/10</p>}
          </div>
          
          {/* RIGHT: Betting + Controls */}
          <div className="space-y-4">
            {/* Chip selector */}
            <div className="bg-black/40 rounded-xl p-4">
              <div className="flex justify-center gap-2 mb-2">
                {CHIP_DENOMINATIONS.map(d => (
                  <button key={d} onClick={() => setChipDenom(d)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                            chipDenom === d 
                              ? 'bg-yellow-400 text-yellow-900 scale-110 shadow-lg' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}>
                    {d}
                  </button>
                ))}
              </div>
              <p className="text-center text-gray-400 text-xs">Click table to bet {chipDenom} chips</p>
            </div>
            
            {/* Betting table */}
            <BettingTable bets={bets} onBet={placeBet} chipDenom={chipDenom} />
            
            {/* Total */}
            <div className="bg-black/40 rounded-xl p-3 text-center">
              <span className="text-gray-400">Total Bet: </span>
              <span className="text-yellow-400 font-orbitron text-xl">{totalBet}</span>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-black/40 border-t border-pink-500/30 py-3 mt-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-pink-300/60 text-sm">🎮 Entertainment only. No real wagering. Fake chips have no value. 🎮</p>
        </div>
      </footer>
      
      {/* Modals */}
      {shareCard && <ShareCard result={shareCard} bankroll={bankroll} onClose={() => setShareCard(null)} />}
      {runRecap && <RunRecapModal runResults={runResults} bankroll={bankroll} onClose={() => setRunRecap(false)} />}
    </div>
  )
}

export default App
