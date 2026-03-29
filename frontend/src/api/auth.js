const BASE = 'http://localhost:8000';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Request failed');
  }
  return data;
}

// ── Seeker Auth ──────────────────────────────────────────────────────────────

/** POST /api/v1/auth/register */
export async function registerUser({ username, email, password, alias }) {
  const res = await fetch(`${BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, alias }),
  });
  return handleResponse(res);
}

/** POST /api/v1/auth/login/access-token  (OAuth2 form-encoded) */
export async function loginUser({ email, password }) {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${BASE}/api/v1/auth/login/access-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  return handleResponse(res); // { access_token, refresh_token, token_type, role, user_id }
}

/** POST /api/v1/auth/refresh-token */
export async function refreshTokens(refreshToken) {
  const res = await fetch(`${BASE}/api/v1/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return handleResponse(res);
}

/** GET /api/v1/auth/users/me */
export async function getMe(accessToken) {
  const res = await fetch(`${BASE}/api/v1/auth/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res); // { username, email, user_id, alias }
}

// ── Helper Auth ──────────────────────────────────────────────────────────────

/** POST /api/v1/auth/helper/register */
export async function registerHelper({ username, email, password, domain_expertise = 'general', role = 'peer', proof_id, alias }) {
  const res = await fetch(`${BASE}/api/v1/auth/helper/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, domain_expertise, role, proof_id, alias }),
  });
  return handleResponse(res);
}

/** POST /api/v1/auth/helper/login/access-token  (OAuth2 form-encoded) */
export async function loginHelper({ email, password }) {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${BASE}/api/v1/auth/helper/login/access-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  return handleResponse(res); // { access_token, refresh_token, token_type, role, user_id (helper_id) }
}

/** GET /api/v1/auth/helpers/me */
export async function getHelperMe(accessToken) {
  const res = await fetch(`${BASE}/api/v1/auth/helpers/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res); // { username, email, helper_id, domain_expertise, role, alias, proof_id }
}
