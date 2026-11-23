import { useEffect, useState } from 'react';
import Steps from '../components/Steps.jsx';
import MapView from '../components/MapView.jsx';
import { api } from '../api/client.js';
import { withEstimate } from '../api/adapters.js';
import { defaults } from '../data/properties.js';
import { modeLabel, money, title, validatePreferences } from '../services/calculations.js';

const ROWS = [['Arriendo publicado', 'rent', true, false], ['Gastos comunes publicados', 'fees', true, false], ['Transporte', 'transport', true, true], ['Tiempo valorizado', 'timeCost', true, true], ['Costo real mensual', 'total', true, true], ['Minutos por viaje', 'minutes', false, true]];

// Comparación lado a lado (F-04). Disponible para visitantes; no guarda datos (RN-16).
export default function ComparisonView({ selectedItems, prefs, navigate, user, onLogin }) {
  const [state, setState] = useState({ key: '', data: null, error: '' });
  const [attempt, setAttempt] = useState(0);
  const ids = selectedItems.map(p => p.id);
  const invalid = validatePreferences(prefs);
  const key = JSON.stringify([ids, prefs]);
  const requestKey = `${key}#${attempt}`;
  useEffect(() => {
    if (ids.length < 2 || invalid) return;
    let alive = true;
    const [requestIds, requestPrefs] = JSON.parse(key);
    api.compare(requestIds, requestPrefs).then(data => alive && setState({ key, data, error: '' })).catch(err => alive && setState({ key, data: null, error: err.message }));
    // requestKey cambia al reintentar; key identifica la selección y las preferencias.
    return () => {
      alive = false;
    };
  }, [requestKey, key, ids.length, invalid]);
  if (ids.length < 2) return <section className="panel empty"><h1>Selecciona al menos dos propiedades</h1><p>Vuelve al listado para construir tu comparación.</p><button className="primary" onClick={() => navigate('/')}>Seleccionar propiedades</button></section>;
  if (invalid) return <section className="panel empty"><h1>Falta un dato para comparar</h1><p>{invalid}</p><button className="primary" onClick={() => navigate('/preferencias')}>Completar preferencias</button></section>;
  const loading = state.key !== key;
  const byId = Object.fromEntries((state.key === key && state.data?.items || []).map(i => [i.property_id, i]));
  const items = selectedItems.map(p => withEstimate(p, byId[p.id]));
  const best = items.find(p => p.id === state.data?.best_property_id && state.key === key);
  const unavailable = items.filter(p => !p.pending && !p.available);
  const usingDefaults = prefs.mode === defaults.mode && prefs.days === defaults.days && prefs.costWeight === defaults.costWeight;
  return <><Steps step={3} /><div className="page-heading"><div><h1>Tus propiedades, frente a frente</h1><p className="muted">{prefs.origin.label} · {modeLabel(prefs.mode)} · {prefs.days} días / semana · {prefs.costWeight}% costo / {prefs.timeWeight}% tiempo</p></div><button className="outline" onClick={() => navigate('/preferencias')}>Editar preferencias</button></div>{usingDefaults && <p className="fine">Usamos las preferencias por defecto: Metro / Bus, 5 días y 50% costo / 50% tiempo. Puedes cambiarlas en cualquier momento.</p>}{state.error && state.key === key && <div className="error" role="alert"><p>{state.error} Tu selección y tus preferencias se mantienen.</p><button className="text-button" onClick={() => setAttempt(a => a + 1)}>Reintentar</button></div>}{state.data?.routing_error && <p className="error" role="status">{state.data.routing_error}</p>}{loading && <p className="notice" role="status">Calculando traslados y costos…</p>}{best && <section className="notice"><span className="eyebrow">TU MEJOR EQUILIBRIO</span><h2>{title(best)} es la opción más conveniente</h2><p>{money(best.total)} mensuales estimados y {best.minutes} minutos por viaje, según tu importancia de costo y tiempo.</p></section>}{unavailable.length > 0 && <p className="error" role="status">Traslado no disponible para {unavailable.map(p => p.address).join(', ')}.</p>}<div className="table-wrap panel"><table><caption>Comparación de costos mensuales y traslados</caption><thead><tr><th>Propiedad</th>{items.map(p => <th key={p.id} className={best?.id === p.id ? 'best-col' : ''}><button className="text-button" onClick={() => navigate(`/propiedad/${p.id}`)}>{p.address}</button><small>{p.location}</small></th>)}</tr></thead><tbody>{ROWS.map(([label, k, currency, estimated]) => <tr key={k}><th>{label} {estimated && <small className="estimated">Estimado</small>}</th>{items.map(p => <td key={p.id} className={best?.id === p.id ? 'best-col' : ''}>{p.pending && estimated ? '…' : p[k] == null ? 'No disponible' : currency ? money(p[k]) : `${p[k]} min`}{k === 'fees' && p.feesMissing && <small>No informados · se usa $0</small>}</td>)}</tr>)}</tbody></table></div><button className="primary" onClick={() => user ? navigate('/ranking') : onLogin('/ranking')}>{user ? 'Ver mi ranking personalizado' : 'Regístrate para ver tu ranking personalizado'}</button><MapView properties={items} origin={prefs.origin} onDetail={id => navigate(`/propiedad/${id}`)} /></>;
}
