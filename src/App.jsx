import { useState, useEffect, useCallback } from 'react'
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
import { 
  calculateLevel, calculateXPEarned, getNextUnlock, 
  loadProgression, saveProgression, addXP, calculateRunGrade, getEscalationStyles, COSMETICS 
} from './progression'

const INITIAL_BANKROLL = 1000

const DEALER_LINES = {
  happy: ["Nice win!", "You're on fire!", "Another one!", "Lucky you!", "Amazing!"],
  neutral: ["Place your bets!", "Good luck!", "Let's go!", "Fingers crossed!", "Ready when you are!"],
  tilted: ["Ouch...", "Better luck next time...", "Don't give up!", "The house always wins...", "It's just a phase!"],
  winning: ["Jackpot!", "INCREDIBLE!", "You're a legend!", "Big winner!"],
  losing: ["Tough break...", "The wheel spins for everyone...", "We'll get 'em next time!", "Chin up!"]
}

const GRADES = [
  { min: 50, grade: 'S', label: 'LEGENDARY!', color: 'text-yellow-400' },
  { min: 20, grade: 'A', label: 'Excellent!', color: 'text-green-400' },
  { min: 0, grade: 'B', label: 'Good job!', color: 'text-blue-400' },
  { min: -20, grade: 'C', label: 'Break even', color: 'text-gray-400' },
  { min: -50, grade: 'D', label: 'Ouch...', color: 'text-orange-400' },
  { min: -Infinity, grade: 'F', label: 'RUN COMPLETE', color: 'text-red-400' }
]

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

const DealerAvatar = ({ mood }) => {
  const moods = { 
    happy: { emoji: '😊', size: 'text-7xl' },
    excited: { emoji: '😄', size: 'text-7xl' },
    winning: { emoji: '🥳', size: 'text-7xl' },
    neutral: { emoji: '😐', size: 'text-7xl' },
    tilted: { emoji: '😤', size: 'text-7xl' },
    losing: { emoji: '😢', size: 'text-7xl' },
    shocked: { emoji: '😱', size: 'text-7xl' }
  }
  const m = moods[mood] || moods.neutral
  return <div className={`${m.size} animate-bounce-slow`}>{m.emoji}</div>
}

const SpeechBubble = ({ message, visible }) => {
  if (!visible) return null
  return (
    <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-[#1a2744] text-cyan-300 px-3 py-1.5 border-2 border-cyan-400 z-20 whitespace-nowrap text-xs font-stats">
      {message}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-[#1a2744] border-r-2 border-b-2 border-cyan-400"></div>
    </div>
  )
}

const MoodMeter = ({ mood }) => {
  const colors = { happy: 'bg-green-500', excited: 'bg-yellow-500', winning: 'bg-pink-500', neutral: 'bg-gray-500', tilted: 'bg-orange-500', losing: 'bg-red-400', shocked: 'bg-red-600' }
  const widths = { happy: 90, excited: 80, winning: 100, neutral: 50, tilted: 30, losing: 20, shocked: 95 }
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs text-gray-400 font-stats">Mood</span>
      <div className="flex-1 h-2 bg-[#0a1628] border border-gray-600">
        <div className={`h-full ${colors[mood]} transition-all duration-500`} style={{ width: `${widths[mood]}%` }}></div>
      </div>
    </div>
  )
}

const XPBar = ({ progression, xpGain, levelUp }) => {
  const ld = calculateLevel(progression.totalXP)
  const nu = getNextUnlock(ld.level, 'TABLE_SKINS')
  return (
    <div className="citypop-panel-cyan p-2">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-stats text-xs">LV.{ld.level}</span>
          {levelUp && <span className="text-green-400 text-xs animate-pulse">LEVEL UP!</span>}
        </div>
        <span className="text-gray-400 text-[10px] font-stats">{ld.currentXP}/{ld.xpToNextLevel} XP</span>
      </div>
      <div className="h-2 bg-[#0a1628] border border-gray-600">
        <div className="h-full bg-gradient-to-r from-pink-500 to-cyan-500 transition-all" style={{ width: `${ld.progressPercent}%` }}></div>
      </div>
      {xpGain && <div className="text-center text-green-400 text-xs font-stats mt-1 animate-pulse">+{xpGain} XP</div>}
      {nu && <p className="text-[8px] text-gray-400 mt-1 font-stats">Next: {nu.name} @ Lv.{nu.level}</p>}
    </div>
  )
}

const CosmeticsModal = ({ progression, onSelect, onClose }) => {
  const ld = calculateLevel(progression.totalXP)
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="citypop-panel p-4 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-pink-400 text-sm">COSMETICS</h3>
          <button onClick={onClose}><X className="text-gray-400 w-5 h-5" /></button>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <h4 className="text-cyan-400 mb-2">TABLE SKINS</h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(COSMETICS.TABLE_SKINS).map(s => {
                const u = s.level <= ld.level
                return <button key={s.id} onClick={() => u && onSelect('table', s.id)} disabled={!u} className={`p-2 border font-stats ${u ? (progression.selectedTable === s.id ? 'border-pink-500 bg-pink-900' : 'border-gray-600') : 'border-gray-800 opacity-50'}`} style={u ? { backgroundColor: s.color } : {}}>{u ? s.name : `🔒 ${s.level}`}</button>
              })}
            </div>
          </div>
          <div>
            <h4 className="text-cyan-400 mb-2">BORDERS</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(COSMETICS.BORDER_STYLES).map(b => {
                const u = b.level <= ld.level
                return <button key={b.id} onClick={() => u && onSelect('border', b.id)} disabled={!u} className={`p-2 border font-stats ${u ? (progression.selectedBorder === b.id ? 'border-pink-500' : 'border-gray-600') : 'border-gray-800 opacity-50'}`}>{u ? b.name : `🔒 Lv.${b.level}`}</button>
              })}
            </div>
          </div>
          <div>
            <h4 className="text-cyan-400 mb-2">DEALER</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(COSMETICS.DEALER_PERSONALITIES).map(d => {
                const u = d.level <= ld.level
                return <button key={d.id} onClick={() => u && onSelect('dealer', d.id)} disabled={!u} className={`p-2 border font-stats ${u ? (progression.selectedDealer === d.id ? 'border-pink-500' : 'border-gray-600') : 'border-gray-800 opacity-50'}`}>{u ? d.name : `🔒 Lv.${d.level}`}</button>
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const RouletteWheel = ({ spinning, result, spinAngle }) => {
  const numbers = Array.from({ length: 37 }, (_, i) => i)
  return (
    <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-4 border-cyan-500 bg-[#0a1628] flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)]">
      <div 
        className="absolute inset-2 transition-transform"
        style={{ 
          transform: `rotate(${spinAngle}deg)`,
          transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
        }}
      >
        {numbers.map((num, i) => {
          const angle = (i * 360) / 37
          const bgColor = num === 0 ? '#10b981' : RED_NUMBERS.includes(num) ? '#dc2626' : '#1f2937'
          return (
            <div key={num} className="absolute w-7 h-7 flex items-center justify-center text-[10px] font-bold text-white border border-[#0a1628]"
                 style={{
                   top: '50%', left: '50%',
                   transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-95px) rotate(-${angle}deg)`,
                   backgroundColor: bgColor,
                 }}>
              {num}
            </div>
          )
        })}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#1a2744] border-4 border-cyan-400 flex items-center justify-center z-10">
          <span className="text-2xl sm:text-3xl font-bold text-cyan-300 font-stats">{result !== null ? result : '🎰'}</span>
        </div>
      </div>
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-cyan-400 z-20"></div>
    </div>
  )
}

const BettingTable = ({ bets, onBet, chipDenom }) => {
  const numbers = Array.from({ length: 37 }, (_, i) => i)
  return (
    <div className="bg-[#0f2d1a] border-2 border-green-600 p-1.5 text-[10px]">
      <div className="flex justify-center mb-1">
        <button onClick={() => onBet('straight', 0)} 
                className={`w-10 h-10 flex items-center justify-center font-bold text-white transition-all text-sm border-2 ${
                  bets[0]?.amount > 0 ? 'border-yellow-400 bg-green-700' : 'border-green-500 bg-green-800 hover:bg-green-700'
                }`}>
          0
          {bets[0]?.amount > 0 && <span className="absolute -top-2 -right-2 bg-yellow-400 text-green-900 text-[8px] px-1">{bets[0].amount}</span>}
        </button>
      </div>
      <div className="grid grid-cols-6 gap-0.5 mb-1">
        {numbers.slice(1).map(num => {
          const bgColor = RED_NUMBERS.includes(num) ? '#991b1b' : '#1f2937'
          const borderColor = RED_NUMBERS.includes(num) ? '#dc2626' : '#374151'
          return (
            <button key={num} onClick={() => onBet('straight', num)}
                    className="h-7 flex items-center justify-center text-white font-bold hover:brightness-125 transition-all text-[9px] border-2"
                    style={{ backgroundColor: bgColor, borderColor: bets[num]?.amount > 0 ? '#fbbf24' : borderColor }}>
              {num}
              {bets[num]?.amount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-green-900 text-[8px] px-0.5">
                  {bets[num].amount >= 100 ? '✓' : bets[num].amount}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div className="grid grid-cols-3 gap-0.5 mt-1.5">
        <button onClick={() => onBet('first12')} className={`bg-[#1e3a5f] h-9 hover:brightness-125 border-2 ${bets.first12 > 0 ? 'border-cyan-400' : 'border-gray-600'}`}>
          <span className="text-white font-bold text-[9px]">1st 12</span>
          {bets.first12 > 0 && <span className="block text-cyan-300 text-[8px]">{bets.first12}</span>}
        </button>
        <button onClick={() => onBet('second12')} className={`bg-[#1e3a5f] h-9 hover:brightness-125 border-2 ${bets.second12 > 0 ? 'border-cyan-400' : 'border-gray-600'}`}>
          <span className="text-white font-bold text-[9px]">2nd 12</span>
          {bets.second12 > 0 && <span className="block text-cyan-300 text-[8px]">{bets.second12}</span>}
        </button>
        <button onClick={() => onBet('third12')} className={`bg-[#1e3a5f] h-9 hover:brightness-125 border-2 ${bets.third12 > 0 ? 'border-cyan-400' : 'border-gray-600'}`}>
          <span className="text-white font-bold text-[9px]">3rd 12</span>
          {bets.third12 > 0 && <span className="block text-cyan-300 text-[8px]">{bets.third12}</span>}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-0.5 mt-1">
        <button onClick={() => onBet('odd')} className={`h-8 font-bold text-white text-[9px] border-2 ${bets.odd > 0 ? 'border-pink-500 bg-pink-900' : 'border-gray-600 bg-[#4a1d4d]'}`}>
          ODD {bets.odd > 0 && `(${bets.odd})`}
        </button>
        <button onClick={() => onBet('even')} className={`h-8 font-bold text-white text-[9px] border-2 ${bets.even > 0 ? 'border-cyan-400 bg-cyan-900' : 'border-gray-600 bg-[#1e3a5f]'}`}>
          EVEN {bets.even > 0 && `(${bets.even})`}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-0.5 mt-1">
        <button onClick={() => onBet('red')} className="h-8 font-bold text-[9px] border-2" style={{ backgroundColor: bets.red > 0 ? '#dc2626' : '#991b1b', borderColor: bets.red > 0 ? '#fbbf24' : '#6b2121' }}>
          🔴 RED {bets.red > 0 && `(${bets.red})`}
        </button>
        <button onClick={() => onBet('black')} className="h-8 font-bold text-gray-200 text-[9px] border-2" style={{ backgroundColor: bets.black > 0 ? '#4b5563' : '#1f2937', borderColor: bets.black > 0 ? '#fbbf24' : '#374151' }}>
          ⚫ BLACK {bets.black > 0 && `(${bets.black})`}
        </button>
      </div>
    </div>
  )
}

const ShareCard = ({ result, bankroll, onClose }) => {
  const [copied, setCopied] = useState(false)
  const text = `🎰 Waifu Roulette Results 🎰\nNumber: ${result.number} (${result.color.toUpperCase()})\nBankroll: ${bankroll.toLocaleString()} chips\n\n🎮 waifu-roulette-lounge`
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="citypop-panel p-5 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-pink-400 text-sm">RESULT CARD</h3>
          <button onClick={onClose}><X className="text-gray-400 w-5 h-5" /></button>
        </div>
        <div className="text-center mb-4">
          <div className="w-20 h-20 mx-auto flex items-center justify-center text-3xl font-bold mb-2 border-2 text-white" style={{ backgroundColor: result.color === 'red' ? '#991b1b' : result.color === 'black' ? '#1f2937' : '#065f46', borderColor: result.color === 'red' ? '#dc2626' : result.color === 'black' ? '#4b5563' : '#10b981' }}>
            {result.number}
          </div>
          <p className="text-gray-400 font-stats text-sm">{result.color.toUpperCase()}</p>
        </div>
        <button onClick={copy} className="w-full bg-pink-600 hover:bg-pink-500 text-white py-2 font-stats text-sm flex items-center justify-center gap-2 border-2 border-pink-400">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'COPIED!' : 'COPY RESULT'}
        </button>
      </div>
    </div>
  )
}

const RunRecapModal = ({ runResults, bankroll, onClose }) => {
  const totalWagered = runResults.reduce((sum, r) => sum + r.bet, 0)
  const totalWon = runResults.reduce((sum, r) => sum + (r.result > 0 ? r.result : 0), 0)
  const netProfit = totalWon - totalWagered
  const profitPercent = totalWagered > 0 ? Math.round((netProfit / totalWagered) * 100) : 0
  const grade = GRADES.find(g => profitPercent >= g.min)
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="citypop-panel p-5 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-pink-400 text-sm">RUN COMPLETE</h3>
          <button onClick={onClose}><X className="text-gray-400 w-5 h-5" /></button>
        </div>
        <div className="text-center mb-5">
          <div className={`text-5xl font-stats mb-2 ${grade.color}`}>{grade.grade}</div>
          <div className="text-gray-400 text-sm">{grade.label}</div>
        </div>
        <div className="space-y-2 mb-5 text-sm font-stats">
          <div className="flex justify-between bg-[#0a1628] p-2 border border-gray-700"><span className="text-gray-400">Spins</span><span className="text-white">{runResults.length}</span></div>
          <div className="flex justify-between bg-[#0a1628] p-2 border border-gray-700"><span className="text-gray-400">Wagered</span><span className="text-yellow-400">{totalWagered.toLocaleString()}</span></div>
          <div className="flex justify-between bg-[#0a1628] p-2 border border-gray-700"><span className="text-gray-400">Net</span><span className={netProfit >= 0 ? 'text-green-500' : 'text-red-400'}>{netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()} ({profitPercent}%)</span></div>
          <div className="flex justify-between bg-[#0a1628] p-2 border border-gray-700"><span className="text-gray-400">Bankroll</span><span className="text-yellow-400">{bankroll.toLocaleString()}</span></div>
        </div>
        <button onClick={onClose} className="w-full bg-pink-600 hover:bg-pink-500 text-white py-2 font-stats text-sm border-2 border-pink-400">CONTINUE</button>
      </div>
    </div>
  )
}

function App() {
  const [bankroll, setBankroll] = useState(() => loadGameState()?.bankroll || INITIAL_BANKROLL)
  const [history, setHistory] = useState(() => loadGameState()?.history || [])
  const [analytics, setAnalytics] = useState(() => loadGameState()?.analytics || createInitialAnalytics())
  const [bets, setBets] = useState(() => ({ red: 0, black: 0, odd: 0, even: 0, first12: 0, second12: 0, third12: 0, ...Object.fromEntries(Array.from({length: 37}, (_, i) => [i, 0])) }))
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
  const [progression, setProgression] = useState(() => loadProgression())
  const [cosmeticsOpen, setCosmeticsOpen] = useState(false)
  const [xpGain, setXpGain] = useState(null)
  const [levelUp, setLevelUp] = useState(null)
  
  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0)
  const levelData = calculateLevel(progression.totalXP)
  const escalation = analytics.currentStreakType === 'win' ? analytics.currentStreak : 0
  
  useEffect(() => { saveGameState({ bankroll, history, analytics, settings: { sound: soundEnabled } }) }, [bankroll, history, analytics, soundEnabled])
  useEffect(() => { saveProgression(progression) }, [progression])
  
  useEffect(() => {
    if (analytics.currentStreakType === 'win' && analytics.currentStreak >= 2) setMood(analytics.currentStreak >= 3 ? 'winning' : 'happy')
    else if (analytics.currentStreakType === 'loss' && analytics.currentStreak >= 3) setMood('tilted')
  }, [analytics.currentStreak, analytics.currentStreakType])
  
  const placeBet = useCallback((type, num) => {
    if (spinning) return
    const amount = chipDenom
    if (totalBet + amount > bankroll) { setSpeech('Not enough chips!'); setShowSpeech(true); setTimeout(() => setShowSpeech(false), 2000); return }
    setBets(prev => { const updated = {...prev}; if (typeof updated[type] === 'number') updated[type] += amount; else if (type === 'straight' && num !== undefined) updated[num] = (updated[num] || 0) + amount; return updated })
    setBetHistory(prev => [...prev, { type, num, amount }])
  }, [spinning, chipDenom, totalBet, bankroll])
  
  const undoBet = useCallback(() => {
    if (spinning || betHistory.length === 0) return
    const last = betHistory[betHistory.length - 1]
    setBets(prev => { const updated = {...prev}; if (typeof updated[last.type] === 'number') updated[last.type] = Math.max(0, updated[last.type] - last.amount); else if (last.type === 'straight' && last.num !== undefined) updated[last.num] = Math.max(0, (updated[last.num] || 0) - last.amount); return updated })
    setBetHistory(prev => prev.slice(0, -1))
  }, [spinning, betHistory])
  
  const spin = useCallback(() => {
    if (spinning || totalBet === 0) return
    const duration = getRandomSpinDuration()
    const newAngle = spinAngle + (360 * 5) + Math.floor(Math.random() * 360)
    setSpinning(true); setMood('excited'); setSpeech(DEALER_LINES.neutral[Math.floor(Math.random() * DEALER_LINES.neutral.length)]); setShowSpeech(true)
    
    let spinCount = 0
    const spinInterval = setInterval(() => {
      setResult(Math.floor(Math.random() * 37))
      spinCount++
      if (spinCount > Math.floor(duration / 60)) {
        clearInterval(spinInterval)
        const spinResult = spinRoulette()
        setResult(spinResult.number); setSpinAngle(newAngle)
        const betsObj = { red: bets.red, black: bets.black, odd: bets.odd, even: bets.even, first12: bets.first12, second12: bets.second12, third12: bets.third12, straight: Object.fromEntries(Object.entries(bets).filter(([k,v]) => typeof k === 'string' && !isNaN(parseInt(k))).map(([k,v]) => [k,v])) }
        const payout = calculatePayouts(spinResult, betsObj)
        const isStraightHit = payout.winningBets.some(wb => wb.type === 'straight')
        const xpEarned = calculateXPEarned(payout.netGain, isStraightHit, analytics.currentStreak, payout.isWin)
        const oldLevel = calculateLevel(progression.totalXP).level
        const newBankroll = bankroll + payout.netGain
        setBankroll(newBankroll)
        const newHistory = [{ spin: history.length + 1, number: spinResult.number, color: spinResult.color, result: payout.netGain }, ...history].slice(0, 10)
        setHistory(newHistory)
        const newAnalytics = updateAnalytics(analytics, payout)
        setAnalytics(newAnalytics)
        
        // Update progression with XP
        setProgression(prev => addXP(prev, xpEarned))
        
        // Show XP gain
        setXpGain(xpEarned)
        setTimeout(() => setXpGain(null), 1500)
        
        // Check for level up
        const newLevel = calculateLevel(progression.totalXP + xpEarned).level
        if (newLevel > oldLevel) {
          setLevelUp(newLevel)
          setTimeout(() => setLevelUp(null), 2500)
        }
        
        if (payout.isWin) { setMood(payout.netGain > 100 ? 'winning' : 'happy'); setSpeech(DEALER_LINES[payout.netGain > 100 ? 'winning' : 'happy'][Math.floor(Math.random() * 4)]) }
        else if (payout.isLoss) { setMood(newAnalytics.currentStreak >= 3 ? 'tilted' : 'losing'); setSpeech(DEALER_LINES.losing[Math.floor(Math.random() * DEALER_LINES.losing.length)]) }
        else { setMood('neutral'); setSpeech('Push!') }
        
        if (runMode) setRunResults(prev => [...prev, { bet: totalBet, result: payout.netGain }])
        
        setTimeout(() => {
          setSpinning(false); setShowSpeech(true); setShareCard({ number: spinResult.number, color: spinResult.color })
          if (runMode && newAnalytics.totalSpins % 10 === 0) { setRunRecap(true); setRunMode(false) }
          setTimeout(() => setShowSpeech(false), 3000)
          setBets({ red: 0, black: 0, odd: 0, even: 0, first12: 0, second12: 0, third12: 0, ...Object.fromEntries(Array.from({length: 37}, (_, i) => [i, 0])) })
          setBetHistory([])
        }, 1500)
      }
    }, 60)
  }, [spinning, totalBet, bankroll, spinAngle, bets, history, analytics, runMode])

  const resetGame = () => {
    if (spinning) return
    setBankroll(INITIAL_BANKROLL); setHistory([]); setAnalytics(createInitialAnalytics())
    setBets({ red: 0, black: 0, odd: 0, even: 0, first12: 0, second12: 0, third12: 0, ...Object.fromEntries(Array.from({length: 37}, (_, i) => [i, 0])) })
    setBetHistory([]); setMood('neutral'); setSpeech('New game! Good luck!'); setShowSpeech(true)
    setTimeout(() => setShowSpeech(false), 2000)
  }
  
  const startRunMode = () => { setRunMode(true); setRunResults([]); setSpeech('Starting 10-spin run!'); setShowSpeech(true); setTimeout(() => setShowSpeech(false), 2000) }
  
  const selectCosmetic = (type, id) => {
    setProgression(prev => ({ ...prev, [`selected${type.charAt(0).toUpperCase() + type.slice(1)}`]: id }))
    setCosmeticsOpen(false)
  }
  
  return (
    <div className="min-h-screen">
      <header className="citypop-panel border-b-0 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto flex-wrap gap-2">
          <div className="flex items-center"><span className="text-3xl sm:text-4xl mr-2 sm:mr-3">🎰</span><div><h1 className="text-pink-400 text-sm sm:text-base">WAIFU ROULETTE</h1><p className="text-cyan-400/60 text-[8px] sm:text-xs">LOUNGE EDITION</p></div></div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <button onClick={() => setCosmeticsOpen(true)} className="citypop-panel-cyan px-2 py-1 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2 border-2 border-cyan-500 hover:border-cyan-400">
              <span className="text-yellow-400 font-stats text-xs sm:text-sm">LV.{levelData.level}</span>
            </button>
            <div className="citypop-panel-cyan px-3 py-1.5 sm:px-4 sm:py-2"><div className="flex items-center gap-1.5 sm:gap-2"><Coins className="text-yellow-400 w-4 h-4 sm:w-5 sm:h-5" /><span className="font-stats text-yellow-400 text-lg sm:text-2xl">{bankroll.toLocaleString()}</span></div></div>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-1.5 sm:p-2 border-2 border-gray-600 hover:border-pink-500">{soundEnabled ? <Volume2 className="text-pink-400 w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />}</button>
            <button onClick={resetGame} className="p-1.5 sm:p-2 border-2 border-gray-600 hover:border-red-500 disabled:opacity-50" disabled={spinning}><RotateCcw className="text-pink-400 w-4 h-4 sm:w-5 sm:h-5" /></button>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto p-2 sm:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
          <div className="space-y-2 sm:space-y-4">
            <XPBar progression={progression} xpGain={xpGain} levelUp={levelUp} />
            <div className="citypop-panel p-3 sm:p-4 flex flex-col items-center"><h2 className="text-pink-400 mb-2 text-xs sm:text-sm">DEALER</h2><div className="relative mb-2"><DealerAvatar mood={mood} /><SpeechBubble message={speech} visible={showSpeech} /></div><MoodMeter mood={mood} /></div>
            <div className="citypop-panel-cyan p-3 sm:p-4"><h3 className="text-cyan-400 text-xs mb-2 flex items-center gap-2"><TrendingUp className="w-3 h-3" />STATS</h3><div className="grid grid-cols-2 gap-2 text-xs font-stats"><div className="bg-[#0a1628] p-2 border border-gray-700"><span className="text-gray-400 block">Win Rate</span><span className="text-green-500 text-lg">{getWinRate(analytics)}%</span></div><div className="bg-[#0a1628] p-2 border border-gray-700"><span className="text-gray-400 block">Spins</span><span className="text-white text-lg">{analytics.totalSpins}</span></div><div className="bg-[#0a1628] p-2 border border-gray-700"><span className="text-gray-400 block">Biggest</span><span className="text-yellow-400 text-lg">{analytics.biggestWin}</span></div><div className="bg-[#0a1628] p-2 border border-gray-700"><span className="text-gray-400 block">Streak</span><span className="text-pink-400 text-lg">{analytics.currentStreak > 0 ? analytics.currentStreak + (analytics.currentStreakType === 'win' ? '🔥' : '💨') : '-'}</span></div></div></div>
          </div>
          
          <div className="citypop-panel p-3 sm:p-4 flex flex-col items-center">
            <h2 className="text-cyan-400 mb-2 text-xs sm:text-sm">ROULETTE</h2>
            <RouletteWheel spinning={spinning} result={result} spinAngle={spinAngle} />
            <div className="flex gap-2 mt-4 w-full">
              <button onClick={undoBet} disabled={spinning || betHistory.length === 0} className="flex-1 bg-[#1f2937] disabled:opacity-50 text-white py-2 font-stats text-xs border-2 border-gray-600 hover:border-gray-500 disabled:cursor-not-allowed">UNDO</button>
              <button onClick={spin} disabled={spinning || totalBet === 0} className={`flex-1 py-2 font-stats text-xs transition-all border-2 ${spinning || totalBet === 0 ? 'bg-[#1f2937] text-gray-500 border-gray-700 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-500 text-white border-pink-400'}`}>{spinning ? 'SPINNING...' : totalBet === 0 ? 'PLACE BETS' : 'SPIN!'}</button>
            </div>
            <div className="mt-4 w-full"><h3 className="text-gray-400 text-[10px] text-center mb-2 font-stats">LAST 10</h3><div className="flex flex-wrap justify-center gap-1">{history.length === 0 ? <span className="text-gray-500 text-xs">No spins yet</span> : history.slice(0, 10).map((h, i) => <span key={i} className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[9px] sm:text-xs font-bold border-2 text-white" style={{ backgroundColor: h.color === 'red' ? '#991b1b' : h.color === 'black' ? '#1f2937' : '#065f46', borderColor: h.color === 'red' ? '#dc2626' : h.color === 'black' ? '#4b5563' : '#10b981' }}>{h.number}</span>)}</div></div>
            <div className="mt-3 w-full"><button onClick={startRunMode} disabled={spinning || runMode} className="w-full bg-[#1e3a5f] hover:bg-[#264973] text-white py-2 font-stats text-xs flex items-center justify-center gap-2 border-2 border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"><Play className="w-3 h-3" />10-SPIN RUN</button>{runMode && <p className="text-pink-400 text-[10px] mt-1 text-center">Run in progress... {analytics.totalSpins % 10}/10</p>}</div>
          </div>
          
          <div className="space-y-2 sm:space-y-4">
            <div className="citypop-panel p-2 sm:p-3">
              <div className="flex justify-center gap-1.5 sm:gap-2 mb-2">{CHIP_DENOMINATIONS.map(d => <button key={d} onClick={() => setChipDenom(d)} className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-xs transition-all border-2 ${chipDenom === d ? 'bg-yellow-400 text-yellow-900 border-yellow-300 scale-110' : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500'}`}>{d}</button>)}</div>
              <p className="text-center text-gray-400 text-[10px] font-stats">Click table to bet {chipDenom} chips</p>
            </div>
            <BettingTable bets={bets} onBet={placeBet} chipDenom={chipDenom} />
            <div className="citypop-panel p-2 sm:p-3 text-center"><span className="text-gray-400 font-stats text-xs">Total: </span><span className="text-yellow-400 font-stats text-lg">{totalBet}</span></div>
          </div>
        </div>
      </main>
      
      <footer className="citypop-panel border-t-0 py-3 mt-4"><div className="max-w-6xl mx-auto text-center"><p className="text-pink-300/60 text-xs">🎮 Entertainment only. No real wagering. Fake chips have no value. 🎮</p></div></footer>
      
      {shareCard && <ShareCard result={shareCard} bankroll={bankroll} onClose={() => setShareCard(null)} />}
      {runRecap && <RunRecapModal runResults={runResults} bankroll={bankroll} onClose={() => setRunRecap(false)} />}
      {cosmeticsOpen && <CosmeticsModal progression={progression} onSelect={selectCosmetic} onClose={() => setCosmeticsOpen(false)} />}
    </div>
  )
}

export default App
