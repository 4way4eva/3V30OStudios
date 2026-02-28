/**
 * EV0LVERSE API Service Layer
 * Abstracts all data-fetching with retry logic, caching, and error handling.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const CACHE = new Map();
const CACHE_TTL_MS = 30_000; // 30 seconds

/* ─── Core fetch wrapper ─────────────────────────────────────────────── */

async function request(path, options = {}, retries = 3) {
  const key = `${options.method || 'GET'}:${path}:${JSON.stringify(options.body || {})}`;
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS && !options.noCache) {
    return cached.data;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status} — ${res.statusText}`);
      }

      const data = await res.json();
      if (!options.noCache) CACHE.set(key, { data, ts: Date.now() });
      return data;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1)));
    }
  }
}

/* ─── Vault API ──────────────────────────────────────────────────────── */

export const vaultApi = {
  getStats:       ()         => request('/vault/stats'),
  getHistory:     (vaultId)  => request(`/vault/${vaultId}/history`),
  simulateYield:  (vaultId, amount) =>
    request(`/vault/${vaultId}/simulate`, { method: 'POST', body: JSON.stringify({ amount }) }),
  claimYield:     (vaultId)  =>
    request(`/vault/${vaultId}/claim`, { method: 'POST', noCache: true }),
};

/* ─── ENFT API ───────────────────────────────────────────────────────── */

export const enftApi = {
  getAll:     (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/enft?${qs}`);
  },
  getById:    (id)           => request(`/enft/${id}`),
  mint:       (data)         => request('/enft/mint', { method: 'POST', body: JSON.stringify(data), noCache: true }),
  transfer:   (id, to)       => request(`/enft/${id}/transfer`, { method: 'POST', body: JSON.stringify({ to }), noCache: true }),
  getByWallet:(address)      => request(`/enft/wallet/${address}`),
};

/* ─── Governance API ─────────────────────────────────────────────────── */

export const governanceApi = {
  getProposals:    ()            => request('/governance/proposals'),
  getProposal:     (id)          => request(`/governance/proposals/${id}`),
  createProposal:  (data)        => request('/governance/proposals', { method: 'POST', body: JSON.stringify(data), noCache: true }),
  vote:            (id, vote)    => request(`/governance/proposals/${id}/vote`, { method: 'POST', body: JSON.stringify({ vote }), noCache: true }),
  getGovernors:    ()            => request('/governance/governors'),
};

/* ─── Token API ──────────────────────────────────────────────────────── */

export const tokenApi = {
  getTokens:       ()            => request('/tokens'),
  getToken:        (symbol)      => request(`/tokens/${symbol}`),
  getFlowMap:      ()            => request('/tokens/flow'),
  getPriceHistory: (symbol)      => request(`/tokens/${symbol}/price-history`),
};

/* ─── Treasury API ───────────────────────────────────────────────────── */

export const treasuryApi = {
  getOverview:     ()            => request('/treasury/overview'),
  getYieldCycles:  ()            => request('/treasury/yield-cycles'),
  getNetworks:     ()            => request('/treasury/networks'),
};

/* ─── Cache utilities ────────────────────────────────────────────────── */

export const clearCache  = (key) => key ? CACHE.delete(key) : CACHE.clear();
export const getCacheSize = ()    => CACHE.size;
