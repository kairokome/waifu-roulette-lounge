import { useState, useEffect } from 'react'
import { Shield, Coins, RotateCcw, Volume2, VolumeX, Sparkles, Trophy } from 'lucide-react'

// ============= CONSTANTS =============
const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
const BLACK_NUMBERS = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35]
const INITIAL_BANKROLL = 1000

// ============= ROULETTE ENGINE =============
function spinRoulette() {
  const number = Math.floor(Math.random() * 37) // 0-36
  const isZero = number === 0
  const isRed = RED_NUMBERS.includes(number)
  const isBlack = BLACK_NUMBERS.includes(number)
  const isOdd = number % 2 === 1
  const isEven = number % 2 === 0 && number !== 0
  const isFirstDozen = number >= 1 && number <= 12
  const isSecondDozen = number >= 13 && number <= 24
  const isThirdDozen = number >= 25 && number <= 36
  
  return {
    number,
    isZero,
    isRed,
    isBlack,
    isOdd,
    isEven,
    isFirstDozen,
    isSecondDozen,
    isThirdDozen
  }
}

function getColor(number) {
  if (number === 0) return 'green'
  return RED_NUMBERS.includes(number) ? 'red' : 'black'
}

// ============= LOCAL STORAGE =============
function loadGameState() {
  try {
    const saved = localStorage.getItem('waifuRoulette')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load game state:', e)
  }
  return null
}

function saveGameState(state) {
  try {
    localStorage.setItem('waifuRoulette', JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save game state:', e)
  }
}

// ============= COMPONENTS =============
const DealerAvatar = ({ mood }) => {
  const moods = {
    happy: '😊',
    excited: '😄',
    neutral: '😐',
    sad: '😢',
    shocked: '😱'
  }
  return (
    <div className="text-8xl animate-bounce-slow filter drop-shadow-lg">
      {moods[mood] || '🎰'}
    </div>
  )
}

const SpeechBubble = ({ message, visible }) => {
  if (!visible) return null
  return (
    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-4 py-2 rounded-xl shadow-lg animate-pulse">
      {message}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-white"></div>
    </div>
  )
}

const MoodMeter = ({ mood }) => {
  const colors = {
    happy: 'bg-green-400',
    excited: 'bg-yellow-400',
    neutral: 'bg-gray-400',
    sad: 'bg-blue-400',
    shocked: 'bg-red-400'
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Mood</span>
      <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${colors[mood]} transition-all duration-500`} style={{ width: '60%' }}></div>
      </div>
    </div>
  )
}

const RouletteWheel = ({ spinning, result, isAnimating }) => {
  const numbers = Array.from({ length: 37 }, (_, i) => i)
  
  return (
    <div className="relative w-64 h-64 rounded-full border-8 border-yellow-600 bg-gray-900 flex items-center justify-center overflow-hidden shadow-2xl">
      {/* Wheel numbers */}
      <div className={`absolute inset-0 transition-transform ${spinning ? 'animate-spin' : ''}`}
           style={{ 
             animationDuration: spinning ? '2s' : '0s',
             animationTimingFunction: spinning ? 'ease-out' : 'initial'
           }}>
        <div className="w-full h-full relative">
          {numbers.map((num, i) => {
            const angle = (i * 360) / 37
            const color = num === 0 ? 'bg-green-500' : RED_NUMBERS.includes(num) ? 'bg-red-600' : 'bg-gray-800'
            return (
              <div
                key={num}
                className={`absolute w-8 h-8 ${color} rounded-full flex items-center justify-center text-xs font-bold text-white transform -translate-x-1/2 -translate-y-1/2`}
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-100px) rotate(-${angle}deg)`
                }}
              >
                {num}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center shadow-inner z-10">
          <span className="text-2xl font-bold text-yellow-900">
            {result !== null ? result : '🎰'}
          </span>
        </div>
      </div>
      
      {/* Pointer */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-yellow-500 z-20"></div>
    </div>
  )
}

function App() {
  // ============= STATE =============
  const [bankroll, setBankroll] = useState(() => loadGameState()?.bankroll || INITIAL_BANKROLL)
  const [history, setHistory] = useState(() => loadGameState()?.history || [])
  const [bets, setBets] = useState({})
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [mood, setMood] = useState('neutral')
  const [speech, setSpeech] = useState('')
  const [showSpeech, setShowSpeech] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Bet amounts
  const [betAmounts, setBetAmounts] = useState({
    red: 0,
    black: 0,
    odd: 0,
    even: 0,
    first12: 0,
    second12: 0,
    third12: 0
  })
  
  const totalBet = Object.values(betAmounts).reduce((a, b) => a + b, 0)
  
  // ============= EFFECTS =============
  useEffect(() => {
    saveGameState({ bankroll, history, settings: { sound: soundEnabled } })
  }, [bankroll, history, soundEnabled])
  
  // ============= HELPERS =============
  const placeBet = (type, amount) => {
    if (spinning) return
    if (amount <= 0) return
    
    const currentTotal = totalBet + amount
    if (currentTotal > bankroll) {
      setSpeech('Not enough chips!')
      setShowSpeech(true)
      setTimeout(() => setShowSpeech(false), 2000)
      return
    }
    
    setBetAmounts(prev => ({ ...prev, [type]: amount }))
  }
  
  const clearBets = () => {
    if (spinning) return
    setBetAmounts({
      red: 0,
      black: 0,
      odd: 0,
      even: 0,
      first12: 0,
      second12: 0,
      third12: 0
    })
  }
  
  const spin = () => {
    if (spinning || totalBet === 0) return
    
    setSpinning(true)
    setIsAnimating(true)
    setMood('excited')
    setSpeech('Good luck!')
    setShowSpeech(true)
    
    // Animation sequence
    let spinCount = 0
    const spinInterval = setInterval(() => {
      setResult(Math.floor(Math.random() * 37))
      spinCount++
      if (spinCount > 15) {
        clearInterval(spinInterval)
        
        // Actual result
        const actualResult = spinRoulette()
        setResult(actualResult.number)
        
        // Calculate winnings
        let winnings = 0
        
        // Red/Black (1:1)
        if (betAmounts.red > 0 && actualResult.isRed) winnings += betAmounts.red * 2
        if (betAmounts.black > 0 && actualResult.isBlack) winnings += betAmounts.black * 2
        
        // Odd/Even (1:1)
        if (betAmounts.odd > 0 && actualResult.isOdd) winnings += betAmounts.odd * 2
        if (betAmounts.even > 0 && actualResult.isEven) winnings += betAmounts.even * 2
        
        // Dozens (2:1)
        if (betAmounts.first12 > 0 && actualResult.isFirstDozen) winnings += betAmounts.first12 * 3
        if (betAmounts.second12 > 0 && actualResult.isSecondDozen) winnings += betAmounts.second12 * 3
        if (betAmounts.third12 > 0 && actualResult.isThirdDozen) winnings += betAmounts.third12 * 3
        
        const netGain = winnings - totalBet
        const newBankroll = bankroll + netGain
        
        setBankroll(newBankroll)
        
        // Update history
        const newHistory = [
          { 
            spin: history.length + 1, 
            number: actualResult.number, 
            color: getColor(actualResult.number),
            bet: totalBet,
            result: netGain
          },
          ...history
        ].slice(0, 10)
        
        setHistory(newHistory)
        
        // Update mood and speech based on result
        setTimeout(() => {
          setSpinning(false)
          setIsAnimating(false)
          
          if (netGain > 0) {
            setMood('happy')
            setSpeech(`You won ${netGain} chips! 🎉`)
          } else if (netGain < 0) {
            setMood('sad')
            setSpeech(`Better luck next time!`)
          } else {
            setMood('neutral')
            setSpeech(`Push - no loss, no gain`)
          }
          
          setTimeout(() => setShowSpeech(false), 3000)
          
          // Clear bets after spin
          clearBets()
        }, 1500)
      }
    }, 150)
  }
  
  const resetGame = () => {
    if (spinning) return
    setBankroll(INITIAL_BANKROLL)
    setHistory([])
    clearBets()
    setMood('neutral')
    setSpeech('Game reset! Good luck!')
    setShowSpeech(true)
    setTimeout(() => setShowSpeech(false), 2000)
  }
  
  // ============= BET BUTTONS =============
  const BetButton = ({ label, type, color }) => (
    <div className="flex items-center justify-between bg-gray-800 rounded-lg p-2 mb-2">
      <span className={`font-bold ${color}`}>{label}</span>
      <div className="flex items-center gap-1">
        <button 
          onClick={() => placeBet(type, Math.max(0, betAmounts[type] - 10))}
          className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
          disabled={spinning}
        >-</button>
        <span className="w-12 text-center text-yellow-400">{betAmounts[type]}</span>
        <button 
          onClick={() => placeBet(type, betAmounts[type] + 10)}
          className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
          disabled={spinning}
        >+</button>
      </div>
    </div>
  )
  
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
          
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-black/40 px-4 py-2 rounded-full">
              <Coins className="text-yellow-400 mr-2" />
              <span className="font-orbitron text-2xl text-yellow-400">{bankroll.toLocaleString()}</span>
              <span className="text-yellow-600/60 ml-1">CHIPS</span>
            </div>
            
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition"
            >
              {soundEnabled ? <Volume2 className="text-pink-400" /> : <VolumeX className="text-gray-500" />}
            </button>
            
            <button 
              onClick={resetGame}
              className="p-2 rounded-full bg-black/40 hover:bg-red-900/60 transition"
              disabled={spinning}
            >
              <RotateCcw className="text-pink-400" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Game Area */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Dealer Panel */}
          <div className="bg-black/40 rounded-2xl p-6 flex flex-col items-center">
            <h2 className="font-orbitron text-pink-400 mb-4">DEALER</h2>
            
            <div className="relative mb-4">
              <DealerAvatar mood={mood} />
              <SpeechBubble message={speech} visible={showSpeech} />
            </div>
            
            <MoodMeter mood={mood} />
            
            <div className="mt-6 text-center text-gray-400 text-sm">
              <p>Place your bets!</p>
              <p className="mt-2">Good luck, friend! ✨</p>
            </div>
          </div>
          
          {/* CENTER: Wheel Panel */}
          <div className="bg-black/40 rounded-2xl p-6 flex flex-col items-center">
            <h2 className="font-orbitron text-pink-400 mb-4">ROULETTE</h2>
            
            <RouletteWheel spinning={spinning} result={result} isAnimating={isAnimating} />
            
            <button
              onClick={spin}
              disabled={spinning || totalBet === 0}
              className={`mt-6 px-8 py-3 rounded-full font-orbitron font-bold text-xl transition-all ${
                spinning || totalBet === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-lg hover:shadow-pink-500/50'
              }`}
            >
              {spinning ? 'SPINNING...' : totalBet === 0 ? 'PLACE BETS' : 'SPIN!'}
            </button>
            
            {/* Last 10 Results */}
            <div className="mt-6 w-full">
              <h3 className="text-gray-400 text-sm mb-2 text-center">LAST 10 SPINS</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {history.length === 0 ? (
                  <span className="text-gray-500 text-sm">No spins yet</span>
                ) : (
                  history.map((h, i) => (
                    <span 
                      key={i}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        h.color === 'red' ? 'bg-red-600' : 
                        h.color === 'black' ? 'bg-gray-800' : 'bg-green-600'
                      } text-white`}
                    >
                      {h.number}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* RIGHT: Betting Panel */}
          <div className="bg-black/40 rounded-2xl p-6">
            <h2 className="font-orbitron text-pink-400 mb-4">BETS</h2>
            
            <div className="text-center mb-4 pb-4 border-b border-gray-700">
              <span className="text-gray-400">Total Bet: </span>
              <span className="text-yellow-400 font-orbitron text-xl">{totalBet}</span>
            </div>
            
            {/* Bet Buttons */}
            <BetButton label="🔴 Red" type="red" color="text-red-400" />
            <BetButton label="⚫ Black" type="black" color="text-gray-400" />
            <BetButton label="Odd" type="odd" color="text-pink-400" />
            <BetButton label="Even" type="even" color="text-blue-400" />
            
            <div className="my-4 border-t border-gray-700 pt-4">
              <p className="text-gray-400 text-sm mb-2">Dozens (2:1)</p>
              <BetButton label="1-12" type="first12" color="text-orange-400" />
              <BetButton label="13-24" type="second12" color="text-orange-400" />
              <BetButton label="25-36" type="third12" color="text-orange-400" />
            </div>
            
            {totalBet > 0 && !spinning && (
              <button
                onClick={clearBets}
                className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition"
              >
                Clear Bets
              </button>
            )}
            
            {/* Payouts Info */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-gray-500 text-xs text-center">Payouts</p>
              <div className="text-xs text-gray-400 mt-2 space-y-1">
                <p>Red/Black, Odd/Even: <span className="text-green-400">1:1</span></p>
                <p>Dozens: <span className="text-green-400">2:1</span></p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-black/40 border-t border-pink-500/30 py-4 mt-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-pink-300/60 text-sm">
            🎮 Entertainment only. No real wagering. Fake chips have no value. 🎮
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
