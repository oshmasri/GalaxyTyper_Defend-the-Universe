export type Difficulty = 'easy' | 'normal' | 'hard';

export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface Enemy {
  id: string;
  x: number;
  y: number;
  speed: number;
  word: string;
  typedIndex: number;
  type: 'scout' | 'fighter' | 'dreadnought' | 'mine';
  size: number;
  color: string;
  maxHp: number;
  hp: number;
}

export interface Laser {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number; // 0 to 1
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
}

export interface GameStats {
  score: number;
  wave: number;
  wpm: number;
  accuracy: number;
  streak: number;
  multiplier: number;
  shields: number;
  maxShields: number;
  empCharge: number; // 0 to 100
  empAvailable: boolean;
  enemiesKilled: number;
  totalLettersTyped: number;
  correctLettersTyped: number;
}
