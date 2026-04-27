const STORAGE_KEY = 'gmf-applausometro-leaderboard';

export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry) {
  const entries = getLeaderboard();
  const updated = [...entries, entry].sort((a, b) => b.score - a.score);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function removeEntry(id) {
  const updated = getLeaderboard().filter((entry) => entry.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearLeaderboard() {
  localStorage.removeItem(STORAGE_KEY);
}
