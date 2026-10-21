import React from 'react';
import { Trophy, Clock, Activity, Flame, Play, Pause } from 'lucide-react';
import { LeaderboardEntry, TeamProfile } from '../types';

interface LiveDashboardSectionProps {
  leaderboard: LeaderboardEntry[];
  currentTeam: TeamProfile | null;
  remainingSeconds: number;
  isTimerRunning: boolean;
}

export const LiveDashboardSection: React.FC<LiveDashboardSectionProps> = ({
  leaderboard,
  currentTeam,
  remainingSeconds,
  isTimerRunning,
}) => {
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="space-y-8">
      {/* Top Banner: Master Competition Clock & Read-Only Status */}
      <div className="rounded-2xl border border-[#c59b27]/50 bg-gradient-to-r from-[#091526] via-[#0c1c33] to-[#091526] p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2">
            <Clock className="h-4 w-4 text-[#f3d069]" />
            <span className="text-xs font-cinzel font-bold text-[#f3d069] uppercase tracking-widest">
              ✦ Master Module Countdown Clock ✦
            </span>
          </div>
          <h3 className="font-cinzel text-xl md:text-2xl font-bold text-[#fef9c3]">
            Hogwarts Hourglass & Round Watch
          </h3>
          <p className="text-xs text-slate-300 font-serif">
            Synchronized with the 15-minute character sentinel announcements across the Great Hall.
          </p>
        </div>

        {/* Big Tabular Digits Clock Display & Read-Only Status Badge */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="px-6 py-3.5 rounded-2xl bg-[#060c18] border-2 border-[#c59b27] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex items-center gap-2">
            <span className="font-mono text-3xl md:text-5xl font-bold text-[#fef9c3] tracking-wider tabular-nums drop-shadow-[0_0_15px_rgba(243,208,105,0.4)]">
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          {/* Master Status Indicator (Read-only for participants; controlled exclusively via Overseer Admin Console) */}
          <div className="flex items-center gap-2 bg-[#060c18]/90 px-3.5 py-2 rounded-xl border border-[#c59b27]/40">
            {!isTimerRunning && currentTeam ? (
              <span className="flex items-center gap-2 text-xs font-cinzel text-amber-300 font-semibold">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                <Pause className="h-3.5 w-3.5 text-amber-400" />
                <span>Clock Paused by Overseer</span>
              </span>
            ) : isTimerRunning ? (
              <span className="flex items-center gap-1.5 text-xs font-cinzel text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Round 1 Active</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-cinzel text-[#f3d069]">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>Starts on Round 1</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Overseer Freeze Notice Banner (if timer is paused while team is active) */}
      {!isTimerRunning && currentTeam && (
        <div className="p-3.5 rounded-xl bg-amber-950/70 border border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center gap-3 text-amber-200">
          <Pause className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
          <div className="text-xs font-serif leading-relaxed">
            <strong className="font-cinzel text-amber-300 uppercase tracking-wider block sm:inline mr-2">
              ⚡ Overseer Broadcast:
            </strong>
            The master competition clock has been temporarily paused by the High Overseer. All squad countdowns are frozen where they are.
          </div>
        </div>
      )}

      {/* Live Teams Leaderboard Table */}
      <div className="rounded-2xl border border-[#c59b27]/40 bg-[#0a1526]/90 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#c59b27]/30 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#f3d069]" />
            <h4 className="font-cinzel text-base font-bold text-[#fef9c3]">
              ✦ Squad Leaderboard & Solve Tracking ✦
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Rounds 1 through 6 Active</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#c59b27]/30 text-[#f3d069] font-cinzel">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Team Name</th>
                <th className="py-3 px-3 text-right">Score</th>
                <th className="py-3 px-3 text-center">Solved</th>
                <th className="py-3 px-3">Last Solve</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c59b27]/20">
              {/* Insert current team at top if registered */}
              {currentTeam && (
                <tr className="bg-[#0e213d]/60 font-medium border-l-2 border-[#f3d069]">
                  <td className="py-3 px-3 font-mono text-[#f3d069]">
                    <span className="inline-flex items-center gap-1 font-bold">
                      <Flame className="h-3.5 w-3.5 text-[#f3d069]" />
                      YOU
                    </span>
                  </td>
                  <td className="py-3 px-3 font-cinzel font-bold text-[#fef9c3]">
                    {currentTeam.teamName}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#f3d069] tabular-nums">
                    {currentTeam.score} XP
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-200">
                    {currentTeam.score > 0 ? Math.min(3, Math.floor(currentTeam.score / 100)) : 0} / 3
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    Just now
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[#f3d069] font-medium">
                      {currentTeam.score >= 500 ? 'Advancing to Round 2' : 'In Round 1'}
                    </span>
                  </td>
                </tr>
              )}

              {leaderboard.map((entry) => (
                <tr key={entry.teamName} className="hover:bg-[#0f213a]/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#f3d069]">
                    #{entry.rank}
                  </td>
                  <td className="py-3 px-3 font-cinzel font-bold text-slate-100">
                    {entry.teamName}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-100 tabular-nums">
                    {entry.score} XP
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-300">
                    {entry.solvedCount} / 3
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {entry.lastSolveTime}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-300">
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
