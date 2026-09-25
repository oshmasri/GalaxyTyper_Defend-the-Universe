import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Score } from './models/Score.js';
import { WORD_BANK, getRandomWord } from './words.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/galaxy_typer';

app.use(cors());
app.use(express.json());

// Persistent fallback storage in case MongoDB is not locally running
const dataDir = path.join(__dirname, 'data');
const fallbackFilePath = path.join(dataDir, 'scores.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial starter scores
const defaultScores = [
  { username: 'StarCommander', score: 14500, wpm: 78, accuracy: 98, wave: 8, difficulty: 'normal', createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
  { username: 'NovaTypist', score: 11200, wpm: 66, accuracy: 95, wave: 6, difficulty: 'normal', createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
  { username: 'CyberAce', score: 9400, wpm: 61, accuracy: 92, wave: 5, difficulty: 'normal', createdAt: new Date(Date.now() - 3600000 * 8).toISOString() },
  { username: 'CosmoRider', score: 7200, wpm: 54, accuracy: 90, wave: 4, difficulty: 'normal', createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
  { username: 'CadetVanguard', score: 4800, wpm: 45, accuracy: 88, wave: 3, difficulty: 'normal', createdAt: new Date().toISOString() },
];

if (!fs.existsSync(fallbackFilePath)) {
  fs.writeFileSync(fallbackFilePath, JSON.stringify(defaultScores, null, 2));
}

let isMongoConnected = false;

// Attempt MongoDB Connection
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(async () => {
    isMongoConnected = true;
    console.log(' Connected to MongoDB at:', MONGO_URI);
    // Seed MongoDB if empty
    const count = await Score.countDocuments();
    if (count === 0) {
      await Score.insertMany(defaultScores);
      console.log(' Seeded initial leaderboard scores to MongoDB');
    }
  })
  .catch((err) => {
    isMongoConnected = false;
    console.log('ℹ MongoDB not reachable, using resilient JSON fallback storage:', err.message);
  });

function readFallbackScores() {
  try {
    const raw = fs.readFileSync(fallbackFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return defaultScores;
  }
}

function writeFallbackScores(scores) {
  try {
    fs.writeFileSync(fallbackFilePath, JSON.stringify(scores, null, 2));
  } catch (err) {
    console.error('Error writing fallback scores:', err);
  }
}

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Galaxy Typer Backend',
    database: isMongoConnected ? 'MongoDB' : 'Local JSON Fallback',
    timestamp: new Date().toISOString()
  });
});

// GET /api/scores - Get Top Leaderboard Scores
app.get('/api/scores', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    if (isMongoConnected) {
      const scores = await Score.find()
        .sort({ score: -1, accuracy: -1, wpm: -1 })
        .limit(limit);
      return res.json({ success: true, scores, source: 'mongodb' });
    } else {
      const scores = readFallbackScores()
        .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy)
        .slice(0, limit);
      return res.json({ success: true, scores, source: 'fallback' });
    }
  } catch (err) {
    console.error('Error fetching scores:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve scores' });
  }
});

// POST /api/scores - Save a New Score
app.post('/api/scores', async (req, res) => {
  try {
    const { username, score, wpm, accuracy, wave, difficulty } = req.body;

    if (score === undefined || isNaN(score)) {
      return res.status(400).json({ success: false, error: 'Valid score is required' });
    }

    const cleanUsername = (username && username.trim().slice(0, 20)) || 'Pilot';
    const scoreData = {
      username: cleanUsername,
      score: Math.max(0, parseInt(score, 10)),
      wpm: Math.max(0, parseInt(wpm, 10) || 0),
      accuracy: Math.min(100, Math.max(0, parseFloat(accuracy) || 100)),
      wave: Math.max(1, parseInt(wave, 10) || 1),
      difficulty: ['easy', 'normal', 'hard'].includes(difficulty) ? difficulty : 'normal',
      createdAt: new Date().toISOString(),
    };

    if (isMongoConnected) {
      const newScore = new Score(scoreData);
      await newScore.save();
      const rank = await Score.countDocuments({ score: { $gt: scoreData.score } }) + 1;
      return res.status(201).json({ success: true, score: newScore, rank });
    } else {
      const scores = readFallbackScores();
      scores.push(scoreData);
      scores.sort((a, b) => b.score - a.score);
      writeFallbackScores(scores);
      const rank = scores.findIndex(s => s === scoreData) + 1;
      return res.status(201).json({ success: true, score: scoreData, rank });
    }
  } catch (err) {
    console.error('Error saving score:', err);
    res.status(500).json({ success: false, error: 'Failed to submit score' });
  }
});

// GET /api/words - Get Word Bank or Random Words
app.get('/api/words', (req, res) => {
  const { difficulty = 'normal', wave = 1, count = 20 } = req.query;
  const numWords = Math.min(parseInt(count, 10) || 20, 100);
  const words = [];
  for (let i = 0; i < numWords; i++) {
    words.push(getRandomWord(difficulty, parseInt(wave, 10) || 1));
  }
  res.json({ success: true, words, bank: WORD_BANK });
});

app.listen(PORT, () => {
  console.log(`🌌 Galaxy Typer Server running on http://localhost:${PORT}`);
});
