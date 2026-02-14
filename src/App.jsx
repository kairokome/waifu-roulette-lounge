import { useState } from 'react'
import { Shield, Zap, Target, CheckCircle, Clock, Star, Filter, Trophy } from 'lucide-react'

// Initial mission data
const initialMissions = [
  {
    id: 1,
    title: 'Intercept Enemy Convoy',
    description: 'Ambush supply line in Sector 7. High priority target.',
    priority: 'critical',
    status: 'available',
    points: 500,
    assignee: null
  },
  {
    id: 2,
    title: 'Rescue Hostage',
    description: 'Extract operative from enemy base. Stealth required.',
    priority: 'high',
    status: 'available',
    points: 350,
    assignee: null
  },
  {
    id: 3,
    title: 'Data Recovery',
    description: 'Hack enemy server and extract strategic maps.',
    priority: 'medium',
    status: 'available',
    points: 250,
    assignee: null
  },
  {
    id: 4,
    title: 'Escort VIP',
    description: 'Safely transport diplomat to friendly territory.',
    priority: 'high',
    status: 'available',
    points: 300,
    assignee: null
  },
  {
    id: 5,
    title: 'Patrol Border',
    description: 'Monitor border activity and report movements.',
    priority: 'low',
    status: 'available',
    points: 100,
    assignee: null
  },
  {
    id: 6,
    title: 'Sabotage Radar',
    description: 'Disable enemy early warning system.',
    priority: 'medium',
    status: 'available',
    points: 200,
    assignee: null
  },
  {
    id: 7,
    title: 'Gather Intel',
    description: 'Recruit informant in neutral zone.',
    priority: 'low',
    status: 'available',
    points: 150,
    assignee: null
  },
  {
    id: 8,
    title: 'Test New Weapon',
    description: 'Field test experimental plasma rifle.',
    priority: 'medium',
    status: 'available',
    points: 175,
    assignee: null
  },
  {
    id: 9,
    title: 'Training Simulation',
    description: 'Complete combat drills in VR simulator.',
    priority: 'low',
    status: 'available',
    points: 50,
    assignee: null
  },
  {
    id: 10,
    title: 'Maintain Equipment',
    description: 'Service and repair squad gear.',
    priority: 'low',
    status: 'available',
    points: 75,
    assignee: null
  }
]

const priorityColors = {
  critical: 'bg-red-500',
  high: 'bg-amber-500',
  medium: 'bg-cyan-500',
  low: 'bg-slate-500'
}

const priorityLabels = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW'
}

function App() {
  const [missions, setMissions] = useState(initialMissions)
  const [filter, setFilter] = useState('all')
  const [selectedMission, setSelectedMission] = useState(null)

  const totalPoints = missions
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + m.points, 0)

  const availableMissions = missions.filter(m => m.status === 'available')
  const activeMissions = missions.filter(m => m.status === 'active')
  const completedMissions = missions.filter(m => m.status === 'completed')

  const filteredMissions = (missionList) => {
    if (filter === 'all') return missionList
    return missionList.filter(m => m.priority === filter)
  }

  const acceptMission = (id) => {
    setMissions(missions.map(m => 
      m.id === id ? { ...m, status: 'active' } : m
    ))
  }

  const completeMission = (id) => {
    setMissions(missions.map(m => 
      m.id === id ? { ...m, status: 'completed' } : m
    ))
  }

  const MissionCard = ({ mission }) => (
    <div 
      className="bg-navy-800 border border-navy-700 rounded-lg p-4 hover:border-cyan-glow transition-all cursor-pointer hover:glow-cyan"
      onClick={() => setSelectedMission(selectedMission?.id === mission.id ? null : mission)}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-xs font-bold px-2 py-1 rounded ${priorityColors[mission.priority]}`}>
          {priorityLabels[mission.priority]}
        </span>
        <div className="flex items-center text-amber-400">
          <Star className="w-4 h-4 fill-current mr-1" />
          <span className="text-sm font-bold">{mission.points}</span>
        </div>
      </div>
      <h3 className="font-orbitron text-sm font-semibold mb-2 text-cyan-glow">{mission.title}</h3>
      <p className="text-slate-400 text-xs mb-3">{mission.description}</p>
      
      {selectedMission?.id === mission.id && (
        <div className="mt-3 pt-3 border-t border-navy-700">
          {mission.status === 'available' && (
            <button 
              onClick={(e) => { e.stopPropagation(); acceptMission(mission.id) }}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold py-2 px-4 rounded transition-colors"
            >
              ACCEPT MISSION
            </button>
          )}
          {mission.status === 'active' && (
            <button 
              onClick={(e) => { e.stopPropagation(); completeMission(mission.id) }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2 px-4 rounded transition-colors"
            >
              COMPLETE MISSION
            </button>
          )}
          {mission.status === 'completed' && (
            <div className="flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="text-sm font-semibold">COMPLETED</span>
            </div>
          )}
        </div>
      )}
    </div>
  )

  const Column = ({ title, icon: Icon, count, missions, color }) => (
    <div className="flex-1 min-w-[280px]">
      <div className={`flex items-center justify-between mb-4 pb-2 border-b-2 ${color}`}>
        <div className="flex items-center">
          <Icon className={`w-5 h-5 mr-2 ${color.replace('border-', 'text-')}`} />
          <h2 className="font-orbitron font-bold text-lg">{title}</h2>
        </div>
        <span className="bg-navy-800 px-3 py-1 rounded-full text-sm font-semibold">
          {count}
        </span>
      </div>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {filteredMissions(missions).map(mission => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
        {filteredMissions(missions).length === 0 && (
          <div className="text-center text-slate-500 py-8">
            No missions
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header */}
      <header className="bg-navy-800 border-b border-navy-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-cyan-glow mr-3" />
            <div>
              <h1 className="font-orbitron font-bold text-xl text-cyan-glow">ACG MISSION BOARD</h1>
              <p className="text-slate-400 text-xs">Agent Command Grid • Command Center</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-emerald-400 bg-navy-900 px-4 py-2 rounded-lg">
              <Trophy className="w-5 h-5 mr-2" />
              <span className="font-orbitron font-bold">{totalPoints} PTS</span>
            </div>
            <div className="flex items-center text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm">ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <div className="flex items-center mb-6">
          <Filter className="w-5 h-5 text-slate-400 mr-3" />
          <span className="text-slate-400 mr-4">Filter:</span>
          <div className="flex space-x-2">
            {['all', 'critical', 'high', 'medium', 'low'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                  filter === f 
                    ? f === 'all' ? 'bg-cyan-600 text-white' 
                    : `${priorityColors[f]} text-white`
                    : 'bg-navy-800 text-slate-400 hover:bg-navy-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Kanban Columns */}
        <div className="flex space-x-6 overflow-x-auto pb-6">
          <Column 
            title="Available" 
            icon={Target} 
            count={filteredMissions(availableMissions).length}
            missions={availableMissions}
            color="border-red-500"
          />
          <Column 
            title="Active" 
            icon={Zap} 
            count={filteredMissions(activeMissions).length}
            missions={activeMissions}
            color="border-amber-500"
          />
          <Column 
            title="Complete" 
            icon={CheckCircle} 
            count={filteredMissions(completedMissions).length}
            missions={completedMissions}
            color="border-emerald-500"
          />
        </div>
      </main>

      {/* Footer Stats */}
      <footer className="bg-navy-800 border-t border-navy-700 px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex space-x-6">
            <div className="flex items-center text-slate-400">
              <Target className="w-4 h-4 mr-2" />
              <span>Total: {missions.length}</span>
            </div>
            <div className="flex items-center text-amber-400">
              <Clock className="w-4 h-4 mr-2" />
              <span>Active: {activeMissions.length}</span>
            </div>
            <div className="flex items-center text-emerald-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Complete: {completedMissions.length}</span>
            </div>
          </div>
          <div className="text-slate-500">
            ACG Mission Board v1.0
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
