const API_BASE = window.location.origin;

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function fetchWithRetry(path, {
  retries = 5,
  backoff = 800,        // initial backoff in ms
  timeout = 12000,      // per-request timeout
  init = {}
} = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        cache: "no-store",
        signal: controller.signal,
        ...init
      });
      clearTimeout(timer);

      // Retry on transient server states
      if ([502, 503, 504].includes(res.status)) throw new Error(`Transient ${res.status}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res; // success
    } catch (err) {
      clearTimeout(timer);
      if (attempt === retries) throw err;           // out of retries
      await sleep(backoff * Math.pow(2, attempt));  // exponential backoff
    }
  }
}

// Call this once on startup to wake the server
export async function ensureApiAwake() {
  const res = await fetch('/ping');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchAnimals() {
  const res = await fetchWithRetry("/api/animals", { retries: 4, backoff: 700 });
  return res.json();
}
