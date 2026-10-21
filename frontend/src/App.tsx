'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MagicalBookOpening } from './components/MagicalBookOpening';
import { MainPortal } from './components/MainPortal';
import { DarkProtocolRoadmap } from './components/DarkProtocolRoadmap';
import { AdminPanel } from './components/AdminPanel';
import { SparkleCursor } from './components/SparkleCursor';
import { CharacterTimekeeperAlert } from './components/CharacterTimekeeperAlert';
import { TeamProfile, FolderAllocation, LeaderboardEntry } from './types';
import { INITIAL_LEADERBOARD, FOLDER_PACKS } from './data/moduleData';
import { sound } from './utils/audio';

export default function App() {
  const [viewMode, setViewMode] = useState<'roadmap' | 'book' | 'portal' | 'admin'>('book');
  const [currentTeam, setCurrentTeam] = useState<TeamProfile | null>(null);
  const [allocatedFolder, setAllocatedFolder] = useState<FolderAllocation | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);
  
  // Competition Timer (starts with 90 minutes = 5400 seconds)
  const [remainingSeconds, setRemainingSeconds] = useState(90 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Sparkles Cursor State
  const [sparklesEnabled, setSparklesEnabled] = useState(true);

  // Discrete staff shortcut (Ctrl + Shift + A) & intentional hash navigation
  useEffect(() => {
    // Strictly ensure that on fresh load or reload, the website ALWAYS defaults to the Magical Book!
    if (window.location.hash.toLowerCase() === '#admin') {
      try {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {
        window.location.hash = '';
      }
    }

    const handleCheckHash = () => {
      // Only switch to admin if explicitly triggered while using the app
      if (window.location.hash.toLowerCase() === '#admin') {
        setViewMode('admin');
      }
    };
    window.addEventListener('hashchange', handleCheckHash);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Discrete staff shortcut: Ctrl + Shift + A or Cmd + Shift + A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setViewMode((prev) => {
          if (prev === 'admin') {
            window.location.hash = '';
            return 'book';
          } else {
            window.location.hash = '#admin';
            return 'admin';
          }
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleCheckHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Countdown clock loop - Strictly ticks only when login is done (currentTeam exists and isTimerRunning is true)
  useEffect(() => {
    if (!isTimerRunning || !currentTeam) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, currentTeam]);

  // Master Timer Polling - Synchronizes countdown across ALL teams & freezes immediately when Admin pauses
  useEffect(() => {
    let isMounted = true;
    const syncMasterTimer = async () => {
      try {
        const res = await fetch('/api/timer/state');
        if (!res.ok) return;
        const data = await res.json();
        if (data.ok && isMounted) {
          // If paused by Overseer Admin, immediately halt timer and freeze remainingSeconds
          if (data.pausedByAdmin || !data.isTimerRunning) {
            setIsTimerRunning(false);
            setRemainingSeconds(data.remainingSeconds);
          } else if (data.isTimerRunning) {
            // If running and squad is logged in
            if (currentTeam) {
              setIsTimerRunning(true);
            }
            // Align drift if difference exceeds 2 seconds
            setRemainingSeconds((prev) => {
              if (Math.abs(prev - data.remainingSeconds) > 2) {
                return data.remainingSeconds;
              }
              return prev;
            });
          }
        }
      } catch {
        // network resilience fallback
      }
    };

    syncMasterTimer();
    const interval = setInterval(syncMasterTimer, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentTeam]);

  // Check for existing valid session on mount
  useEffect(() => {
    const token = localStorage.getItem('hogwarts_auth_token');
    if (!token) return;

    fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.team) {
          const team: TeamProfile = data.team;
          setCurrentTeam(team);
          const matchedFolder =
            FOLDER_PACKS.find((f) => f.id === team.assignedFolderId) || FOLDER_PACKS[0];
          setAllocatedFolder(JSON.parse(JSON.stringify(matchedFolder)));
          // fetch timer state to determine whether timer is currently running or paused by admin
          fetch('/api/timer/state')
            .then((r) => r.json())
            .then((tData) => {
              if (tData.ok) {
                setIsTimerRunning(!tData.pausedByAdmin && tData.isTimerRunning);
                setRemainingSeconds(tData.remainingSeconds);
              } else {
                setIsTimerRunning(true);
              }
            })
            .catch(() => {
              setIsTimerRunning(true);
            });
        } else {
          localStorage.removeItem('hogwarts_auth_token');
        }
      })
      .catch(() => {
        // network or server offline, keep clean state
      });
  }, []);

  // Handle Team Login & Folder Assignment (Starts Round 1!)
  const handleRegisterTeam = (team: TeamProfile, folder: FolderAllocation) => {
    setCurrentTeam(team);
    // Deep clone folder so challenge states are team-specific
    setAllocatedFolder(JSON.parse(JSON.stringify(folder)));
    // Time automatically starts unless paused by admin!
    fetch('/api/timer/state')
      .then((r) => r.json())
      .then((tData) => {
        if (tData.ok && tData.pausedByAdmin) {
          setIsTimerRunning(false);
          setRemainingSeconds(tData.remainingSeconds);
        } else {
          setIsTimerRunning(true);
        }
      })
      .catch(() => {
        setIsTimerRunning(true);
      });
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('hogwarts_auth_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
      localStorage.removeItem('hogwarts_auth_token');
    }
    setCurrentTeam(null);
    setAllocatedFolder(null);
    setIsTimerRunning(false);
  };

  // Handle Solving a Challenge in Round 1
  const handleSolveChallenge = (challengeId: string, rawAnswer: string): boolean => {
    if (!allocatedFolder || !currentTeam) return false;

    const challenge = allocatedFolder.challenges.find((c) => c.id === challengeId);
    if (!challenge) return false;

    const normalizedUser = rawAnswer.trim().toUpperCase().replace(/\s+/g, ' ');
    const normalizedSol = challenge.solution.trim().toUpperCase().replace(/\s+/g, ' ');

    if (normalizedUser === normalizedSol || normalizedUser.includes(normalizedSol)) {
      // Mark as solved
      const updatedChallenges = allocatedFolder.challenges.map((c) =>
        c.id === challengeId ? { ...c, isSolved: true, userAnswer: rawAnswer } : c
      );
      setAllocatedFolder({
        ...allocatedFolder,
        challenges: updatedChallenges,
      });

      // Update team score
      const newScore = currentTeam.score + challenge.points;
      setCurrentTeam({
        ...currentTeam,
        score: newScore,
      });

      return true;
    }

    return false;
  };

  // Handle Advancing to Round 2
  const handleAdvanceToRoundTwo = () => {
    sound.playSuccess();
    if (currentTeam) {
      const newScore = currentTeam.score + 200;
      setCurrentTeam({
        ...currentTeam,
        score: newScore,
        clearanceLevel: 2,
        completedRounds: [...currentTeam.completedRounds, 1],
      });
      // Update leaderboard entry
      setLeaderboard((prev) => [
        {
          rank: 1,
          teamName: currentTeam.teamName,
          house: currentTeam.house,
          score: newScore,
          solvedCount: 3,
          lastSolveTime: 'Just now',
          status: 'Advancing to Round 2',
        },
        ...prev.slice(0, 4),
      ]);
    }
  };

  // Timer controls synced with Server & All Teams
  const handleToggleTimer = async () => {
    const adminToken = sessionStorage.getItem('hogwarts_admin_token');
    try {
      const res = await fetch('/api/admin/timer/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({ action: 'toggle' }),
      });
      const data = await res.json();
      if (data.ok) {
        setIsTimerRunning(data.isTimerRunning);
        setRemainingSeconds(data.remainingSeconds);
      }
    } catch {
      setIsTimerRunning((prev) => !prev);
    }
  };

  const handleResetTimer = async () => {
    const adminToken = sessionStorage.getItem('hogwarts_admin_token');
    try {
      const res = await fetch('/api/admin/timer/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({ action: 'reset', seconds: 90 * 60 }),
      });
      const data = await res.json();
      if (data.ok) {
        setRemainingSeconds(data.remainingSeconds);
      }
    } catch {
      setRemainingSeconds(90 * 60);
    }
  };

  const handleAddMinutes = async (mins: number) => {
    const adminToken = sessionStorage.getItem('hogwarts_admin_token');
    try {
      const res = await fetch('/api/admin/timer/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({ action: 'add', minutes: mins }),
      });
      const data = await res.json();
      if (data.ok) {
        setRemainingSeconds(data.remainingSeconds);
      }
    } catch {
      setRemainingSeconds((prev) => prev + mins * 60);
    }
  };

  const handleDeductMinutes = async (mins: number) => {
    const adminToken = sessionStorage.getItem('hogwarts_admin_token');
    try {
      const res = await fetch('/api/admin/timer/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({ action: 'deduct', minutes: mins }),
      });
      const data = await res.json();
      if (data.ok) {
        setRemainingSeconds(data.remainingSeconds);
      }
    } catch {
      setRemainingSeconds((prev) => Math.max(0, prev - mins * 60));
    }
  };

  const handleAwardPoints = (pts: number) => {
    if (currentTeam) {
      setCurrentTeam({
        ...currentTeam,
        score: currentTeam.score + pts,
      });
    }
  };

  const remainingMinutes = Math.max(1, Math.round(remainingSeconds / 60));

  return (
    <div className="min-h-screen bg-[#060c18] text-slate-100 font-sans selection:bg-[#c59b27]/30 selection:text-[#fef08a]">
      {/* Custom Magical Sparkle Cursor */}
      <SparkleCursor enabled={sparklesEnabled} />

      {/* Global Overseer Timer Freeze Notice Banner across all squad views */}
      {!isTimerRunning && Boolean(currentTeam) && viewMode !== 'admin' && (
        <div className="sticky top-0 z-50 bg-[#1e0a0a]/95 border-b border-amber-500/80 px-4 py-2 text-xs font-mono text-amber-200 flex items-center justify-center gap-2.5 backdrop-blur-md shadow-[0_4px_20px_rgba(245,158,11,0.25)]">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-cinzel font-bold text-amber-300 uppercase tracking-wider">
            ⏸ Master Competition Clock Frozen:
          </span>
          <span className="text-slate-200">
            The Overseer Administrator has paused the timer. All squad clocks are held in place.
          </span>
        </div>
      )}

      {/* 15-Minute Character Timekeeper Alerts (Dumbledore, Hermione, Harry, Snape, McGonagall) */}
      <CharacterTimekeeperAlert
        remainingMinutes={remainingMinutes}
        isTimerRunning={isTimerRunning && Boolean(currentTeam)}
      />

      {/* Main View Transition: Roadmap vs. 3D Book vs. Second Homepage Portal */}
      {viewMode === 'roadmap' && (
        <DarkProtocolRoadmap
          onBackToGrimoire={() => setViewMode('book')}
          onEnterPortal={() => setViewMode('portal')}
          initialRemainingSeconds={90 * 60}
          remainingSeconds={remainingSeconds}
          isTimerRunning={isTimerRunning}
          isLoggedIn={Boolean(currentTeam)}
        />
      )}

      {viewMode === 'book' && (
        <MagicalBookOpening
          onEnterModulePortal={() => setViewMode('portal')}
          onOpenRoadmap={() => setViewMode('roadmap')}
          onOpenAdmin={() => {
            window.location.hash = '#admin';
            setViewMode('admin');
          }}
          isLoggedIn={Boolean(currentTeam)}
          remainingSeconds={remainingSeconds}
          isTimerRunning={isTimerRunning}
        />
      )}

      {viewMode === 'portal' && (
        <MainPortal
          onBackToBook={() => setViewMode('book')}
          onOpenRoadmap={() => setViewMode('roadmap')}
          currentTeam={currentTeam}
          allocatedFolder={allocatedFolder}
          onRegisterTeam={handleRegisterTeam}
          onLogout={handleLogout}
          onSolveChallenge={handleSolveChallenge}
          onAdvanceToRoundTwo={handleAdvanceToRoundTwo}
          leaderboard={leaderboard}
          remainingSeconds={remainingSeconds}
          isTimerRunning={isTimerRunning}
          onToggleTimer={handleToggleTimer}
          onResetTimer={handleResetTimer}
          onAddMinutes={handleAddMinutes}
          onDeductMinutes={handleDeductMinutes}
          onAwardPoints={handleAwardPoints}
          sparklesEnabled={sparklesEnabled}
          onToggleSparkles={() => setSparklesEnabled(!sparklesEnabled)}
        />
      )}

      {/* Admin Sanctuary - Only accessible by authorized overseers */}
      {viewMode === 'admin' && (
        <AdminPanel
          onBackToGame={() => {
            window.location.hash = '';
            setViewMode('book');
          }}
          remainingSeconds={remainingSeconds}
          isTimerRunning={isTimerRunning}
          onToggleTimer={handleToggleTimer}
          onResetTimer={handleResetTimer}
          onAddMinutes={handleAddMinutes}
          onDeductMinutes={handleDeductMinutes}
          onAwardPointsToCurrentTeam={handleAwardPoints}
        />
      )}
    </div>
  );
}
