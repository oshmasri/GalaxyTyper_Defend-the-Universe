import React from 'react';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#0a0f1e] border border-cyan-500/40 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,240,255,0.2)] font-mono text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 text-xl font-bold transition-colors"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-black font-heading text-white tracking-widest text-glow-cyan">
            PILOT FLIGHT MANUAL
          </h2>
          <p className="text-cyan-400 text-xs mt-1 tracking-wider uppercase">
            Galaxy Typer: Defend The Universe
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs md:text-sm text-gray-300">
          <div className="bg-black/40 border border-cyan-900/40 rounded-xl p-3.5">
            <h4 className="text-cyan-300 font-heading font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
              <span>🎯</span> Targeting & Laser Fire
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Type the first letter of any enemy word to lock target. Your ship will rotate and fire laser bolts with each matching keystroke until the craft is destroyed!
            </p>
          </div>

          <div className="bg-black/40 border border-cyan-900/40 rounded-xl p-3.5">
            <h4 className="text-amber-300 font-heading font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
              <span>⚡</span> EMP Smart Bomb
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Typing letters charges your EMP capacitor. When charged, press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-cyan-300">SPACE</kbd> or <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-cyan-300">ENTER</kbd> to detonate a screen-clearing shockwave!
            </p>
          </div>

          <div className="bg-black/40 border border-cyan-900/40 rounded-xl p-3.5">
            <h4 className="text-emerald-300 font-heading font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
              <span>🔥</span> Combo Streaks & Shields
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Every 10 consecutive hit keystrokes boosts your multiplier up to 5x. If an enemy breaches your baseline, 1 shield is compromised. Clear sectors to repair shields.
            </p>
          </div>

          <div className="pt-2 text-center text-gray-500 text-[11px] border-t border-gray-800">
            Powered by MERN Stack (MongoDB • Express • React 19 • Node.js)
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black font-heading text-xs tracking-widest uppercase transition-all duration-150 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
