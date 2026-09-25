import { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './game/GameCanvas';
import { HUD } from './components/HUD';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { CreditsModal } from './components/CreditsModal';
import type { Difficulty, GameState, GameStats } from './game/types';
import { sound } from './sound';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showCredits, setShowCredits] = useState<boolean>(false);
  const [waveBanner, setWaveBanner] = useState<number | null>(null);
  const [empSignal, setEmpSignal] = useState<number>(0);
  const [gameSession, setGameSession] = useState<number>(0);

  const initialStats: GameStats = {
    score: 0,
    wave: 1,
    wpm: 0,
    accuracy: 0,
    streak: 0,
    multiplier: 1,
    shields: 3,
    maxShields: 3,
    empCharge: 20,
    empAvailable: false,
    enemiesKilled: 0,
    totalLettersTyped: 0,
    correctLettersTyped: 0,
  };

  const [stats, setStats] = useState<GameStats>(initialStats);

  // Toggle Sound
  const handleToggleSound = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  }, [isMuted]);

  // Start Game (Fresh Session)
  const handleStartGame = useCallback(() => {
    setStats(initialStats);
    setGameSession((prev) => prev + 1);
    setGameState('PLAYING');
    sound.startMusic();
  }, [initialStats]);

  // Wave Banner Alert
  const handleWaveBanner = useCallback((wave: number) => {
    setWaveBanner(wave);
    const timer = setTimeout(() => {
      setWaveBanner(null);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // Handle Game Over
  const handleGameOver = useCallback((finalStats: GameStats) => {
    setStats(finalStats);
    setGameState('GAMEOVER');
    sound.stopMusic();
  }, []);

  // Keyboard navigation for Start & Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'START') {
        if (showLeaderboard || showCredits) return;
        // Pressing any letter or Enter starts game!
        if ((e.key.length === 1 && e.key.match(/[a-z]/i)) || e.key === 'Enter') {
          handleStartGame();
        }
      } else if (gameState === 'PLAYING') {
        if (e.key === 'Escape') {
          setGameState('PAUSED');
        }
      } else if (gameState === 'PAUSED') {
        if (e.key === 'Escape' || e.key === 'Enter') {
          setGameState('PLAYING');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, showLeaderboard, showCredits, handleStartGame]);

  return (
    <div className="relative w-full h-screen bg-[#050510] overflow-hidden select-none font-mono">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 opacity-25 pointer-events-none cyber-grid" />

      {/* CRT Scanline overlay effect */}
      <div className="absolute inset-0 scanlines z-20 pointer-events-none" />

      {/* Radial vignette */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_transparent_40%,_#050510_100%)] pointer-events-none z-10" />

      {/* 1. START MENU SCREEN */}
      {gameState === 'START' && (
        <div className="relative z-30 flex flex-col items-center justify-center w-full h-full px-4 text-center">
          {/* Cyber Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Tactical Space Typist Terminal
          </div>

          {/* Title */}
          <h1 className="text-6xl sm:text-7xl md:text-9xl font-black font-heading text-white tracking-[0.18em] mb-2 text-glow-cyan">
            GALAXY TYPER
          </h1>

          <p className="text-cyan-300 text-base sm:text-lg md:text-2xl font-bold tracking-[0.3em] uppercase mb-8 font-mono text-glow-cyan">
            DEFEND THE UNIVERSE
          </p>

          {/* Difficulty Selector */}
          <div className="flex items-center gap-3 mb-10 bg-black/60 border border-cyan-500/30 rounded-xl p-1.5 backdrop-blur-md">
            <span className="text-[10px] uppercase text-gray-500 tracking-wider px-2 font-mono">Difficulty:</span>
            {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-4 py-1.5 rounded-lg text-xs font-heading uppercase tracking-wider transition-all duration-200 ${
                  difficulty === diff
                    ? 'bg-cyan-500 text-black font-black shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleStartGame}
            className="group relative px-10 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black font-heading text-lg md:text-xl tracking-[0.25em] uppercase transition-all duration-200 shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_50px_rgba(0,240,255,0.7)] transform hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-3">
              <span>LAUNCH FIGHTER</span>
              <span className="text-xs tracking-normal font-mono opacity-80">(OR PRESS ANY KEY)</span>
            </span>
          </button>

          {/* Footer Controls & Modals Trigger */}
          <div className="absolute bottom-8 w-full max-w-4xl px-8 flex flex-wrap justify-center sm:justify-between items-center gap-6 text-gray-400 text-xs tracking-[0.2em] font-mono">
            <button
              onClick={handleToggleSound}
              className="hover:text-cyan-400 transition-colors uppercase px-3 py-1 rounded bg-black/30 border border-gray-800"
            >
              {isMuted ? '🔇 Sound Off' : '🔊 Sound On'}
            </button>

            <button
              onClick={() => setShowLeaderboard(true)}
              className="hover:text-cyan-400 transition-colors uppercase px-3 py-1 rounded bg-black/30 border border-gray-800 flex items-center gap-2"
            >
              <span>🏆 Leaderboard</span>
            </button>

            <button
              onClick={() => setShowCredits(true)}
              className="hover:text-cyan-400 transition-colors uppercase px-3 py-1 rounded bg-black/30 border border-gray-800"
            >
              📖 Flight Manual
            </button>
          </div>
        </div>
      )}

      {/* 2. ACTIVE GAMEPLAY CANVAS */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'GAMEOVER') && (
        <>
          <GameCanvas
            key={gameSession}
            difficulty={difficulty}
            isPaused={gameState !== 'PLAYING'}
            onStatsUpdate={setStats}
            onGameOver={handleGameOver}
            onWaveBanner={handleWaveBanner}
            triggerEmpSignal={empSignal}
          />

          <HUD
            stats={stats}
            isPaused={gameState === 'PAUSED'}
            isMuted={isMuted}
            onTogglePause={() => setGameState(gameState === 'PAUSED' ? 'PLAYING' : 'PAUSED')}
            onToggleSound={handleToggleSound}
            onTriggerEmp={() => setEmpSignal((prev) => prev + 1)}
            onQuit={() => {
              sound.stopMusic();
              setGameState('START');
            }}
          />

          {/* Wave Transition Banner Alert */}
          {waveBanner !== null && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <div className="text-center animate-bounce">
                <div className="text-xs uppercase tracking-[0.4em] text-cyan-400 font-mono mb-1">
                  — SECTOR CLEARED —
                </div>
                <h2 className="text-5xl md:text-7xl font-black font-heading text-white tracking-[0.2em] text-glow-cyan">
                  SECTOR {waveBanner}
                </h2>
                <div className="text-sm uppercase tracking-[0.3em] text-red-400 font-mono mt-1">
                  HOSTILE SQUADRONS DETECTED
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 3. PAUSE MENU OVERLAY */}
      {gameState === 'PAUSED' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-md">
          <div className="bg-[#0a0f1e] border border-cyan-500/40 rounded-2xl p-8 max-w-sm w-full text-center shadow-[0_0_40px_rgba(0,240,255,0.25)] font-mono">
            <h3 className="text-3xl font-black font-heading text-white tracking-widest mb-6 text-glow-cyan">
              PAUSED
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => setGameState('PLAYING')}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black font-heading text-xs tracking-widest uppercase transition-all duration-150"
              >
                Resume Flight
              </button>

              <button
                onClick={() => {
                  setStats(initialStats);
                  setGameSession((prev) => prev + 1);
                  setGameState('PLAYING');
                }}
                className="w-full py-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-heading text-xs tracking-widest uppercase transition-all duration-150"
              >
                Restart Sector
              </button>

              <button
                onClick={() => {
                  sound.stopMusic();
                  setGameState('START');
                }}
                className="w-full py-3 rounded-xl bg-gray-900/60 hover:bg-gray-800 border border-gray-800 text-red-400 font-heading text-xs tracking-widest uppercase transition-all duration-150"
              >
                Abort Mission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. GAME OVER MODAL */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={stats}
          difficulty={difficulty}
          onRestart={handleStartGame}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onHome={() => setGameState('START')}
        />
      )}

      {/* 5. LEADERBOARD MODAL */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {/* 6. CREDITS & HOW TO PLAY MODAL */}
      {showCredits && (
        <CreditsModal onClose={() => setShowCredits(false)} />
      )}
    </div>
  );
}