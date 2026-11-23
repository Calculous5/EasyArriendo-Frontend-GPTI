import { useEffect, useState } from 'react';
import { Bus, Car, Bike, Footprints, X, MapPin } from 'lucide-react';
import Steps from '../components/Steps.jsx';
import PropertyVisual from '../components/PropertyVisual.jsx';
import { modes, defaults } from '../data/properties.js';
import { api } from '../api/client.js';
import { money, validatePreferences } from '../services/calculations.js';

const icons = { Bus, Car, Bike, Footprints };

// Búsqueda de la ubicación habitual por dirección escrita (REQ-F02-01, REQ-F02-02).
function AddressSearch({ origin, onSelect }) {
  const [text, setText] = useState(origin?.label ?? '');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('');
  const query = text.trim();
  const searching = query.length >= 4 && query !== origin?.label;
  useEffect(() => {
    if (!searching) return;
    let alive = true;
    const id = setTimeout(() => {
      setStatus('Buscando…');
      api.geocode(query).then(found => {
        if (!alive) return;
        setResults(found);
        setStatus(found.length ? '' : 'No encontramos esa dirección. Revisa que esté bien escrita e incluye la comuna.');
      }).catch(err => alive && setStatus(err.message));
    }, 450);
    return () => {
      alive = false;
      clearTimeout(id);
    };
  }, [query, searching]);
  return <div className="address-search"><input id="origin" autoComplete="off" placeholder="Ej: Av. Vicuña Mackenna 4860, Macul" value={text} onChange={e => {
      setText(e.target.value);
      setResults([]);
      setStatus('');
    }} aria-describedby="origin-status" />{searching && results.length > 0 && <ul className="suggestions" role="listbox">{results.map(r => <li key={`${r.lat},${r.lng}`}><button type="button" onClick={() => {
          onSelect(r);
          setText(r.label);
          setResults([]);
        }}><MapPin size={15} /> {r.label}</button></li>)}</ul>}<span id="origin-status" className={status && status !== 'Buscando…' ? 'field-error' : 'hint'} role="status">{searching ? status : origin ? `✓ ${origin.label}` : ''}</span></div>;
}

export default function PreferencesView({
  prefs,
  setPrefs,
  rates,
  selectedItems,
  toggleCompare,
  navigate,
  user,
  onLogin,
  onSaveProfile
}) {
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const set = (key, value) => {
    setSaved('');
    setPrefs({ ...prefs, [key]: value });
  };
  const submit = e => {
    e.preventDefault();
    const msg = validatePreferences(prefs);
    setError(msg);
    if (!msg && selectedItems.length >= 2) navigate('/comparacion');
  };
  const saveProfile = async () => {
    const msg = validatePreferences(prefs);
    setError(msg);
    if (msg) return;
    try {
      await onSaveProfile(prefs);
      setSaved('Preferencias guardadas en tu perfil.');
    } catch (err) {
      setError(err.message);
    }
  };
  return <><Steps step={2} /><h1>Cuéntanos cómo es tu día a día</h1><p className="muted lead">Con esto calculamos el costo real de cada propiedad y encontramos tu mejor opción.</p><div className="two-columns"><form className="panel preferences" onSubmit={submit} noValidate><label htmlFor="origin">¿Dónde trabajas o estudias?<span className="hint">Escribe la dirección y elige una de las sugerencias.</span></label><AddressSearch key={prefs.origin?.label ?? 'sin-destino'} origin={prefs.origin} onSelect={r => set('origin', r)} /><fieldset><legend>¿Cómo te mueves?</legend><div className="transport-options">{modes.map(m => {
              const Icon = icons[m.icon];
              return <button type="button" key={m.id} aria-pressed={prefs.mode === m.id} className={prefs.mode === m.id ? 'active' : ''} onClick={() => set('mode', m.id)}><Icon size={27} />{m.label}</button>;
            })}</div>{prefs.mode === 'transit' && <p className="fine">El tiempo en transporte público se estima a partir del tiempo en auto más espera.</p>}</fieldset><fieldset><legend>¿Cuántos días viajas a la semana?</legend><div className="stepper"><button type="button" aria-label="Disminuir días" disabled={prefs.days <= 1} onClick={() => set('days', prefs.days - 1)}>−</button><output>{prefs.days} días</output><button type="button" aria-label="Aumentar días" disabled={prefs.days >= 7} onClick={() => set('days', prefs.days + 1)}>+</button></div></fieldset><label>¿Qué te importa más?<span className="hint">Ponderamos el costo real y el tiempo de traslado para ordenar tus opciones.</span><span className="range-labels"><span>Ahorrar dinero</span><span>Ahorrar tiempo</span></span><input aria-label="Importancia del tiempo" type="range" min="0" max="100" step="10" value={prefs.timeWeight} onChange={e => {
              const time = +e.target.value;
              setSaved('');
              setPrefs({ ...prefs, timeWeight: time, costWeight: 100 - time });
            }} /><output className="weight">{prefs.costWeight}% costo · {prefs.timeWeight}% tiempo</output></label><p className="fine">Valores por defecto: Metro / Bus, 5 días y 50% costo / 50% tiempo. Tarifas vigentes: Metro {money(rates?.metro_fare ?? 895)} por viaje, auto {money(rates?.car_cost_per_km ?? 110)} por km, una hora de traslado vale {money(rates?.hour_value ?? 3000)}. Mes de {rates?.weeks_per_month ?? 4} semanas, ida y vuelta.</p>{error && <p className="error" role="alert">{error}</p>}{saved && <p className="notice" role="status">{saved}</p>}{selectedItems.length < 2 && <p className="error">Agrega al menos dos propiedades para continuar.</p>}<button className="primary full" disabled={selectedItems.length < 2}>Comparar mis propiedades</button><button type="button" className="text-button" onClick={() => setPrefs({ ...defaults })}>Restablecer preferencias</button></form><aside className="sidebar"><section className="panel"><h2>Propiedades a comparar ({selectedItems.length})</h2>{selectedItems.map(p => <div className="selected-row" key={p.id}><PropertyVisual property={p} small /><div><strong>{p.address}</strong><p className="fine">Arriendo {money(p.rent)} · GC {p.feesMissing ? 'no informados' : money(p.fees)}</p></div><button aria-label={`Quitar ${p.address}`} onClick={() => toggleCompare(p.id)}><X size={17} /></button></div>)}<button className="text-button" onClick={() => navigate('/')}>+ Agregar otra propiedad</button></section><section className="notice"><h2>¿Cómo calculamos el costo real?</h2><p>Arriendo<br />+ Gastos comunes<br />+ Transporte mensual<br />+ Valor de tu tiempo de traslado</p><strong>= Costo real mensual</strong><p className="fine">Distancias y tiempos se calculan con el servicio de rutas. Son estimaciones.</p></section><section className="panel"><h2>Tu perfil de preferencias</h2>{user ? <><p className="muted">Guarda estas preferencias para usarlas en tus próximas búsquedas.</p><button className="outline" type="button" onClick={saveProfile}>Guardar en mi perfil</button></> : <><p className="muted">Como visitante, tus preferencias duran solo esta sesión y no se guardan.</p><button className="outline" onClick={() => onLogin('/preferencias')}>Crear cuenta o iniciar sesión</button></>}</section></aside></div></>;
}
