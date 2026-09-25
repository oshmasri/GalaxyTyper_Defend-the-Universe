// API Service for communicating with MERN backend
export interface ScoreEntry {
  _id?: string;
  username: string;
  score: number;
  wpm: number;
  accuracy: number;
  wave: number;
  difficulty?: string;
  createdAt?: string;
}

const API_BASE = '/api';

export async function fetchLeaderboard(limit = 10): Promise<ScoreEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/scores?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.scores || [];
  } catch (err) {
    console.warn('Backend unavailable, using local mock data:', err);
    // Return local stored scores if backend is not reachable
    const local = localStorage.getItem('galaxy_typer_scores');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // fallback
      }
    }
    return [
      { username: 'StarCommander', score: 14500, wpm: 78, accuracy: 98, wave: 8, createdAt: new Date().toISOString() },
      { username: 'NovaTypist', score: 11200, wpm: 66, accuracy: 95, wave: 6, createdAt: new Date().toISOString() },
      { username: 'CyberAce', score: 9400, wpm: 61, accuracy: 92, wave: 5, createdAt: new Date().toISOString() },
    ];
  }
}

export async function submitScore(scoreData: {
  username: string;
  score: number;
  wpm: number;
  accuracy: number;
  wave: number;
  difficulty: string;
}): Promise<{ success: boolean; rank?: number }> {
  try {
    const res = await fetch(`${API_BASE}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scoreData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, rank: data.rank };
  } catch (err) {
    console.warn('Backend submit failed, saving to localStorage:', err);
    // Local fallback
    try {
      const existing: ScoreEntry[] = JSON.parse(localStorage.getItem('galaxy_typer_scores') || '[]');
      existing.push({
        ...scoreData,
        createdAt: new Date().toISOString(),
      });
      existing.sort((a, b) => b.score - a.score);
      localStorage.setItem('galaxy_typer_scores', JSON.stringify(existing.slice(0, 20)));
      const rank = existing.findIndex(s => s.score === scoreData.score) + 1;
      return { success: true, rank };
    } catch {
      return { success: true, rank: 1 };
    }
  }
}
