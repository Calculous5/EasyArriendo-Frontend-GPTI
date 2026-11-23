import { useEffect, useState } from 'react';
import { Share2, Copy, MessageCircle } from 'lucide-react';
import Steps from '../components/Steps.jsx';
import PropertyVisual from '../components/PropertyVisual.jsx';
import MapView from '../components/MapView.jsx';
import { api } from '../api/client.js';
import { withEstimate } from '../api/adapters.js';
import { modeLabel, money, title, validatePreferences } from '../services/calculations.js';

// Compartir el ranking por enlace o WhatsApp (SC-02). El enlace muestra solo el costo total, sin desglose ni ubicación.
function ShareBox({ ids, prefs }) {
  const [share, setShare] = useState({ url: '', error: '', busy: false, copied: false });
  const create = async () => {
    setShare({ ...share, busy: true, error: '' });
    try {
      const created = await api.share(ids, prefs);
      setShare({ url: `${window.location.origin}${window.location.pathname}#/r/${created.id}`, error: '', busy: false, copied: false });
    } catch (err) {
      setShare({ url: '', error: err.message, busy: false, copied: false });
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(share.url);
      setShare({ ...share, copied: true });
    } catch {
      setShare({ ...share, error: 'No pudimos copiar el enlace. Selecciónalo y cópialo manualmente.' });
    }
  };
  const message = `Mira mi ranking de arriendos en EasyArriendo: ${share.url}`;
  return <section className="panel share-box"><h2>Comparte tu ranking</h2><p className="muted">Quien abra el enlace verá el orden y el costo mensual de cada propiedad, sin el desglose ni tu ubicación. El enlace vence en 30 días.</p>{share.url ? <><label className="sr-only" htmlFor="share-url">Enlace para compartir</label><input id="share-url" readOnly value={share.url} onFocus={e => e.target.select()} /><div className="share-actions"><button className="outline" onClick={copy}><Copy size={16} /> {share.copied ? 'Enlace copiado' : 'Copiar enlace'}</button><a className="primary whatsapp" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Enviar por WhatsApp</a></div></> : <button className="primary" onClick={create} disabled={share.busy}><Share2 size={16} /> {share.busy ? 'Creando enlace…' : 'Crear enlace para compartir'}</button>}{share.error && <p className="error" role="alert">{share.error}</p>}</section>;
}

// Ranking personalizado (F-05). Solo para usuarios registrados (RN-14, REQ-F05-07).
export default function RankingView({ selectedItems, prefs, navigate, user, onLogin }) {
  const [state, setState] = useState({ key: '', data: null, error: '' });
  const [attempt, setAttempt] = useState(0);
  const ids = selectedItems.map(p => p.id);
  const invalid = validatePreferences(prefs);
  const canRank = user?.role === 'registered';
  const key = JSON.stringify([ids, prefs]);
  const requestKey = `${key}#${attempt}`;
  useEffect(() => {
    if (!canRank || ids.length < 2 || invalid) return;
    let alive = true;
    const [requestIds, requestPrefs] = JSON.parse(key);
    api.rank(requestIds, requestPrefs).then(data => alive && setState({ key, data, error: '' })).catch(err => alive && setState({ key, data: null, error: err.message }));
    // requestKey cambia al reintentar; key identifica la selección y las preferencias.
    return () => {
      alive = false;
    };
  }, [requestKey, key, canRank, ids.length, invalid]);
  if (!user) return <section className="panel empty"><h1>Tu ranking personalizado te espera</h1><p>El ranking ordena tus propiedades según lo que más te importa y requiere una cuenta. Crearla es gratis.</p><button className="primary" onClick={() => onLogin('/ranking')}>Crear cuenta o iniciar sesión</button><button className="text-button" onClick={() => navigate('/comparacion')}>Seguir con la comparación</button></section>;
  if (!canRank) return <section className="panel empty"><h1>El ranking es para usuarios registrados</h1><p>Las cuentas de administración no generan rankings personales.</p><button className="primary" onClick={() => navigate('/comparacion')}>Ver comparación</button></section>;
  if (ids.length < 2) return <section className="panel empty"><h1>Selecciona al menos dos propiedades</h1><p>Vuelve al listado para construir tu ranking.</p><button className="primary" onClick={() => navigate('/')}>Seleccionar propiedades</button></section>;
  if (invalid) return <section className="panel empty"><h1>Falta un dato para tu ranking</h1><p>{invalid}</p><button className="primary" onClick={() => navigate('/preferencias')}>Completar preferencias</button></section>;
  const loading = state.key !== key;
  const data = state.key === key ? state.data : null;
  const props = Object.fromEntries(selectedItems.map(p => [p.id, p]));
  const ranked = (data?.ranking ?? []).map(item => withEstimate(props[item.property_id], item));
  const excluded = (data?.excluded_property_ids ?? []).map(id => props[id]).filter(Boolean);
  return <><Steps step={3} /><div className="page-heading"><div><h1>Tu ranking personalizado</h1><p className="muted">{prefs.origin.label} · {modeLabel(prefs.mode)} · {prefs.days} días / semana · {prefs.costWeight}% costo / {prefs.timeWeight}% tiempo</p></div><button className="outline" onClick={() => navigate('/preferencias')}>Editar preferencias</button></div>{loading && <p className="notice" role="status">Calculando tu ranking…</p>}{state.error && state.key === key && <div className="error" role="alert"><p>{state.error} Tu selección y tus preferencias se mantienen.</p><button className="text-button" onClick={() => setAttempt(a => a + 1)}>Reintentar</button></div>}{data?.routing_error && <p className="error" role="status">{data.routing_error}</p>}{data?.explanation && <section className="notice"><span className="eyebrow">TU MEJOR EQUILIBRIO</span><h2>{title(ranked[0])} · {ranked[0].address}</h2><p>{data.explanation}</p></section>}{excluded.length > 0 && <p className="error" role="status">Traslado no disponible para {excluded.map(p => p.address).join(', ')}. Se excluyen del ranking.</p>}<div className="rank-list">{ranked.map((p, i) => <article key={p.id} className={`panel rank-card ${i === 0 ? 'best' : ''}`}><span className="rank-number">{p.position}</span><PropertyVisual property={p} small /><div className="rank-description">{i === 0 && <span className="pill">★ Mejor opción para ti</span>}<h2>{title(p)}</h2><p className="muted">{p.location} · {p.beds || 'Estudio'}{p.beds ? ' dorm' : ''} · {p.area} m²</p></div><div className="rank-stats"><div className="cost"><small>Costo real mensual</small><strong>{money(p.total)}</strong></div><div><small>Traslado por viaje</small><strong>{p.minutes} min</strong></div><div><small>Puntaje relativo</small><strong>{p.score} / 100</strong><meter min="0" max="100" value={p.score} /></div></div><button className="outline" onClick={() => navigate(`/propiedad/${p.id}`)}>Ver desglose</button></article>)}</div><p className="fine">El puntaje normaliza costo real y tiempo entre las propiedades seleccionadas y los pondera según tu importancia. Los empates se resuelven por menor costo real. 100 representa el mejor resultado relativo; no evalúa la calidad del inmueble.</p>{ranked.length > 0 && <ShareBox key={key} ids={ids} prefs={prefs} />}<MapView properties={ranked} origin={prefs.origin} onDetail={id => navigate(`/propiedad/${id}`)} /></>;
}
