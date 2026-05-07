import type { Choice, PlayResult, ScoreboardEntry } from './types';

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.text();
      if (body) message = body;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function getChoices(): Promise<Choice[]> {
  const res = await fetch(`${BASE_URL}/choices`);
  return handleResponse<Choice[]>(res);
}

export async function play(username: string, player: number): Promise<PlayResult> {
  const res = await fetch(`${BASE_URL}/play`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, player }),
  });
  return handleResponse<PlayResult>(res);
}

export async function getScoreboard(): Promise<ScoreboardEntry[]> {
  const res = await fetch(`${BASE_URL}/scoreboard`);
  return handleResponse<ScoreboardEntry[]>(res);
}

export async function resetScoreboard(): Promise<void> {
  const res = await fetch(`${BASE_URL}/scoreboard`, { method: 'DELETE' });
  return handleResponse<void>(res);
}
