// src/App.tsx
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
        console.log('Game started with key:', e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#050510] overflow-hidden flex flex-col items-center justify-center font-mono select-none">
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(600px) rotateX(60deg) translateY(-50px) translateZ(-200px)',
        }}
      />

      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#050510]/80 to-[#050510] pointer-events-none" />

      <div className="z-10 flex flex-col items-center text-center -mt-20">
        <h1 className="text-8xl md:text-[120px] font-black text-white tracking-[0.15em] mb-4 text-glow">
          GALAXY TYPER
        </h1>
        
        <p className="text-gray-400 text-lg md:text-1xl tracking-[0.1em] uppercase georgia mb-24" style={{ fontFamily: "'Courier New', monospace" }}>
          Defend the Universe !!!
        </p>

        <div className="text-cyan-400 text-xl md:text-3xl tracking-[0.3em] animate-pulse">
          TYPE TO START
        </div>
      </div>

      <div className="absolute bottom-12 w-full max-w-4xl px-8 flex justify-between text-gray-500 text-sm md:text-base tracking-[0.2em] z-10">
        <button className="hover:text-cyan-400 transition-colors uppercase">Sound On</button>
        <button className="hover:text-cyan-400 transition-colors uppercase">Leaderboard</button>
        <button className="hover:text-cyan-400 transition-colors uppercase">Credits</button>
      </div>
    </div>
  );
}