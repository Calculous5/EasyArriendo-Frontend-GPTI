import { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Modal from './components/Modal.jsx';
import ListView from './views/ListView.jsx';
import PreferencesView from './views/PreferencesView.jsx';
import RankingView from './views/RankingView.jsx';
import DetailView from './views/DetailView.jsx';
import ProfileView from './views/ProfileView.jsx';
import { properties, defaults } from './data/properties.js';
import { calculate, rankProperties, validatePreferences } from './services/calculations.js';
const readLocal = () => {
  try {
    const v = JSON.parse(localStorage.getItem('easyarriendo-demo-v1'));
    if (v && typeof v.user?.name === 'string' && typeof v.user?.email === 'string' && Array.isArray(v.favorites) && !validatePreferences(v.prefs)) return v;
  } catch {/* El almacenamiento puede estar bloqueado. */}
  return null;
};
export default function App() {
  const [stored] = useState(readLocal);
  const [user, setUser] = useState(stored?.user ?? null);
  const [prefs, setPrefs] = useState(stored?.prefs ?? {
    ...defaults
  });
  const [favorites, setFavorites] = useState(stored?.favorites.filter(id => properties.some(p => p.id === id)) ?? []);
  const [selected, setSelected] = useState([1, 2, 3]);
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || '/');
  const [modal, setModal] = useState(null);
  const [afterLogin, setAfterLogin] = useState('/perfil');
  const [toast, setToast] = useState('');
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    const change = () => {
      setRoute(window.location.hash.slice(1) || '/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    if (user && !validatePreferences(prefs)) {
      try {
        localStorage.setItem('easyarriendo-demo-v1', JSON.stringify({
          user,
          prefs,
          favorites
        }));
      } catch {
        queueMicrotask(() => setStorageError(true));
      }
    }
  }, [user, prefs, favorites]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(id);
  }, [toast]);
  const navigate = path => {
    window.location.hash = path;
  };
  const onLogin = (path = '/perfil') => {
    setAfterLogin(path);
    setModal({
      type: 'login'
    });
  };
  const toggleCompare = id => setSelected(ids => ids.includes(id) ? ids.filter(n => n !== id) : [...ids, id]);
  const toggleFavorite = id => {
    if (!user) {
      setAfterLogin(`/propiedad/${id}`);
      setModal({
        type: 'login',
        favoriteId: id
      });
      return;
    }
    setFavorites(ids => ids.includes(id) ? ids.filter(n => n !== id) : [...ids, id]);
  };
  const safePrefs = validatePreferences(prefs) ? defaults : prefs;
  const items = properties.map(p => calculate(p, safePrefs));
  const selectedItems = items.filter(p => selected.includes(p.id));
  const ranked = rankProperties(selectedItems)(safePrefs);
  const logout = () => {
    try {
      localStorage.removeItem('easyarriendo-demo-v1');
    } catch {
      setStorageError(true);
    }
    setUser(null);
    setFavorites([]);
    setPrefs({
      ...defaults
    });
    setModal(null);
    navigate('/');
    setToast('Sesión cerrada. Los datos locales se eliminaron.');
  };
  let view;
  if (route === '/' || route === '/favoritos') view = <ListView key={route} items={items} selected={selected} favorites={favorites} toggleCompare={toggleCompare} toggleFavorite={toggleFavorite} navigate={navigate} prefs={safePrefs} onlyFavorites={route === '/favoritos'} />;else if (route === '/preferencias') view = <PreferencesView prefs={prefs} setPrefs={setPrefs} selectedItems={selectedItems} toggleCompare={toggleCompare} navigate={navigate} user={user} onLogin={onLogin} />;else if (route === '/ranking' || route === '/comparacion') view = <RankingView ranked={ranked} selectedItems={selectedItems} prefs={safePrefs} navigate={navigate} user={user} onLogin={onLogin} comparison={route === '/comparacion'} />;else if (route.startsWith('/propiedad/')) {
    const p = items.find(p => p.id === Number(route.split('/')[2]));
    view = <DetailView key={route} property={p} prefs={safePrefs} selected={selected.includes(p?.id)} favorite={favorites.includes(p?.id)} toggleCompare={toggleCompare} toggleFavorite={toggleFavorite} navigate={navigate} onContact={property => setModal({
      type: 'contact',
      property
    })} />;
  } else if (route === '/perfil') view = <ProfileView key={user ? 'user' : 'guest'} user={user} prefs={safePrefs} onSave={setUser} onLogout={logout} onDelete={() => setModal({
    type: 'delete'
  })} onLogin={onLogin} navigate={navigate} />;else view = <section className="panel empty"><h1>Página no encontrada</h1><button className="primary" onClick={() => navigate('/')}>Ir al inicio</button></section>;
  return <><a href="#main" className="skip-link" onClick={e => {
      e.preventDefault();
      document.getElementById('main').focus();
    }}>Saltar al contenido</a><Header navigate={navigate} user={user} onLogin={onLogin} onInfo={type => setModal({
      type
    })} favoriteCount={favorites.length} />{storageError && <p className="error shell" role="status">No pudimos guardar los datos en este navegador. Puedes seguir usando la sesión actual.</p>}<main id="main" tabIndex={-1} className="shell">{view}</main><footer className="shell"><strong>EasyArriendo</strong><p>El costo de tu hogar va más allá del arriendo.</p><small>Prototipo académico · Grupo 8 · Propiedades, rutas y contactos simulados.</small></footer>{toast && <div role="status" className="toast">{toast}</div>}{modal && <Modal title={modal.type === 'login' ? 'Entra a EasyArriendo' : modal.type === 'contact' ? 'Contactar al publicador' : modal.type === 'delete' ? 'Eliminar datos locales' : '¿Cómo funciona EasyArriendo?'} onClose={() => setModal(null)}>{modal.type === 'login' ? <><p>Usa una cuenta de demostración para guardar favoritos, preferencias y ver tu ranking. No requiere contraseña y no crea una cuenta en TOCTOC.</p><button className="primary full" onClick={() => {
          setUser({
            name: 'Usuario demo',
            email: 'demo@example.com'
          });
          if (modal.favoriteId) setFavorites(ids => [...new Set([...ids, modal.favoriteId])]);
          setModal(null);
          navigate(afterLogin);
          setToast('Cuenta de demostración iniciada.');
        }}>Continuar con cuenta demo</button><p className="fine">Se guardan datos en este navegador. Puedes borrarlos desde Mi perfil. No hay autenticación real.</p></> : modal.type === 'contact' ? <form className="preferences" onSubmit={e => {
        e.preventDefault();
        setModal(null);
        setToast('Consulta simulada registrada. No se envió ningún mensaje.');
      }}><p>Consulta por {modal.property.address}. Este formulario es una simulación.</p><label>Nombre<input required minLength="2" placeholder="Nombre de ejemplo" /></label><label>Correo<input required type="email" placeholder="demo@example.com" /></label><label>Consulta<textarea required minLength="10" defaultValue={`Hola, quisiera conocer más sobre ${modal.property.address}.`} /></label><button className="primary">Simular consulta</button></form> : modal.type === 'delete' ? <><p>Se eliminarán tu perfil, preferencias y favoritos guardados en este navegador.</p><button className="danger" onClick={logout}>Confirmar eliminación</button><button className="text-button" onClick={() => setModal(null)}>Cancelar</button></> : <><p>Selecciona al menos dos propiedades, configura tu destino, transporte y prioridades, y compara su costo real mensual.</p><p>El cálculo suma arriendo, gastos comunes, transporte y tiempo valorizado. Usa la cuenta demo para generar un ranking y guardar favoritos.</p><p className="notice">Las direcciones disponibles, rutas, tarifas y consultas son de demostración. No se conecta con TOCTOC ni Mapbox.</p><button className="primary" onClick={() => setModal(null)}>Entendido</button></>}</Modal>}</>;
}
