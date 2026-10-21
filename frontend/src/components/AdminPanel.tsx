import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Unlock,
  Key,
  Users,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Award,
  AlertTriangle,
  CheckCircle2,
  FileCode2,
  Sparkles,
  LogOut,
  Send,
  Download,
  Search,
  Eye,
  ArrowLeft,
  Terminal,
  RefreshCw,
  Bell
} from 'lucide-react';
import { ROADMAP_GATES, GateInfo, GateStatus } from '../data/roadmapData';
import { FOLDER_PACKS } from '../data/moduleData';
import { sound } from '../utils/audio';

interface AdminPanelProps {
  onBackToGame: () => void;
  remainingSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onAddMinutes: (mins: number) => void;
  onDeductMinutes: (mins: number) => void;
  onAwardPointsToCurrentTeam?: (pts: number) => void;
}

interface AdminTeam {
  id: string;
  username: string;
  teamName: string;
  captainName: string;
  members: string[];
  house: 'Gryffindor' | 'Ravenclaw' | 'Slytherin' | 'Hufflepuff';
  clearanceLevel: number;
  assignedFolderId: string;
  score: number;
  completedRounds: number[];
  registeredAt: string;
  status?: 'active' | 'eliminated' | 'escaped';
}

export function AdminPanel({
  onBackToGame,
  remainingSeconds,
  isTimerRunning,
  onToggleTimer,
  onResetTimer,
  onAddMinutes,
  onDeductMinutes,
}: AdminPanelProps) {
  // Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem('hogwarts_admin_token'));
  });
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [adminRole, setAdminRole] = useState<string>('Headmaster Administrator');

  // Admin Dashboard State
  const [activeTab, setActiveTab] = useState<'teams' | 'gates' | 'answers' | 'broadcast' | 'audit'>('teams');
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [houseFilter, setHouseFilter] = useState<string>('all');
  const [selectedGate, setSelectedGate] = useState<GateInfo | null>(ROADMAP_GATES[0]);
  const [gateOverrides, setGateOverrides] = useState<Record<number, GateStatus>>({
    1: 'completed',
    2: 'active',
    3: 'locked',
    4: 'locked',
    5: 'locked',
    6: 'locked',
    7: 'locked',
  });

  // Broadcast Alert Message State
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastLog, setBroadcastLog] = useState<Array<{ id: string; time: string; text: string; sender: string }>>([
    {
      id: 'b1',
      time: 'T-90:00',
      text: 'The Dark Protocol AI lockdown is active. All gates sealed.',
      sender: 'Chief Overseer',
    },
    {
      id: 'b2',
      time: 'T-85:00',
      text: 'Reminder: Gate 4 is an ELIMINATION ZONE. Verify calculus boundary integrals before submission.',
      sender: 'System Sentinel',
    },
  ]);

  // Load Teams from Server
  const fetchTeams = async () => {
    const token = sessionStorage.getItem('hogwarts_admin_token');
    try {
      const res = await fetch('/api/admin/teams', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.teams)) {
        setTeams(data.teams);
      }
    } catch {
      // Fallback fallback if offline
      setTeams([
        {
          id: 'team_phoenix',
          username: 'phoenix',
          teamName: 'Order of the Phoenix',
          captainName: 'Harry Potter',
          members: ['Harry Potter', 'Hermione Granger', 'Ron Weasley'],
          house: 'Gryffindor',
          clearanceLevel: 1,
          assignedFolderId: 'folder_alpha',
          score: 450,
          completedRounds: [],
          registeredAt: 'Registered by Administrator',
          status: 'active',
        },
        {
          id: 'team_ravenclaw_guild',
          username: 'ravenclaw',
          teamName: 'Ravenclaw Arithmancy Guild',
          captainName: 'Luna Lovegood',
          members: ['Cho Chang', 'Padma Patil', 'Terry Boot'],
          house: 'Ravenclaw',
          clearanceLevel: 2,
          assignedFolderId: 'folder_gamma',
          score: 600,
          completedRounds: [1],
          registeredAt: 'Registered by Administrator',
          status: 'active',
        },
        {
          id: 'team_slytherin_devs',
          username: 'slytherin',
          teamName: 'Slytherin Parsel-Devs',
          captainName: 'Blaise Zabini',
          members: ['Draco Malfoy', 'Blaise Zabini', 'Theodore Nott'],
          house: 'Slytherin',
          clearanceLevel: 1,
          assignedFolderId: 'folder_beta',
          score: 350,
          completedRounds: [],
          registeredAt: 'Registered by Administrator',
          status: 'active',
        },
        {
          id: 'team_hufflepuff_logic',
          username: 'hufflepuff',
          teamName: 'Hufflepuff Logic Keepers',
          captainName: 'Cedric Diggory',
          members: ['Hannah Abbott', 'Susan Bones', 'Justin Finch-Fletchley'],
          house: 'Hufflepuff',
          clearanceLevel: 1,
          assignedFolderId: 'folder_alpha',
          score: 400,
          completedRounds: [],
          registeredAt: 'Registered by Administrator',
          status: 'active',
        },
      ]);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchTeams();
    }
  }, [isAdminAuthenticated]);

  // Handle Admin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
        }),
      });

      const data = await res.json();
      if (data.ok && data.token) {
        sessionStorage.setItem('hogwarts_admin_token', data.token);
        setIsAdminAuthenticated(true);
        setAdminRole(data.role || 'Headmaster Administrator');
        sound.playSuccess();
      } else {
        setAuthError(data.message || 'Access denied. Master passphrase incorrect.');
        sound.playError();
      }
    } catch {
      // Local fallback check if network issue
      if (adminPassword === 'dumbledore2026' || adminPassword === 'alohomora_admin_2026') {
        sessionStorage.setItem('hogwarts_admin_token', 'local_adm_valid');
        setIsAdminAuthenticated(true);
        sound.playSuccess();
      } else {
        setAuthError('Connection failed or incorrect master passkey.');
        sound.playError();
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    const token = sessionStorage.getItem('hogwarts_admin_token');
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
      sessionStorage.removeItem('hogwarts_admin_token');
    }
    setIsAdminAuthenticated(false);
    setAdminPassword('');
  };

  // Adjust Team Points
  const handleScoreAdjust = async (teamId: string, delta: number) => {
    sound.playSparkle();
    // Update local state immediately
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t))
    );

    // Call server API
    const token = sessionStorage.getItem('hogwarts_admin_token');
    if (token) {
      try {
        await fetch('/api/admin/team/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ teamId, scoreDelta: delta }),
        });
      } catch {
        // ignore
      }
    }
  };

  // Advance Team Clearance Level
  const handleAdvanceLevel = async (teamId: string) => {
    sound.playSuccess();
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          const nextLevel = t.clearanceLevel + 1;
          return {
            ...t,
            clearanceLevel: nextLevel,
            completedRounds: [...t.completedRounds, t.clearanceLevel],
            score: t.score + 150,
          };
        }
        return t;
      })
    );

    const token = sessionStorage.getItem('hogwarts_admin_token');
    if (token) {
      try {
        await fetch('/api/admin/team/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ teamId, clearanceLevel: 2, scoreDelta: 150 }),
        });
      } catch {
        // ignore
      }
    }
  };

  // Reset Team
  const handleResetTeam = async (teamId: string) => {
    if (!window.confirm('Are you sure you want to reset this team score and round progress?')) return;
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, score: 0, clearanceLevel: 1, completedRounds: [] } : t
      )
    );

    const token = sessionStorage.getItem('hogwarts_admin_token');
    if (token) {
      try {
        await fetch('/api/admin/team/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ teamId, reset: true }),
        });
      } catch {
        // ignore
      }
    }
  };

  // Toggle Gate Status Override
  const handleToggleGateStatus = (gateNumber: number) => {
    sound.playSparkle();
    const current = gateOverrides[gateNumber] || 'locked';
    const nextStatus: Record<GateStatus, GateStatus> = {
      locked: 'active',
      active: 'completed',
      completed: 'escaped',
      escaped: 'locked',
    };
    setGateOverrides((prev) => ({
      ...prev,
      [gateNumber]: nextStatus[current],
    }));
  };

  // Send Broadcast Alert
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    sound.playPageTurn();
    const newEntry = {
      id: `b_${Date.now()}`,
      time: `T-${formatTime(remainingSeconds)}`,
      text: broadcastMessage.trim(),
      sender: adminRole,
    };
    setBroadcastLog((prev) => [newEntry, ...prev]);
    setBroadcastMessage('');
  };

  // Export Standings CSV
  const handleExportCSV = () => {
    const headers = ['Rank', 'Team Name', 'House', 'Captain', 'Score', 'Clearance Level', 'Folder'];
    const rows = [...teams]
      .sort((a, b) => b.score - a.score)
      .map((t, idx) => [
        idx + 1,
        `"${t.teamName}"`,
        t.house,
        `"${t.captainName}"`,
        t.score,
        `Round ${t.clearanceLevel}`,
        t.assignedFolderId,
      ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `hogwarts_dark_protocol_standings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format Timer
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredTeams = teams.filter((t) => {
    const matchesHouse = houseFilter === 'all' || t.house.toLowerCase() === houseFilter.toLowerCase();
    const matchesSearch =
      t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.captainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.members.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesHouse && matchesSearch;
  });

  // =========================================================================
  // VIEW 1: UNAUTHENTICATED ADMIN GATEWAY (PARTICIPANTS BLOCKED HERE)
  // =========================================================================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#040812] text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden select-none">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,58,138,0.25)_0%,rgba(4,8,18,0.98)_85%)] pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c59b27] to-transparent opacity-75" />

        {/* Top Header */}
        <header className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#c59b27]" />
            <span className="font-cinzel text-xs tracking-[0.25em] text-[#f3d069] uppercase font-bold">
              ✦ Ministry of Magic · Restricted Archives ✦
            </span>
          </div>
          <button
            onClick={onBackToGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-cinzel transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Escape Room</span>
          </button>
        </header>

        {/* Center Login Vault Card */}
        <main className="relative z-10 max-w-md mx-auto w-full my-auto">
          <div className="rounded-2xl border-2 border-[#c59b27]/60 bg-[#091122]/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-[#040814] border-2 border-[#c59b27] flex items-center justify-center text-[#f3d069] shadow-[0_0_20px_rgba(197,155,39,0.35)]">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="font-cinzel text-lg sm:text-xl font-bold tracking-wider text-[#f3d069] uppercase">
                Admin Command Center
              </h1>
              <p className="font-serif text-xs text-slate-400 italic">
                Restricted access for Chief Overseers and Event Administrators only.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-center gap-2 animate-shake">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-cinzel tracking-wider text-[#d4af37] mb-1.5 uppercase">
                  Staff Identifier
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="e.g. admin or headmaster"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#040814] border border-slate-700 focus:border-[#c59b27] focus:outline-hidden text-sm text-slate-100 font-mono tracking-wide placeholder-slate-600"
                    required
                  />
                  <Shield className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-cinzel tracking-wider text-[#d4af37] mb-1.5 uppercase">
                  Master Passkey
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter administrative passkey..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#040814] border border-slate-700 focus:border-[#c59b27] focus:outline-hidden text-sm text-slate-100 font-mono tracking-wide placeholder-slate-600"
                    required
                  />
                  <Key className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Default Passkey:</span>
                <code className="text-[#f3d069] font-mono bg-black/60 px-1.5 py-0.5 rounded border border-[#c59b27]/30">
                  dumbledore2026
                </code>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#9a7318] via-[#c59b27] to-[#9a7318] hover:from-[#b0841f] hover:to-[#b0841f] text-slate-950 font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(197,155,39,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Verifying Security Clearance...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 text-slate-950" />
                    <span>Authorize & Enter Console</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </main>

        <footer className="relative z-10 text-center font-mono text-[10px] text-slate-600">
          <span>THE DARK PROTOCOL · CLASSIFIED HEADMASTER ARCHIVE · PORT 3000 SECURE</span>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED ADMIN COMMAND CENTER
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-[#c59b27]/40 selection:text-amber-200">
      {/* Top Admin Command Header */}
      <header className="sticky top-0 z-40 bg-[#070e1c]/95 backdrop-blur-md border-b border-[#c59b27]/40 px-4 py-3 sm:px-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#040814] border-2 border-[#c59b27] flex items-center justify-center text-[#f3d069] shadow-[0_0_15px_rgba(197,155,39,0.4)]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel text-sm sm:text-base font-bold text-[#f3d069] tracking-wider uppercase">
                  OVERSEER COMMAND SANCTUARY
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-700 text-red-300 font-mono text-[9px] font-bold uppercase tracking-widest">
                  LIVE ADMIN
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Staff Role: <span className="text-cyan-300">{adminRole}</span> · Pre-Registered Teams: <span className="text-amber-300">{teams.length}</span>
              </p>
            </div>
          </div>

          {/* Master Mission Clock Controls */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#040916] border border-cyan-500/40 shadow-inner">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div className="font-mono text-base font-bold text-cyan-200 tracking-wider">
              {formatTime(remainingSeconds)}
            </div>
            <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
              <button
                onClick={onToggleTimer}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                title={isTimerRunning ? 'Pause Mission Clock' : 'Start Mission Clock'}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
              <button
                onClick={onResetTimer}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                title="Reset to 1h 45m"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => onAddMinutes(5)}
                className="px-1.5 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-[10px] font-mono cursor-pointer"
                title="Add 5 Minutes"
              >
                +5m
              </button>
              <button
                onClick={() => onDeductMinutes(5)}
                className="px-1.5 py-0.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 text-[10px] font-mono cursor-pointer"
                title="Deduct 5 Minutes Penalty"
              >
                -5m
              </button>
            </div>
          </div>

          {/* Actions & Exit */}
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c59b27]/60 bg-[#0a1526] hover:bg-[#0f223d] text-[#f3d069] text-xs font-cinzel transition-all cursor-pointer shadow-md"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Escape Room</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-900/60 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-cinzel transition-all cursor-pointer"
              title="End Admin Session"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/80 overflow-x-auto">
          {[
            { id: 'teams', label: 'Teams & Scores', icon: Users, count: teams.length },
            { id: 'gates', label: '7 Gates Lockdown Protocol', icon: Shield },
            { id: 'answers', label: 'Master Answer Keys', icon: Key },
            { id: 'broadcast', label: 'Owl Broadcast Dispatch', icon: Bell, count: broadcastLog.length },
            { id: 'audit', label: 'Competition Export', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playSparkle();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#c59b27] text-slate-950 shadow-[0_0_12px_rgba(197,155,39,0.4)]'
                    : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-[#f3d069]'}`} />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                      isActive ? 'bg-black/30 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 space-y-6">
        {/* =====================================================================
            MASTER COMPETITION TIMER & SQUAD FREEZE COMMAND BAR
            Authoritative control: Clicking Pause stops all teams where they are.
            ===================================================================== */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
            isTimerRunning
              ? 'bg-gradient-to-r from-[#061324] via-[#091a32] to-[#061324] border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
              : 'bg-gradient-to-r from-[#1c0b0b] via-[#2a0e0e] to-[#1c0b0b] border-amber-500/70 shadow-[0_0_30px_rgba(245,158,11,0.25)]'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`p-3 rounded-xl border flex items-center justify-center ${
                  isTimerRunning
                    ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse'
                }`}
              >
                {isTimerRunning ? <Clock className="w-7 h-7" /> : <Pause className="w-7 h-7" />}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300 font-semibold">
                    MASTER COMPETITION CLOCK
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
                      isTimerRunning
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-amber-950 border-amber-400 text-amber-200 animate-pulse'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isTimerRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'
                      }`}
                    />
                    {isTimerRunning ? 'ACTIVE · RUNNING FOR ALL SQUADS' : 'PAUSED · ALL TEAMS FROZEN WHERE THEY ARE'}
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mt-1">
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-wider tabular-nums drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]">
                    {formatTime(remainingSeconds)}
                  </span>
                  <span className="text-xs font-serif text-slate-300">
                    ({Math.floor(remainingSeconds / 60)}m {remainingSeconds % 60}s remaining of 90m total)
                  </span>
                </div>

                <p className="text-[11px] font-sans text-slate-300/90 mt-0.5">
                  {isTimerRunning
                    ? 'Countdown is synchronizing live across all student squads. Clicking Pause will stop every team immediately.'
                    : 'All squad countdowns are currently locked in place. Teams can still view and submit challenges, but their time will not tick.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
              <button
                onClick={() => {
                  sound.playSparkle();
                  onToggleTimer();
                }}
                className={`px-5 py-2.5 rounded-xl font-cinzel font-bold text-xs sm:text-sm tracking-wider transition-all flex items-center gap-2.5 cursor-pointer shadow-lg hover:scale-105 active:scale-95 ${
                  isTimerRunning
                    ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                    : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white border border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>FREEZE ALL TEAMS (PAUSE CLOCK)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>RESUME ALL TEAMS (UNFREEZE CLOCK)</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5 bg-[#050b16] p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => {
                    sound.playSparkle();
                    onAddMinutes(5);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-mono font-bold cursor-pointer transition hover:scale-105"
                  title="Add 5 Minutes to all squads"
                >
                  +5m
                </button>
                <button
                  onClick={() => {
                    sound.playSparkle();
                    onDeductMinutes(5);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-red-950/90 hover:bg-red-900 border border-red-700 text-red-300 text-xs font-mono font-bold cursor-pointer transition hover:scale-105"
                  title="Deduct 5 Minutes penalty from all squads"
                >
                  -5m
                </button>
                <button
                  onClick={() => {
                    sound.playSealCrack();
                    onResetTimer();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1 cursor-pointer transition"
                  title="Reset clock to 90 minutes"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset 90m</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            TAB 1: TEAMS & SCORES ROSTER
            ===================================================================== */}
        {activeTab === 'teams' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#070e1c] border border-slate-800">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search team, captain, member..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#030712] border border-slate-700 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-[#c59b27]"
                />
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-500" />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <span className="text-[11px] font-cinzel text-slate-400 uppercase tracking-wider mr-1">
                  House:
                </span>
                {['all', 'Gryffindor', 'Ravenclaw', 'Slytherin', 'Hufflepuff'].map((h) => (
                  <button
                    key={h}
                    onClick={() => setHouseFilter(h)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-cinzel transition cursor-pointer capitalize ${
                      houseFilter === h
                        ? 'bg-[#c59b27]/30 border border-[#c59b27] text-[#fef08a] font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Teams Grid / Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeams.map((team) => {
                const houseColors: Record<string, { badge: string; border: string }> = {
                  Gryffindor: { badge: 'bg-red-950 text-red-300 border-red-700', border: 'border-red-900/40' },
                  Ravenclaw: { badge: 'bg-sky-950 text-sky-300 border-sky-700', border: 'border-sky-900/40' },
                  Slytherin: { badge: 'bg-emerald-950 text-emerald-300 border-emerald-700', border: 'border-emerald-900/40' },
                  Hufflepuff: { badge: 'bg-amber-950 text-amber-300 border-amber-700', border: 'border-amber-900/40' },
                };
                const colors = houseColors[team.house] || houseColors.Gryffindor;

                return (
                  <div
                    key={team.id}
                    className={`rounded-xl bg-[#091122]/90 border ${colors.border} p-4 shadow-lg space-y-3 relative hover:border-[#c59b27]/60 transition`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-cinzel border ${colors.badge}`}>
                            {team.house}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            Clearance Lvl {team.clearanceLevel}
                          </span>
                        </div>
                        <h3 className="font-cinzel text-sm font-bold text-slate-100 mt-1">
                          {team.teamName}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-serif">
                          Captain: <strong className="text-slate-200">{team.captainName}</strong>
                        </p>
                      </div>

                      {/* Score Badge */}
                      <div className="text-right">
                        <div className="text-xl font-mono font-bold text-[#fef08a] drop-shadow-[0_0_8px_rgba(254,240,138,0.4)]">
                          {team.score}
                        </div>
                        <div className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
                          Points
                        </div>
                      </div>
                    </div>

                    {/* Members List & Folder */}
                    <div className="text-xs space-y-1">
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Squad Members:</span>
                        <span className="text-cyan-300 font-mono text-[10px]">{team.assignedFolderId}</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono flex flex-wrap gap-1">
                        {team.members.map((m, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800/80 text-[10px]">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick Admin Actions */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleScoreAdjust(team.id, 50)}
                          className="px-2 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-[10px] font-mono font-bold cursor-pointer"
                          title="Award +50 Points"
                        >
                          +50
                        </button>
                        <button
                          onClick={() => handleScoreAdjust(team.id, 100)}
                          className="px-2 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-[10px] font-mono font-bold cursor-pointer"
                          title="Award +100 Points"
                        >
                          +100
                        </button>
                        <button
                          onClick={() => handleScoreAdjust(team.id, -50)}
                          className="px-2 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 text-[10px] font-mono font-bold cursor-pointer"
                          title="Deduct -50 Points Penalty"
                        >
                          -50
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAdvanceLevel(team.id)}
                          className="px-2 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-[10px] font-cinzel font-bold cursor-pointer"
                          title="Promote to Next Round (+150 pts)"
                        >
                          Advance Lvl
                        </button>
                        <button
                          onClick={() => handleResetTeam(team.id)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 transition cursor-pointer"
                          title="Reset team score & rounds"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: SEVEN GATES LOCKDOWN PROTOCOL
            ===================================================================== */}
        {activeTab === 'gates' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#070e1c] border border-cyan-500/40 flex items-center justify-between">
              <div>
                <h2 className="font-cinzel text-base font-bold text-cyan-200">
                  THE DARK PROTOCOL: 7 GATES LOCKDOWN CONTROLLER
                </h2>
                <p className="text-xs font-serif text-slate-400">
                  Click any gate to inspect forensic decryption keys, C++ code samples, and manually toggle security state.
                </p>
              </div>
              <div className="text-xs font-mono text-amber-300 bg-[#030712] px-3 py-1.5 rounded-lg border border-[#c59b27]/40">
                Round 2 = SAFE ZONE · Round 4 = ELIMINATION ZONE
              </div>
            </div>

            {/* Gates Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ROADMAP_GATES.map((gate) => {
                const currentStatus = gateOverrides[gate.gateNumber] || gate.defaultStatus;
                const isSelected = selectedGate?.id === gate.id;

                return (
                  <div
                    key={gate.id}
                    onClick={() => setSelectedGate(gate)}
                    className={`rounded-xl border bg-[#060c18] p-3.5 space-y-3 cursor-pointer transition-all shadow-md ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/30 -translate-y-0.5'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold text-slate-950"
                          style={{ backgroundColor: gate.accentColor }}
                        >
                          {gate.gateNumber}
                        </span>
                        <span className="font-cinzel text-xs font-bold" style={{ color: gate.accentColor }}>
                          Gate {gate.gateNumber}
                        </span>
                      </div>

                      {/* Status Toggle Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleGateStatus(gate.gateNumber);
                        }}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border cursor-pointer ${
                          currentStatus === 'completed'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                            : currentStatus === 'active'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-600 animate-pulse'
                            : currentStatus === 'escaped'
                            ? 'bg-amber-950 text-amber-300 border-amber-600'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                        title="Click to toggle gate status"
                      >
                        {currentStatus}
                      </button>
                    </div>

                    {/* Image & Title */}
                    <div className="relative h-28 rounded-lg overflow-hidden border border-slate-800 bg-black">
                      <img
                        src={gate.imageUrl}
                        alt={gate.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div
                        className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border backdrop-blur-md ${
                          gate.zoneType === 'SAFE ZONE'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                            : gate.zoneType === 'ELIMINATION ZONE'
                            ? 'bg-red-950/80 text-red-300 border-red-500'
                            : 'bg-amber-950/80 text-amber-300 border-amber-500'
                        }`}
                      >
                        {gate.zoneType}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-cinzel text-xs font-bold text-slate-100 truncate">
                        {gate.title}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400 truncate">
                        {gate.file} · {gate.targetTime}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Gate Detail Inspector */}
            {selectedGate && (
              <div className="rounded-xl bg-[#060c18] border-2 border-[#c59b27]/60 p-5 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#c59b27]/20 border border-[#c59b27] text-[#fef08a]">
                        Gate {selectedGate.gateNumber} Inspector
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          selectedGate.zoneType === 'SAFE ZONE'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                            : selectedGate.zoneType === 'ELIMINATION ZONE'
                            ? 'bg-red-950 text-red-300 border-red-600'
                            : 'bg-amber-950 text-amber-300 border-amber-600'
                        }`}
                      >
                        {selectedGate.zoneType}
                      </span>
                    </div>
                    <h3 className="font-cinzel text-lg font-bold text-slate-100 mt-1">
                      {selectedGate.title} — {selectedGate.category}
                    </h3>
                  </div>

                  {Boolean(
                    selectedGate.file &&
                    selectedGate.file.trim() !== '' &&
                    !selectedGate.file.toLowerCase().includes('no file') &&
                    selectedGate.gateNumber !== 5 &&
                    selectedGate.gateNumber !== 6 &&
                    selectedGate.gateNumber !== 7
                  ) && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">Target File:</span>
                      <code className="text-xs font-mono text-cyan-300 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                        {selectedGate.file}
                      </code>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-xs font-cinzel text-[#d4af37] uppercase font-bold mb-1">
                        Challenge Objective
                      </h5>
                      <p className="text-xs text-slate-300 font-serif leading-relaxed">
                        {selectedGate.technicalDetails?.objective || selectedGate.description}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-xs font-cinzel text-[#d4af37] uppercase font-bold mb-1">
                        Warden's Master Unlock Key
                      </h5>
                      <div className="p-2.5 rounded-lg bg-[#030712] border border-amber-500/40 flex items-center justify-between">
                        <span className="font-mono text-xs text-amber-300 font-bold">
                          {selectedGate.technicalDetails?.unlockKeyName || 'FREEDOM_EXIT_SEQUENCE'}
                        </span>
                        <Key className="w-4 h-4 text-amber-400" />
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-cinzel text-[#d4af37] uppercase font-bold mb-1">
                        Staff Hint / Forensic Clue
                      </h5>
                      <p className="text-xs text-slate-400 italic">
                        {selectedGate.technicalDetails?.forensicHint || 'No additional hints configured.'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-cinzel text-cyan-300 uppercase font-bold mb-1 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Code / Cipher Manifest Preview</span>
                    </h5>
                    <pre className="p-3 rounded-lg bg-[#02050c] border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-48 scrollbar-thin">
                      {selectedGate.technicalDetails?.sampleCodeOrSnippet || selectedGate.technicalDetails?.fileContentPreview}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 3: MASTER ANSWER KEYS & CHALLENGE PACKS
            ===================================================================== */}
        {activeTab === 'answers' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#070e1c] border border-[#c59b27]/40 flex items-center justify-between">
              <div>
                <h2 className="font-cinzel text-base font-bold text-[#f3d069]">
                  RESTRICTED MASTER SOLUTIONS & VERIFICATION MANIFEST
                </h2>
                <p className="text-xs font-serif text-slate-400">
                  Pre-computed solutions for Folder Alpha, Folder Beta, and Folder Gamma.
                </p>
              </div>
              <span className="text-[10px] font-mono text-red-400 bg-red-950/80 px-2 py-1 rounded border border-red-800 uppercase font-bold">
                CONFIDENTIAL
              </span>
            </div>

            <div className="space-y-4">
              {FOLDER_PACKS.map((pack) => (
                <div key={pack.id} className="rounded-xl bg-[#060c18] border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-[#c59b27]" />
                      <h3 className="font-cinzel text-sm font-bold text-slate-100">
                        {pack.title} — {pack.cipherCategory}
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      ID: {pack.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {pack.challenges.map((ch, idx) => (
                      <div key={ch.id} className="p-3 rounded-lg bg-[#030712] border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-cinzel text-amber-400 font-bold uppercase">
                            Challenge {idx + 1}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            +{ch.points} pts
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200">{ch.title}</h4>
                        <p className="text-[11px] text-slate-400 font-serif line-clamp-2">
                          {ch.subtitle} · {ch.cipherPrompt}
                        </p>
                        <div className="p-2 rounded bg-black/60 border border-[#c59b27]/40 space-y-1">
                          <div className="text-[9px] font-mono text-slate-500 uppercase">Exact Solution:</div>
                          <code className="text-xs font-mono font-bold text-[#fef08a] break-all">
                            {ch.solution}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: OWL DISPATCH / BROADCAST CONSOLE
            ===================================================================== */}
        {activeTab === 'broadcast' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#070e1c] border border-cyan-500/40">
              <h2 className="font-cinzel text-base font-bold text-cyan-200 flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span>OWL DISPATCH & EMERGENCY BROADCAST TERMINAL</span>
              </h2>
              <p className="text-xs font-serif text-slate-400">
                Broadcast instant hints, warnings, or time alerts to all participant screens.
              </p>
            </div>

            {/* Broadcast Input */}
            <form onSubmit={handleSendBroadcast} className="p-4 rounded-xl bg-[#060c18] border border-slate-800 space-y-3">
              <label className="block text-xs font-cinzel text-[#d4af37] uppercase font-bold">
                Broadcast Announcement Message
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="e.g. Attention squads: Gate 5 code corruptions require SHA-256 slice validation..."
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#030712] border border-slate-700 text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-[#c59b27]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-[#c59b27] hover:bg-[#d4af37] text-slate-950 font-cinzel font-bold text-xs uppercase transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Owl</span>
                </button>
              </div>
            </form>

            {/* Past Broadcasts Log */}
            <div className="rounded-xl bg-[#060c18] border border-slate-800 p-4 space-y-3">
              <h3 className="font-cinzel text-xs font-bold text-slate-300 uppercase">
                Broadcast Dispatch Log
              </h3>
              <div className="space-y-2">
                {broadcastLog.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-[#030712] border border-slate-800/80 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">
                          [{log.time}]
                        </span>
                        <span className="text-[10px] font-cinzel text-amber-400">
                          {log.sender}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-mono">{log.text}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 5: COMPETITION AUDIT & EXPORT
            ===================================================================== */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#070e1c] border border-[#c59b27]/40 flex items-center justify-between">
              <div>
                <h2 className="font-cinzel text-base font-bold text-[#f3d069]">
                  COMPETITION AUDIT & STANDINGS EXPORT
                </h2>
                <p className="text-xs font-serif text-slate-400">
                  Generate official competition reports, CSV spreadsheets, and forensic logs.
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c59b27] hover:bg-[#d4af37] text-slate-950 font-cinzel font-bold text-xs uppercase transition cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV Report</span>
              </button>
            </div>

            <div className="rounded-xl bg-[#060c18] border border-slate-800 p-4 space-y-3">
              <h3 className="font-cinzel text-xs font-bold text-slate-300 uppercase">
                Live Squad Rankings Snapshot
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="bg-[#030712] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">Team</th>
                      <th className="py-2.5 px-3">House</th>
                      <th className="py-2.5 px-3">Captain</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Clearance</th>
                      <th className="py-2.5 px-3">Folder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {[...teams]
                      .sort((a, b) => b.score - a.score)
                      .map((t, idx) => (
                        <tr key={t.id} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-3 font-bold text-amber-400">#{idx + 1}</td>
                          <td className="py-2.5 px-3 font-sans font-bold text-slate-100">{t.teamName}</td>
                          <td className="py-2.5 px-3">{t.house}</td>
                          <td className="py-2.5 px-3 text-slate-300">{t.captainName}</td>
                          <td className="py-2.5 px-3 font-bold text-[#fef08a]">{t.score}</td>
                          <td className="py-2.5 px-3 text-cyan-300">Round {t.clearanceLevel}</td>
                          <td className="py-2.5 px-3 text-slate-400">{t.assignedFolderId}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#040814] px-4 py-3 text-center text-xs text-slate-500 font-mono">
        <span>MINISTRY OF MAGIC · HIGH INQUISITOR CONSOLE · SECURE INTERNAL SYSTEM</span>
      </footer>
    </div>
  );
}
