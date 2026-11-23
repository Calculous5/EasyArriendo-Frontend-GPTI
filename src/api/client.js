// Cliente de la API de EasyArriendo. Toda la información pasa por el backend (REQ-IS-01).
const BASE_URL = (import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const TOKEN_KEY = 'easyarriendo-token';

// El token vive solo en la sesión del navegador (REQ-IH-03).
const storage = {
  get() {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch {/* El almacenamiento puede estar bloqueado; la sesión dura mientras la pestaña esté abierta. */}
  }
};
let memoryToken = storage.get();
export const getToken = () => memoryToken;
export function setToken(token) {
  memoryToken = token;
  storage.set(token);
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, query, auth = true } = {}) {
  const url = new URL(BASE_URL + path);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '' || value === false) continue;
    for (const v of Array.isArray(value) ? value : [value]) url.searchParams.append(key, v);
  }
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && memoryToken) headers.Authorization = `Bearer ${memoryToken}`;
  let response;
  try {
    response = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError('No pudimos conectar con el servidor. Revisa tu conexión e intenta nuevamente.', 0);
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && auth && memoryToken) setToken(null);
    const detail = typeof data?.detail === 'string' ? data.detail : 'Ocurrió un problema. Intenta nuevamente.';
    throw new ApiError(detail, response.status);
  }
  return data;
}

const travelBody = (ids, prefs) => ({
  property_ids: ids,
  origin: prefs.origin,
  mode: prefs.mode,
  days: prefs.days,
  cost_weight: prefs.costWeight,
  time_weight: prefs.timeWeight
});

export const api = {
  // Propiedades (F-01, SC-01)
  properties: query => request('/properties', { query }),
  property: id => request(`/properties/${id}`),
  comunas: () => request('/comunas'),
  parameters: () => request('/parameters/public'),
  geocode: q => request('/geocode', { query: { q } }),
  // Cálculo (F-02 a F-05)
  estimates: (ids, prefs) => request('/estimates', { method: 'POST', body: travelBody(ids, prefs) }),
  compare: (ids, prefs) => request('/comparisons', { method: 'POST', body: travelBody(ids, prefs) }),
  rank: (ids, prefs) => request('/rankings', { method: 'POST', body: travelBody(ids, prefs) }),
  share: (ids, prefs) => request('/shared-rankings', { method: 'POST', body: travelBody(ids, prefs) }),
  shared: id => request(`/shared-rankings/${encodeURIComponent(id)}`, { auth: false }),
  // Cuenta (F-10, F-09)
  register: body => request('/auth/register', { method: 'POST', body, auth: false }),
  resendVerification: email => request('/auth/resend-verification', { method: 'POST', body: { email }, auth: false }),
  verifyEmail: token => request('/auth/verify-email', { method: 'POST', body: { token }, auth: false }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  forgotPassword: email => request('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }),
  resetPassword: (token, password) => request('/auth/reset-password', { method: 'POST', body: { token, password }, auth: false }),
  me: () => request('/me'),
  updateMe: body => request('/me', { method: 'PATCH', body }),
  changePassword: (current_password, new_password) => request('/me/password', { method: 'PUT', body: { current_password, new_password } }),
  exportData: () => request('/me/data-export'),
  deleteAccount: password => request('/me', { method: 'DELETE', body: { password } }),
  // Preferencias y favoritos (F-06, F-07)
  preferences: () => request('/me/preferences'),
  savePreferences: body => request('/me/preferences', { method: 'PUT', body }),
  resetPreferences: () => request('/me/preferences', { method: 'DELETE' }),
  favorites: () => request('/me/favorites'),
  addFavorite: id => request(`/me/favorites/${id}`, { method: 'PUT' }),
  removeFavorite: id => request(`/me/favorites/${id}`, { method: 'DELETE' })
};
