import React, { useEffect, useRef } from 'react';
import type { Enemy, Laser, Particle, FloatingText, Star, GameStats, Difficulty } from './types';
import { sound } from '../sound';
import { getWordForWave } from '../words';

interface GameCanvasProps {
  difficulty: Difficulty;
  isPaused: boolean;
  onStatsUpdate: (stats: GameStats) => void;
  onGameOver: (finalStats: GameStats) => void;
  onWaveBanner: (wave: number) => void;
  triggerEmpSignal?: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  difficulty,
  isPaused,
  onStatsUpdate,
  onGameOver,
  onWaveBanner,
  triggerEmpSignal = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game internal mutable state ref to keep 60fps loop silky smooth without React re-render overhead
  const stateRef = useRef({
    score: 0,
    wave: 1,
    streak: 0,
    multiplier: 1,
    shields: 3,
    maxShields: 3,
    empCharge: 20, // starts with a bit of charge
    totalLettersTyped: 0,
    correctLettersTyped: 0,
    enemiesKilled: 0,
    startTime: Date.now(),

    // Game objects
    player: {
      x: 0,
      y: 0,
      angle: -Math.PI / 2, // pointing up
      targetAngle: -Math.PI / 2,
    },
    targetEnemyId: null as string | null,
    enemies: [] as Enemy[],
    lasers: [] as Laser[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    stars: [] as Star[],
    empWave: null as { radius: number; maxRadius: number; alpha: number } | null,

    // Spawning state
    enemiesToSpawnInWave: 6,
    enemiesSpawnedInWave: 0,
    spawnTimer: 0,
    spawnInterval: 120, // frames
    waveTransition: false,
    waveTransitionTimer: 0,

    // Screen effects
    screenShake: 0,
    damageVignette: 0,
    isOver: false,
  });

  const lastEmpSignalRef = useRef(triggerEmpSignal);

  // Trigger EMP function
  const triggerEmp = () => {
    const s = stateRef.current;
    if (s.empCharge < 100 && s.score < 200) {
      // allow at least 1 free EMP early on if charged
      if (s.empCharge < 50) return;
    }
    s.empCharge = 0;
    sound.playEmp();
    s.screenShake = 15;

    // Create EMP shockwave
    s.empWave = {
      radius: 10,
      maxRadius: Math.max(window.innerWidth, window.innerHeight),
      alpha: 1,
    };

    // Destroy all mines and deal damage to all enemies
    s.enemies.forEach(enemy => {
      // Create explosion at enemy position
      createExplosion(enemy.x, enemy.y, enemy.color, 15);
      s.score += enemy.word.length * 30;
      s.enemiesKilled++;
    });

    s.enemies = [];
    s.targetEnemyId = null;

    s.floatingTexts.push({
      id: Math.random().toString(),
      x: s.player.x,
      y: s.player.y - 120,
      text: '⚡ EMP DETONATION! SCREEN CLEARED',
      color: '#00f0ff',
      alpha: 1,
      vy: -1.2,
    });
  };

  // Watch external EMP button triggers
  useEffect(() => {
    if (triggerEmpSignal > 0 && triggerEmpSignal !== lastEmpSignalRef.current) {
      lastEmpSignalRef.current = triggerEmpSignal;
      triggerEmp();
    }
  }, [triggerEmpSignal]);

  const createExplosion = (x: number, y: number, color: string, count = 25) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 30 + 20,
        size: Math.random() * 3.5 + 1.5,
      });
    }
  };

  // Setup Canvas and Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stateRef.current.player.x = canvas.width / 2;
      stateRef.current.player.y = canvas.height - 90;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize stars
    const stars: Star[] = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.3,
        brightness: Math.random() * 0.7 + 0.3,
      });
    }
    stateRef.current.stars = stars;
    onWaveBanner(1);

    // Spawn an enemy
    const spawnEnemy = () => {
      const s = stateRef.current;
      const wave = s.wave;
      const word = getWordForWave(wave, difficulty);

      let type: Enemy['type'] = 'scout';
      let speed = 0.55 + wave * 0.08;
      let color = '#ffd700'; // scout amber
      let size = 26;

      if (word.length >= 8) {
        type = 'dreadnought';
        speed = 0.28 + wave * 0.04;
        color = '#ff007f'; // boss magenta
        size = 44;
      } else if (word.length >= 5) {
        type = 'fighter';
        speed = 0.42 + wave * 0.06;
        color = '#00f0ff'; // fighter cyan
        size = 32;
      }

      // Slightly faster on hard difficulty
      if (difficulty === 'hard') speed *= 1.35;
      if (difficulty === 'easy') speed *= 0.8;

      const margin = 80;
      const x = Math.random() * (canvas.width - margin * 2) + margin;
      const y = -40;

      s.enemies.push({
        id: Math.random().toString(),
        x,
        y,
        speed,
        word,
        typedIndex: 0,
        type,
        size,
        color,
        maxHp: word.length,
        hp: word.length,
      });

      s.enemiesSpawnedInWave++;
    };

    // Main Game Render & Update Loop
    const loop = () => {
      if (!isPaused && !stateRef.current.isOver) {
        const s = stateRef.current;

        // 1. Update Spawning and Wave Progression
        if (s.waveTransition) {
          s.waveTransitionTimer++;
          if (s.waveTransitionTimer > 120) {
            s.waveTransition = false;
            s.waveTransitionTimer = 0;
            s.wave++;
            s.enemiesToSpawnInWave = 5 + s.wave * 2;
            s.enemiesSpawnedInWave = 0;
            s.spawnInterval = Math.max(60, 130 - s.wave * 6);
            onWaveBanner(s.wave);
            sound.playWaveComplete();
          }
        } else {
          if (s.enemiesSpawnedInWave < s.enemiesToSpawnInWave) {
            s.spawnTimer++;
            if (s.spawnTimer >= s.spawnInterval) {
              s.spawnTimer = 0;
              spawnEnemy();
            }
          } else if (s.enemies.length === 0) {
            // Wave cleared!
            s.waveTransition = true;
            s.waveTransitionTimer = 0;
            s.score += 500 * s.wave;
            if (s.shields < s.maxShields) s.shields++; // repair 1 shield

            s.floatingTexts.push({
              id: Math.random().toString(),
              x: canvas.width / 2,
              y: canvas.height / 2 - 50,
              text: `✨ WAVE ${s.wave} CLEARED! +${500 * s.wave} PTS`,
              color: '#00ff88',
              alpha: 1,
              vy: -0.8,
            });
          }
        }

        // 2. Update Stars
        s.stars.forEach(star => {
          star.y += star.speed;
          if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
          }
        });

        // 3. Update Player Rotation towards locked target
        const currentTarget = s.enemies.find(e => e.id === s.targetEnemyId);
        if (currentTarget) {
          const dx = currentTarget.x - s.player.x;
          const dy = currentTarget.y - s.player.y;
          s.player.targetAngle = Math.atan2(dy, dx);
        } else {
          s.player.targetAngle = -Math.PI / 2; // point upright
        }
        // Smooth interpolation
        let angleDiff = s.player.targetAngle - s.player.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        s.player.angle += angleDiff * 0.18;

        // 4. Update Enemies
        const baseline = canvas.height - 110;
        for (let i = s.enemies.length - 1; i >= 0; i--) {
          const enemy = s.enemies[i];
          enemy.y += enemy.speed;

          // Check if enemy reaches player baseline
          if (enemy.y >= baseline) {
            // Damage player!
            s.shields--;
            s.screenShake = 16;
            s.damageVignette = 1;
            sound.playExplosion(false);
            createExplosion(enemy.x, enemy.y, '#ff3344', 30);

            s.floatingTexts.push({
              id: Math.random().toString(),
              x: enemy.x,
              y: baseline - 20,
              text: '💥 HULL BREACH! -1 SHIELD',
              color: '#ff3344',
              alpha: 1,
              vy: -1,
            });

            // If target was this enemy, clear target
            if (s.targetEnemyId === enemy.id) {
              s.targetEnemyId = null;
            }
            s.enemies.splice(i, 1);

            // Check Game Over
            if (s.shields <= 0) {
              s.isOver = true;
              s.screenShake = 0;
              s.damageVignette = 0;
              createExplosion(s.player.x, s.player.y, '#00f0ff', 40);
              createExplosion(s.player.x, s.player.y, '#ff3344', 40);
              sound.playGameOver();
              const elapsedMinutes = (Date.now() - s.startTime) / 60000;
              const wpm = Math.round((s.correctLettersTyped / 5) / (elapsedMinutes || 0.1));
              const accuracy = s.totalLettersTyped > 0
                ? Math.round((s.correctLettersTyped / s.totalLettersTyped) * 100)
                : 0;
              onGameOver({
                score: s.score,
                wave: s.wave,
                wpm,
                accuracy,
                streak: s.streak,
                multiplier: s.multiplier,
                shields: 0,
                maxShields: s.maxShields,
                empCharge: s.empCharge,
                empAvailable: s.empCharge >= 100,
                enemiesKilled: s.enemiesKilled,
                totalLettersTyped: s.totalLettersTyped,
                correctLettersTyped: s.correctLettersTyped,
              });
              break;
            }
          }
        }

        // 5. Update Lasers
        for (let i = s.lasers.length - 1; i >= 0; i--) {
          const laser = s.lasers[i];
          laser.progress += 0.22;
          if (laser.progress >= 1) {
            s.lasers.splice(i, 1);
          }
        }

        // 6. Update Particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.life++;
          p.alpha = 1 - p.life / p.maxLife;
          if (p.life >= p.maxLife) {
            s.particles.splice(i, 1);
          }
        }

        // 7. Update Floating Text
        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y += ft.vy;
          ft.alpha -= 0.015;
          if (ft.alpha <= 0) {
            s.floatingTexts.splice(i, 1);
          }
        }

        // 8. Update EMP Wave
        if (s.empWave) {
          s.empWave.radius += 24;
          s.empWave.alpha = 1 - s.empWave.radius / s.empWave.maxRadius;
          if (s.empWave.radius >= s.empWave.maxRadius) {
            s.empWave = null;
          }
        }

        // 10. Update Multiplier based on streak
        s.multiplier = Math.min(5, Math.floor(s.streak / 10) + 1);

        // 11. Dispatch stats to parent periodically (every 10 frames)
        if (animId % 8 === 0) {
          const elapsedMinutes = (Date.now() - s.startTime) / 60000;
          const wpm = Math.round((s.correctLettersTyped / 5) / (elapsedMinutes || 0.1));
          const accuracy = s.totalLettersTyped > 0
            ? Math.round((s.correctLettersTyped / s.totalLettersTyped) * 100)
            : 0;

          onStatsUpdate({
            score: s.score,
            wave: s.wave,
            wpm,
            accuracy,
            streak: s.streak,
            multiplier: s.multiplier,
            shields: s.shields,
            maxShields: s.maxShields,
            empCharge: Math.min(100, Math.floor(s.empCharge)),
            empAvailable: s.empCharge >= 100,
            enemiesKilled: s.enemiesKilled,
            totalLettersTyped: s.totalLettersTyped,
            correctLettersTyped: s.correctLettersTyped,
          });
        }
      }

      // Always update and damp screen shake & damage vignette
      const s = stateRef.current;
      if (s.isOver || isPaused) {
        s.screenShake = 0;
        s.damageVignette = 0;
      } else {
        if (s.screenShake > 0) {
          s.screenShake *= 0.85;
          if (s.screenShake < 0.2) s.screenShake = 0;
        }
        if (s.damageVignette > 0) {
          s.damageVignette -= 0.03;
          if (s.damageVignette < 0) s.damageVignette = 0;
        }
      }

      // RENDER SECTION
      ctx.save();

      // Screen Shake translation (only if actively playing)
      if (!s.isOver && !isPaused && s.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * s.screenShake * 2;
        const shakeY = (Math.random() - 0.5) * s.screenShake * 2;
        ctx.translate(shakeX, shakeY);
      }

      // Clear Screen with deep cosmic dark blue
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Parallax Stars
      s.stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Defense Baseline Glow
      const baselineY = canvas.height - 110;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, baselineY);
      ctx.lineTo(canvas.width, baselineY);
      ctx.stroke();

      // Render Lasers
      s.lasers.forEach(laser => {
        const currentX = laser.startX + (laser.targetX - laser.startX) * laser.progress;
        const currentY = laser.startY + (laser.targetY - laser.startY) * laser.progress;
        const prevX = laser.startX + (laser.targetX - laser.startX) * Math.max(0, laser.progress - 0.2);
        const prevY = laser.startY + (laser.targetY - laser.startY) * Math.max(0, laser.progress - 0.2);

        ctx.save();
        ctx.shadowBlur = 16;
        ctx.shadowColor = laser.color;
        ctx.strokeStyle = laser.color;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        // Bright core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });

      // Render EMP Shockwave
      if (s.empWave) {
        ctx.save();
        ctx.strokeStyle = `rgba(0, 240, 255, ${s.empWave.alpha})`;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00f0ff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(s.player.x, s.player.y, s.empWave.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Render Enemies
      s.enemies.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);

        const isTarget = enemy.id === s.targetEnemyId;

        // Render Enemy Ship Vector Sprite
        ctx.shadowBlur = isTarget ? 20 : 10;
        ctx.shadowColor = enemy.color;
        ctx.strokeStyle = enemy.color;
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(10, 15, 30, 0.7)';

        ctx.beginPath();
        if (enemy.type === 'scout') {
          // Sharp scout triangle
          ctx.moveTo(0, enemy.size * 0.7);
          ctx.lineTo(-enemy.size * 0.5, -enemy.size * 0.6);
          ctx.lineTo(0, -enemy.size * 0.3);
          ctx.lineTo(enemy.size * 0.5, -enemy.size * 0.6);
          ctx.closePath();
        } else if (enemy.type === 'dreadnought') {
          // Heavy Hexagonal Warship
          ctx.moveTo(0, enemy.size * 0.8);
          ctx.lineTo(-enemy.size * 0.7, enemy.size * 0.2);
          ctx.lineTo(-enemy.size * 0.6, -enemy.size * 0.7);
          ctx.lineTo(enemy.size * 0.6, -enemy.size * 0.7);
          ctx.lineTo(enemy.size * 0.7, enemy.size * 0.2);
          ctx.closePath();
        } else {
          // Fighter chevron
          ctx.moveTo(0, enemy.size * 0.75);
          ctx.lineTo(-enemy.size * 0.6, -enemy.size * 0.4);
          ctx.lineTo(-enemy.size * 0.2, -enemy.size * 0.7);
          ctx.lineTo(enemy.size * 0.2, -enemy.size * 0.7);
          ctx.lineTo(enemy.size * 0.6, -enemy.size * 0.4);
          ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();

        // Pulsing core light
        ctx.fillStyle = isTarget ? '#ffffff' : enemy.color;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Target Reticle & Brackets
        if (isTarget) {
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 2;
          const reticleSize = enemy.size + 16;
          const cornerLen = 8;

          // 4 corner ticks
          // Top Left
          ctx.beginPath();
          ctx.moveTo(-reticleSize, -reticleSize + cornerLen);
          ctx.lineTo(-reticleSize, -reticleSize);
          ctx.lineTo(-reticleSize + cornerLen, -reticleSize);
          ctx.stroke();

          // Top Right
          ctx.beginPath();
          ctx.moveTo(reticleSize - cornerLen, -reticleSize);
          ctx.lineTo(reticleSize, -reticleSize);
          ctx.lineTo(reticleSize, -reticleSize + cornerLen);
          ctx.stroke();

          // Bottom Left
          ctx.beginPath();
          ctx.moveTo(-reticleSize, reticleSize - cornerLen);
          ctx.lineTo(-reticleSize, reticleSize);
          ctx.lineTo(-reticleSize + cornerLen, reticleSize);
          ctx.stroke();

          // Bottom Right
          ctx.beginPath();
          ctx.moveTo(reticleSize - cornerLen, reticleSize);
          ctx.lineTo(reticleSize, reticleSize);
          ctx.lineTo(reticleSize, reticleSize - cornerLen);
          ctx.stroke();
        }

        // Render Word Badge
        const word = enemy.word.toUpperCase();
        ctx.font = 'bold 16px "Share Tech Mono", monospace';
        const totalWidth = ctx.measureText(word).width;
        const textY = enemy.size + 24;

        // Background pill
        ctx.fillStyle = isTarget ? 'rgba(0, 30, 50, 0.85)' : 'rgba(5, 10, 20, 0.75)';
        ctx.strokeStyle = isTarget ? '#00f0ff' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        const padX = 10;
        const padY = 5;
        ctx.beginPath();
        ctx.roundRect(-totalWidth / 2 - padX, textY - 14 - padY, totalWidth + padX * 2, 24 + padY, 6);
        ctx.fill();
        ctx.stroke();

        // Render individual letters: typed (cyan/glow) vs untyped (white)
        let currX = -totalWidth / 2;
        for (let idx = 0; idx < word.length; idx++) {
          const char = word[idx];
          const charWidth = ctx.measureText(char).width;

          if (idx < enemy.typedIndex) {
            // Completed letter
            ctx.fillStyle = '#00f0ff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00f0ff';
          } else if (idx === enemy.typedIndex && isTarget) {
            // Next required letter
            ctx.fillStyle = '#ffdd00';
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ffdd00';
          } else {
            // Remaining letters
            ctx.fillStyle = '#e2e8f0';
            ctx.shadowBlur = 0;
          }

          ctx.fillText(char, currX, textY);

          // Underline next letter if locked on
          if (idx === enemy.typedIndex && isTarget) {
            ctx.strokeStyle = '#ffdd00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(currX, textY + 4);
            ctx.lineTo(currX + charWidth, textY + 4);
            ctx.stroke();
          }

          currX += charWidth;
        }

        ctx.restore();
      });

      // Render Player Ship (if alive)
      if (!s.isOver) {
        ctx.save();
        ctx.translate(s.player.x, s.player.y);
        ctx.rotate(s.player.angle + Math.PI / 2); // default upright

        // Thruster Flame
        const flameLength = Math.random() * 12 + 18;
        ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(-8, 22);
        ctx.lineTo(0, 22 + flameLength);
        ctx.lineTo(8, 22);
        ctx.closePath();
        ctx.fill();

        // Outer Hull
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5;
        ctx.fillStyle = '#0a1024';
        ctx.beginPath();
        ctx.moveTo(0, -28); // Tip
        ctx.lineTo(18, 18); // Right wing
        ctx.lineTo(8, 14);  // Inner right
        ctx.lineTo(0, 20);  // Stern
        ctx.lineTo(-8, 14); // Inner left
        ctx.lineTo(-18, 18);// Left wing
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cockpit Vector
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(4, -4);
        ctx.lineTo(0, 2);
        ctx.lineTo(-4, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Shield Aura Ring
        if (s.shields > 0) {
          ctx.strokeStyle = s.shields > 1 ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 100, 50, 0.5)';
          ctx.shadowBlur = 15;
          ctx.shadowColor = s.shields > 1 ? '#00f0ff' : '#ff5533';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.arc(0, 0, 36, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.restore();
      }

      // Render Particles
      s.particles.forEach(p => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Floating Text
      s.floatingTexts.forEach(ft => {
        ctx.save();
        ctx.font = 'bold 15px "Orbitron", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.shadowBlur = 12;
        ctx.shadowColor = ft.color;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // Render Damage Vignette Flash on Hull Breach
      if (s.damageVignette > 0) {
        ctx.fillStyle = `rgba(255, 0, 50, ${s.damageVignette * 0.4})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    // Global Key Listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || stateRef.current.isOver) return;

      const key = e.key.toLowerCase();

      // EMP Trigger (Spacebar or Enter)
      if (key === ' ' || key === 'enter') {
        e.preventDefault();
        triggerEmp();
        return;
      }

      // Filter only letters [a-z]
      if (key.length !== 1 || !key.match(/[a-z]/)) return;

      const s = stateRef.current;
      s.totalLettersTyped++;

      let target = s.enemies.find(e => e.id === s.targetEnemyId);

      // Case 1: No enemy currently targeted
      if (!target) {
        // Find all alive enemies whose word starts with this key
        const candidates = s.enemies.filter(e => e.word[0].toLowerCase() === key);

        if (candidates.length > 0) {
          // Target the one with highest Y (closest to baseline / highest danger)
          candidates.sort((a, b) => b.y - a.y);
          target = candidates[0];
          s.targetEnemyId = target.id;

          // Register first letter hit
          s.correctLettersTyped++;
          s.streak++;
          target.typedIndex = 1;
          sound.playLaser(1.0);

          // Spawn Laser bolt
          s.lasers.push({
            id: Math.random().toString(),
            startX: s.player.x,
            startY: s.player.y,
            targetX: target.x,
            targetY: target.y,
            progress: 0,
            color: '#00f0ff',
          });

          // Check if single-letter enemy (e.g. mine)
          if (target.typedIndex >= target.word.length) {
            destroyEnemy(target);
          }
        } else {
          // Miss / Wrong key
          sound.playError();
          s.streak = 0;
        }
      } else {
        // Case 2: We have an active target locked
        const expectedChar = target.word[target.typedIndex]?.toLowerCase();

        if (key === expectedChar) {
          // Correct key!
          s.correctLettersTyped++;
          s.streak++;
          target.typedIndex++;
          sound.playLaser(1.0 + (target.typedIndex / target.word.length) * 0.4);

          // Fire Laser
          s.lasers.push({
            id: Math.random().toString(),
            startX: s.player.x,
            startY: s.player.y,
            targetX: target.x,
            targetY: target.y,
            progress: 0,
            color: '#00f0ff',
          });

          // Check if word completed
          if (target.typedIndex >= target.word.length) {
            destroyEnemy(target);
          }
        } else {
          // Miss! Wrong key
          sound.playError();
          s.streak = 0;
        }
      }
    };

    const destroyEnemy = (enemy: Enemy) => {
      const s = stateRef.current;
      sound.playExplosion(enemy.type === 'dreadnought');
      createExplosion(enemy.x, enemy.y, enemy.color, enemy.type === 'dreadnought' ? 45 : 25);

      // Score calculation
      const basePoints = enemy.word.length * 40;
      const waveBonus = s.wave * 10;
      const totalPoints = (basePoints + waveBonus) * s.multiplier;
      s.score += totalPoints;
      s.enemiesKilled++;
      s.empCharge = Math.min(100, s.empCharge + 8);

      // Floating score popup
      s.floatingTexts.push({
        id: Math.random().toString(),
        x: enemy.x,
        y: enemy.y,
        text: `+${totalPoints} ${s.multiplier > 1 ? `(x${s.multiplier})` : ''}`,
        color: enemy.color,
        alpha: 1,
        vy: -1.2,
      });

      // Dreadnought mini-mine split on destruction
      if (enemy.type === 'dreadnought') {
        s.screenShake = 12;
        const mineWords = ['x', 'z', 'q'];
        for (let i = 0; i < 2; i++) {
          s.enemies.push({
            id: Math.random().toString(),
            x: enemy.x + (i === 0 ? -40 : 40),
            y: enemy.y + 20,
            speed: enemy.speed * 1.6,
            word: mineWords[i % mineWords.length],
            typedIndex: 0,
            type: 'mine',
            size: 20,
            color: '#ff3366',
            maxHp: 1,
            hp: 1,
          });
        }
      }

      // Remove from enemies list
      s.enemies = s.enemies.filter(e => e.id !== enemy.id);
      s.targetEnemyId = null;
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [difficulty, isPaused, onGameOver, onStatsUpdate, onWaveBanner]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block cursor-crosshair z-0"
    />
  );
};
