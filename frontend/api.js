const BASE = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");
const KEY = "groundtruth_token";

export const getToken = () => localStorage.getItem(KEY);
export const setToken = (t) => localStorage.setItem(KEY, t);
export const clearToken = () => localStorage.removeItem(KEY);

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (getToken()) {
    headers.set("Authorization", `Bearer ${getToken()}`);
  }

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(BASE + path, { ...options, headers });
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("json") ? await res.json() : await res.text();

  if (!res.ok) {
    if (res.status === 401) clearToken();
    throw new Error(
      data?.detail || data || `Request failed (${res.status})`
    );
  }

  return data;
}

export const auth = {
  register: (d) =>
    api("/api/auth/register", { method: "POST", body: JSON.stringify(d) }),
  login: (d) =>
    api("/api/auth/login", { method: "POST", body: JSON.stringify(d) }),
  me: () => api("/api/auth/me"),
};

export const quests = {
  list: (slot) => api("/api/quests" + (slot ? `?time_slot=${slot}` : "")),
  daily: (slot) =>
    api("/api/quests/daily" + (slot ? `?time_slot=${slot}` : "")),
  one: (id) => api(`/api/quests/${id}`),
};

export const submissions = {
  mine: () => api("/api/submissions/me"),
  send: (id, file, key) => {
    const f = new FormData();
    f.append("quest_id", id);
    f.append("image", file);
    return api("/api/submissions", {
      method: "POST",
      headers: { "Idempotency-Key": key },
      body: f,
    });
  },
};

export const rewards = {
  mine: () => api("/api/rewards/me"),
  board: (type, region) =>
    api(
      `/api/leaderboard/weekly?region_type=${type}&region=${encodeURIComponent(
        region
      )}`
    ),
};