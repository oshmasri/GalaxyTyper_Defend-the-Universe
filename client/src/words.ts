// Local word list for instant offline play and fallback
export const LOCAL_WORDS = {
  easy: [
    'star', 'ship', 'warp', 'core', 'beam', 'dark', 'moon', 'nova', 'sun', 'flux',
    'void', 'mars', 'glow', 'apex', 'dust', 'bolt', 'helm', 'orbit', 'fuel', 'dock',
    'wave', 'grid', 'laser', 'fire', 'sky', 'comet', 'alien', 'radar', 'gate', 'node',
    'byte', 'sync', 'scan', 'code', 'data', 'link', 'zero', 'unit', 'mass', 'time'
  ],
  normal: [
    'galaxy', 'nebula', 'cosmos', 'planet', 'quasar', 'pulsar', 'sensor', 'shield',
    'rocket', 'plasma', 'vector', 'meteor', 'engine', 'cyborg', 'photon', 'vortex',
    'zenith', 'stellar', 'matrix', 'beacon', 'hyperspace', 'quantum', 'gravity', 'station',
    'capsule', 'thruster', 'booster', 'cruiser', 'tactical', 'shuttle', 'command', 'terminal',
    'velocity', 'horizon', 'payload', 'circuit', 'asteroid', 'module', 'propel', 'stellar'
  ],
  hard: [
    'supernova', 'constellation', 'interstellar', 'astrophysics', 'atmosphere',
    'singularity', 'gravitational', 'teleportation', 'nanotechnology', 'extraterrestrial',
    'exoplanetary', 'electromagnetic', 'stratosphere', 'biodiversity', 'cosmological',
    'antimatter', 'cybernetics', 'dimensional', 'crystallize', 'synchronize',
    'astronomical', 'superconductor', 'spatiotemporal', 'transcendence', 'thermonuclear'
  ]
};

export function getWordForWave(wave: number, difficulty: 'easy' | 'normal' | 'hard' = 'normal'): string {
  let pool: string[] = [];
  if (difficulty === 'easy') {
    pool = wave <= 3 ? LOCAL_WORDS.easy : [...LOCAL_WORDS.easy, ...LOCAL_WORDS.normal.slice(0, 15)];
  } else if (difficulty === 'hard') {
    pool = wave <= 2 ? LOCAL_WORDS.normal : [...LOCAL_WORDS.normal, ...LOCAL_WORDS.hard];
  } else {
    // Normal difficulty
    if (wave <= 2) {
      pool = LOCAL_WORDS.easy;
    } else if (wave <= 5) {
      pool = [...LOCAL_WORDS.easy, ...LOCAL_WORDS.normal];
    } else {
      pool = [...LOCAL_WORDS.normal, ...LOCAL_WORDS.hard];
    }
  }

  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx].toLowerCase();
}
