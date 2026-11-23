import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Modal from './components/Modal.jsx';
import ListView from './views/ListView.jsx';
import PreferencesView from './views/PreferencesView.jsx';
import ComparisonView from './views/ComparisonView.jsx';
import RankingView from './views/RankingView.jsx';
import DetailView from './views/DetailView.jsx';
import ProfileView from './views/ProfileView.jsx';
import SharedRankingView from './views/SharedRankingView.jsx';
import { AuthPanel, ResetPasswordView, VerifyEmailView } from './views/AuthViews.jsx';
import { defaults } from './data/properties.js';
import { api, getToken, setToken } from './api/client.js';
import { toProperty } from './api/adapters.js';

// Datos de la sesión de navegación (selección y preferencias). Duran solo mientras la pestaña está abierta (RN-16).
const SESSION_KEY = 'easyarriendo-session-v2';
function readSession() {
  try {
    const v = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (v && Array.isArray(v.selected) && v.prefs) return { selected: v.selected, prefs: { ...defaults, ...v.prefs } };
  } catch {/* El almacenamiento puede estar bloqueado. */}
  return { selected: [], prefs: { ...defaults } };
}

const parseRoute = hash => {
  const [path, query = ''] = (hash.slice(1) || '/').split('?');
  return { path, params: new URLSearchParams(query) };
};

async function profilePrefs() {
  const saved = await api.preferences();
  if (saved.is_default) return null;
  const next = { mode: saved.mode, days: saved.days, costWeight: saved.cost_weight, timeWeight: saved.time_weight };
  if (saved.home_address) {
    const [match] = await api.geocode(saved.home_address).catch(() => []);
    if (match) next.origin = { ...match, label: saved.home_address };
  }
  return next;
}

export default function App() {
  const [initial] = useState(readSession);
  const [prefs, setPrefs] = useState(initial.prefs);
  const [selected, setSelected] = useState(initial.selected);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [cache, setCache] = useState({});
  const [missing, setMissing] = useState({});
  const [rates, setRates] = useState(null);
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  const [modal, setModal] = useState(null);
  const [afterLogin, setAfterLogin] = useState('/');
  const [toast, setToast] = useState('');

  const remember = useCallback(items => setCache(c => ({ ...c, ...Object.fromEntries(items.map(p => [p.id, p])) })), []);
  const navigate = path => {
    window.location.hash = path;
  };

  useEffect(() => {
    const change = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ selected, prefs }));
    } catch {/* Sin almacenamiento, la selección dura mientras la página esté abierta. */}
  }, [selected, prefs]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 6000);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    api.parameters().then(p => setRates(p.rates)).catch(() => {});
  }, []);

  // Carga el perfil del usuario: favoritos y preferencias guardadas (F-06, F-07).
  const loadAccount = useCallback(async (account, { applyPrefs }) => {
    setUser(account);
    if (account.role !== 'registered') return;
    const [favs, saved] = await Promise.all([api.favorites().catch(() => []), applyPrefs ? profilePrefs().catch(() => null) : null]);
    remember(favs.map(f => toProperty(f.property)));
    setFavorites(favs.map(f => f.property.id));
    if (saved) setPrefs(p => ({ ...p, ...saved }));
  }, [remember]);

  // Restaura la sesión si la pestaña ya tenía un token.
  useEffect(() => {
    if (!getToken()) return;
    api.me().then(account => loadAccount(account, { applyPrefs: !readSession().prefs.origin })).catch(() => setToken(null));
  }, [loadAccount]);

  // Trae las propiedades seleccionadas o abiertas que aún no están en memoria.
  const detailId = route.path.startsWith('/propiedad/') ? Number(route.path.split('/')[2]) : null;
  const needed = [...new Set([...selected, ...(detailId ? [detailId] : [])])].filter(id => !cache[id] && !missing[id]);
  const neededKey = needed.join(',');
  useEffect(() => {
    if (!neededKey) return;
    const ids = neededKey.split(',').map(Number);
    api.properties({ ids, page_size: 50 }).then(data => {
      const found = data.items.map(toProperty);
      remember(found);
      const gone = ids.filter(id => !found.some(p => p.id === id));
      if (gone.length) {
        setMissing(m => ({ ...m, ...Object.fromEntries(gone.map(id => [id, 'La propiedad no existe o ya no está disponible.'])) }));
        setSelected(s => s.filter(id => !gone.includes(id)));
      }
    }).catch(err => setToast(err.message));
  }, [neededKey, remember]);

  const onLogin = (path = '/') => {
    setAfterLogin(path);
    setModal({ type: 'login' });
  };
  const onAuthenticated = async ({ access_token, user: account }) => {
    setToken(access_token);
    setModal(null);
    await loadAccount(account, { applyPrefs: true });
    if (modal?.favoriteId && account.role === 'registered') await toggleFavorite(modal.favoriteId, account);
    setToast(`¡Hola, ${account.full_name.split(' ')[0]}!`);
    navigate(afterLogin);
  };
  const logout = (showToast = true) => {
    setToken(null);
    setUser(null);
    setFavorites([]);
    setModal(null);
    navigate('/');
    if (showToast) setToast('Sesión cerrada.');
  };
  const toggleCompare = id => setSelected(ids => ids.includes(id) ? ids.filter(n => n !== id) : ids.length >= 24 ? ids : [...ids, id]);
  async function toggleFavorite(id, account = user) {
    if (!account) {
      setAfterLogin(route.path);
      setModal({ type: 'login', favoriteId: id });
      return;
    }
    if (account.role !== 'registered') {
      setToast('Los favoritos son para usuarios registrados.');
      return;
    }
    const isFav = favorites.includes(id);
    try {
      if (isFav) await api.removeFavorite(id);
      else await api.addFavorite(id);
      setFavorites(ids => isFav ? ids.filter(n => n !== id) : [...new Set([...ids, id])]);
    } catch (err) {
      setToast(err.message);
    }
  }
  const saveProfilePrefs = p => api.savePreferences({ mode: p.mode, days: p.days, cost_weight: p.costWeight, time_weight: p.timeWeight, home_address: p.origin?.label ?? null });
  const deleteAccount = async e => {
    e.preventDefault();
    try {
      await api.deleteAccount(new FormData(e.target).get('password'));
      logout(false);
      setToast('Tu cuenta y tus datos fueron eliminados.');
    } catch (err) {
      setModal({ type: 'delete', error: err.message });
    }
  };

  const selectedItems = selected.map(id => cache[id]).filter(Boolean);
  const { path, params } = route;
  let view;
  if (path === '/' || path === '/favoritos') view = <ListView key={path} prefs={prefs} selected={selected} favorites={favorites} toggleCompare={toggleCompare} toggleFavorite={id => toggleFavorite(id)} navigate={navigate} remember={remember} onlyFavorites={path === '/favoritos'} />;
  else if (path === '/preferencias') view = <PreferencesView prefs={prefs} setPrefs={setPrefs} rates={rates} selectedItems={selectedItems} toggleCompare={toggleCompare} navigate={navigate} user={user} onLogin={onLogin} onSaveProfile={saveProfilePrefs} />;
  else if (path === '/comparacion') view = <ComparisonView selectedItems={selectedItems} prefs={prefs} navigate={navigate} user={user} onLogin={onLogin} />;
  else if (path === '/ranking') view = <RankingView selectedItems={selectedItems} prefs={prefs} navigate={navigate} user={user} onLogin={onLogin} />;
  else if (detailId) view = <DetailView key={path} property={cache[detailId]} missing={missing[detailId]} prefs={prefs} rates={rates} selected={selected.includes(detailId)} favorite={favorites.includes(detailId)} hasComparison={selected.length >= 2} toggleCompare={toggleCompare} toggleFavorite={id => toggleFavorite(id)} navigate={navigate} />;
  else if (path === '/perfil') view = <ProfileView key={user?.id ?? 'guest'} user={user} onUserChange={setUser} onLogout={logout} onDelete={() => setModal({ type: 'delete' })} onLogin={onLogin} navigate={navigate} notify={setToast} />;
  else if (path.startsWith('/r/')) view = <SharedRankingView id={path.slice(3)} navigate={navigate} />;
  else if (path === '/verificar') view = <VerifyEmailView token={params.get('token') ?? ''} onLogin={onLogin} />;
  else if (path === '/restablecer') view = <ResetPasswordView token={params.get('token') ?? ''} onLogin={onLogin} />;
  else view = <section className="panel empty"><h1>Página no encontrada</h1><button className="primary" onClick={() => navigate('/')}>Ir al inicio</button></section>;

  const modalTitle = { login: 'Entra a EasyArriendo', delete: 'Eliminar mi cuenta', ayuda: '¿Cómo funciona EasyArriendo?' }[modal?.type];
  return <><a href="#main" className="skip-link" onClick={e => {
      e.preventDefault();
      document.getElementById('main').focus();
    }}>Saltar al contenido</a><Header navigate={navigate} user={user} onLogin={() => onLogin(route.path)} onInfo={type => setModal({ type })} favoriteCount={favorites.length} /><main id="main" tabIndex={-1} className="shell">{view}</main><footer className="shell"><strong>EasyArriendo</strong><p>El costo de tu hogar va más allá del arriendo.</p><small>Prototipo académico · Grupo 8 · GPTI. Rutas y tiempos estimados con Mapbox; geocodificación de propiedades © colaboradores de OpenStreetMap.</small></footer>{toast && <div role="status" className="toast">{toast}</div>}{modal && <Modal title={modalTitle} onClose={() => setModal(null)}>{modal.type === 'login' ? <AuthPanel onAuthenticated={onAuthenticated} /> : modal.type === 'delete' ? <form className="preferences" onSubmit={deleteAccount}><p>Se eliminarán tu cuenta, tus preferencias y tus favoritos. Esta acción no se puede deshacer.</p><label>Confirma con tu contraseña<input name="password" type="password" required autoComplete="current-password" /></label>{modal.error && <p className="error" role="alert">{modal.error}</p>}<button className="danger">Eliminar definitivamente</button><button type="button" className="text-button" onClick={() => setModal(null)}>Cancelar</button></form> : <><p>1. Busca y marca al menos dos propiedades para comparar.</p><p>2. Indica dónde trabajas o estudias, cómo te mueves y qué te importa más: ahorrar dinero o tiempo.</p><p>3. Compara el costo real mensual: arriendo, gastos comunes, transporte y tiempo de traslado valorizado.</p><p>Con una cuenta gratuita obtienes tu ranking personalizado, guardas favoritos y preferencias, y puedes compartir tu ranking por WhatsApp.</p><p className="notice">Transporte y tiempo son estimaciones. El transporte público se estima a partir del tiempo en auto.</p><button className="primary" onClick={() => setModal(null)}>Entendido</button></>}</Modal>}</>;
}
