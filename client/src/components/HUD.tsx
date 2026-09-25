import React from 'react';
import type { GameStats } from '../game/types';

interface HUDProps {
  stats: GameStats;
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onToggleSound: () => void;
  onTriggerEmp: () => void;
  onQuit: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  isPaused,
  isMuted,
  onTogglePause,
  onToggleSound,
  onTriggerEmp,
  onQuit,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 select-none z-10">
      {/* Top Header Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pointer-events-auto bg-[#0a0f1d]/85 backdrop-blur-md border border-cyan-500/30 rounded-xl px-5 py-3 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
        {/* Left: Score & Multiplier */}
        <div className="flex items-center gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-cyan-400 font-mono">Score</div>
            <div className="text-2xl md:text-3xl font-black font-heading text-white tracking-wider text-glow-cyan">
              {stats.score.toLocaleString()}
            </div>
          </div>

          {/* Multiplier Badge */}
          <div className="flex flex-col items-center">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">Combo</div>
            <div className={`px-2.5 py-0.5 rounded text-xs font-black font-heading tracking-wider border ${
              stats.multiplier >= 4
                ? 'bg-red-500/20 text-red-400 border-red-500 animate-pulse text-glow-magenta'
                : stats.multiplier >= 2
                ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40'
            }`}>
              x{stats.multiplier} ({stats.streak})
            </div>
          </div>
        </div>

        {/* Center: Wave & Defense Shields */}
        <div className="flex items-center gap-8">
          {/* Wave Badge */}
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-cyan-400 font-mono">Sector</div>
            <div className="text-lg md:text-xl font-black font-heading text-cyan-300 tracking-widest">
              WAVE {stats.wave}
            </div>
          </div>

          {/* Shields Display */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-mono text-center mb-1">
              Hull Shields
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: stats.maxShields }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-6 h-3 rounded-sm border transition-all duration-300 ${
                    idx < stats.shields
                      ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_#00f0ff]'
                      : 'bg-red-950/40 border-red-800/40 opacity-40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: WPM, Accuracy & EMP Button */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">Pace</div>
            <div className="text-xl font-bold font-mono text-cyan-300">
              {stats.wpm} <span className="text-xs text-gray-400">WPM</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">Precision</div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {stats.accuracy}%
            </div>
          </div>

          {/* EMP Smart Bomb Button */}
          <button
            onClick={onTriggerEmp}
            disabled={stats.empCharge < 50}
            className={`relative group px-4 py-2 rounded-lg font-heading text-xs tracking-widest uppercase transition-all duration-200 border ${
              stats.empCharge >= 50
                ? 'bg-cyan-500/20 hover:bg-cyan-500/40 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer'
                : 'bg-gray-900/60 border-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span>⚡ EMP</span>
              <span>({stats.empCharge}%)</span>
            </div>
            {/* EMP Charge fill bar */}
            <div
              className="absolute bottom-0 left-0 h-1 bg-cyan-400 rounded-b-lg transition-all duration-200"
              style={{ width: `${stats.empCharge}%` }}
            />
          </button>
        </div>
      </div>

      {/* Bottom Controls & Legend Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs font-mono text-gray-400 bg-[#0a0f1d]/75 backdrop-blur-md border border-cyan-500/20 rounded-xl px-4 py-2 pointer-events-auto">
        {/* Keyboard Instructions */}
        <div className="hidden sm:flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-cyan-300 text-[10px]">A-Z</kbd> Type Word
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-cyan-300 text-[10px]">SPACE</kbd> EMP Bomb
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-cyan-300 text-[10px]">ESC</kbd> Pause
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={onToggleSound}
            className="hover:text-cyan-400 transition-colors uppercase px-2 py-1 rounded bg-gray-800/40 border border-gray-700"
          >
            {isMuted ? '🔇 Audio Off' : '🔊 Audio On'}
          </button>

          <button
            onClick={onTogglePause}
            className="hover:text-cyan-400 transition-colors uppercase px-2 py-1 rounded bg-gray-800/40 border border-gray-700"
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>

          <button
            onClick={onQuit}
            className="hover:text-red-400 transition-colors uppercase px-2 py-1 rounded bg-gray-800/40 border border-gray-700"
          >
            Quit Mission
          </button>
        </div>
      </div>
    </div>
  );
};
