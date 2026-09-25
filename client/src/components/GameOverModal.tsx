import React, { useState } from 'react';
import type { GameStats, Difficulty } from '../game/types';
import { submitScore } from '../api';

interface GameOverModalProps {
  stats: GameStats;
  difficulty: Difficulty;
  onRestart: () => void;
  onOpenLeaderboard: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  difficulty,
  onRestart,
  onOpenLeaderboard,
  onHome,
}) => {
  const [pilotName, setPilotName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ submitted: boolean; rank?: number } | null>(null);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pilotName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const result = await submitScore({
      username: pilotName.trim(),
      score: stats.score,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      wave: stats.wave,
      difficulty,
    });

    setIsSubmitting(false);
    setSubmitResult({ submitted: true, rank: result.rank });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0a0f1e] border border-cyan-500/40 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,240,255,0.25)] text-center font-mono">
        {/* Glow header badge */}
        <div className="inline-block px-3 py-1 mb-2 rounded-full border border-red-500/40 bg-red-500/10 text-red-400 text-xs tracking-widest uppercase">
          Defense Compromised
        </div>

        <h2 className="text-3xl md:text-5xl font-black font-heading text-white tracking-widest mb-1 text-glow-magenta">
          GAME OVER
        </h2>
        <p className="text-gray-400 text-sm mb-6 tracking-wide">
          Your fighter ship was neutralized defending Sector {stats.wave}.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-black/40 border border-cyan-900/50 rounded-xl p-4">
          <div className="text-left border-r border-gray-800 pr-2">
            <span className="text-[10px] uppercase text-gray-500 tracking-wider block">Final Score</span>
            <span className="text-2xl font-black font-heading text-cyan-300 text-glow-cyan">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="text-left pl-2">
            <span className="text-[10px] uppercase text-gray-500 tracking-wider block">Sector Reached</span>
            <span className="text-2xl font-black font-heading text-white">
              Wave {stats.wave}
            </span>
          </div>

          <div className="text-left border-r border-gray-800 pr-2 pt-2">
            <span className="text-[10px] uppercase text-gray-500 tracking-wider block">Typing Speed</span>
            <span className="text-xl font-bold text-amber-300">
              {stats.wpm} <span className="text-xs text-gray-500">WPM</span>
            </span>
          </div>

          <div className="text-left pl-2 pt-2">
            <span className="text-[10px] uppercase text-gray-500 tracking-wider block">Accuracy</span>
            <span className="text-xl font-bold text-emerald-400">
              {stats.accuracy}%
            </span>
          </div>
        </div>

        {/* Leaderboard Submission Form */}
        {!submitResult?.submitted ? (
          <form onSubmit={handleSubmitScore} className="mb-6">
            <label className="block text-xs uppercase tracking-widest text-cyan-400 mb-2">
              Record Pilot Call-sign to Database
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={18}
                value={pilotName}
                onChange={(e) => setPilotName(e.target.value)}
                placeholder="Enter Pilot Name (e.g. Maverick)"
                className="flex-1 bg-black/60 border border-cyan-500/40 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 text-sm tracking-wide font-mono"
                autoFocus
              />
              <button
                type="submit"
                disabled={!pilotName.trim() || isSubmitting}
                className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-black font-heading text-xs tracking-widest uppercase transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              >
                {isSubmitting ? 'Saving...' : 'Submit'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6 py-2 px-4 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs tracking-wider">
            ✓ Flight record registered! {submitResult.rank ? `Position: #${submitResult.rank} Globally` : ''}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black font-heading text-sm tracking-widest uppercase transition-all duration-200 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            Play Again
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="py-3 px-5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-cyan-400 text-white font-heading text-xs tracking-widest uppercase transition-all duration-200"
          >
            Leaderboard
          </button>

          <button
            onClick={onHome}
            className="py-3 px-4 rounded-xl bg-gray-900/60 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white font-heading text-xs tracking-widest uppercase transition-all duration-200"
          >
            Menu
          </button>
        </div>
      </div>
    </div>
  );
};
