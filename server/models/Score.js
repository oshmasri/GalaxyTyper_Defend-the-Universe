import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
    default: 'Pilot',
  },
  score: {
    type: Number,
    required: true,
    min: 0,
  },
  wpm: {
    type: Number,
    default: 0,
  },
  accuracy: {
    type: Number,
    default: 100,
  },
  wave: {
    type: Number,
    default: 1,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'normal', 'hard'],
    default: 'normal',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Score = mongoose.model('Score', scoreSchema);
