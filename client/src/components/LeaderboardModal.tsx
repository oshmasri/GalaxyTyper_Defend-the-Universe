import React, { useEffect, useState } from 'react';
import type { ScoreEntry } from '../api';
import { fetchLeaderboard } from '../api';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchLeaderboard(15).then((data) => {
      if (isMounted) {
        setScores(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0a0f1e] border border-cyan-500/40 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,240,255,0.2)] font-mono">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 text-xl font-bold transition-colors"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 mb-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-xs tracking-widest uppercase">
            MERN Stack Database
          </div>
          <h2 className="text-2xl md:text-4xl font-black font-heading text-white tracking-widest text-glow-cyan">
            GLOBAL LEADERBOARD
          </h2>
          <p className="text-gray-400 text-xs mt-1 tracking-wider">
            Top combat typists defending the galaxy
          </p>
        </div>

        {/* Scores Table */}
        <div className="overflow-x-auto max-h-80 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-12 text-center text-cyan-400 animate-pulse tracking-widest">
              QUERYING QUANTUM MAINFRAME...
            </div>
          ) : scores.length === 0 ? (
            <div className="py-12 text-center text-gray-500 tracking-wider">
              No flight records found. Be the first to defend the galaxy!
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-cyan-900/60 text-gray-400 uppercase text-[10px] tracking-widest">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Pilot</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Sector</th>
                  <th className="py-2.5 px-3">Speed</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900/60 font-mono">
                {scores.map((s, idx) => {
                  const rank = idx + 1;
                  const isTop3 = rank <= 3;
                  return (
                    <tr
                      key={s._id || idx}
                      className="hover:bg-cyan-950/20 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-heading font-black">
                        {rank === 1 ? (
                          <span className="text-amber-400">#1 👑</span>
                        ) : rank === 2 ? (
                          <span className="text-slate-300">#2 🥈</span>
                        ) : rank === 3 ? (
                          <span className="text-amber-600">#3 🥉</span>
                        ) : (
                          <span className="text-gray-500">#{rank}</span>
                        )}
                      </td>
                      <td className={`py-2.5 px-3 font-semibold ${isTop3 ? 'text-cyan-300' : 'text-gray-200'}`}>
                        {s.username}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white font-heading">
                        {s.score.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-cyan-400">
                        W{s.wave}
                      </td>
                      <td className="py-2.5 px-3 text-amber-300">
                        {s.wpm} <span className="text-[10px] text-gray-500">wpm</span>
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400">
                        {s.accuracy}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-cyan-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-cyan-400 text-white font-heading text-xs tracking-widest uppercase transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
