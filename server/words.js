// Curated dictionary of words for Galaxy Typer waves
export const WORD_BANK = {
  short: [
    'sun', 'sky', 'star', 'moon', 'nova', 'mars', 'orbit', 'beam', 'laser', 'core',
    'void', 'warp', 'ray', 'glow', 'flux', 'ion', 'ship', 'fuel', 'dock', 'gate',
    'dust', 'bolt', 'dark', 'light', 'pulse', 'helm', 'comet', 'alien', 'radar', 'apex'
  ],
  medium: [
    'galaxy', 'nebula', 'cosmos', 'planet', 'quasar', 'pulsar', 'sensor', 'shield',
    'rocket', 'plasma', 'vector', 'meteor', 'engine', 'cyborg', 'photon', 'vortex',
    'zenith', 'stellar', 'matrix', 'beacon', 'hyperspace', 'quantum', 'gravity', 'station',
    'capsule', 'thruster', 'booster', 'cruiser', 'tactical', 'shuttle'
  ],
  long: [
    'supernova', 'constellation', 'interstellar', 'astrophysics', 'atmosphere',
    'singularity', 'gravitational', 'teleportation', 'nanotechnology', 'extraterrestrial',
    'exoplanetary', 'electromagnetic', 'stratosphere', 'biodiversity', 'cosmological',
    'antimatter', 'cybernetics', 'dimensional', 'crystallize', 'synchronize'
  ]
};

export function getRandomWord(difficulty = 'normal', wave = 1) {
  let pool = [];
  if (wave <= 2) {
    pool = [...WORD_BANK.short];
    if (difficulty === 'hard') pool.push(...WORD_BANK.medium);
  } else if (wave <= 5) {
    pool = [...WORD_BANK.short, ...WORD_BANK.medium];
  } else {
    pool = [...WORD_BANK.medium, ...WORD_BANK.long];
    if (wave > 8) pool.push(...WORD_BANK.long);
  }
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}
