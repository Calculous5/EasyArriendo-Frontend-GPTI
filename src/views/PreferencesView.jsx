import { useState } from 'react';
import { Bus, Car, Bike, Footprints, X } from 'lucide-react';
import Steps from '../components/Steps.jsx';
import PropertyVisual from '../components/PropertyVisual.jsx';
import { destinations, modes, defaults } from '../data/properties.js';
import { money, validatePreferences } from '../services/calculations.js';
const icons = {
  Bus,
  Car,
  Bike,
  Footprints
};
export default function PreferencesView({
  prefs,
  setPrefs,
  selectedItems,
  toggleCompare,
  navigate,
  user,
  onLogin
}) {
  const [error, setError] = useState('');
  const set = (key, value) => setPrefs({
    ...prefs,
    [key]: value
  });
  const submit = e => {
    e.preventDefault();
    const msg = validatePreferences(prefs);
    setError(msg);
    if (!msg && selectedItems.length >= 2) navigate('/comparacion');
  };
  return <><Steps step={2} /><h1>Cuéntanos cómo es tu día a día</h1><p className="muted lead">Con esto calculamos el costo real de cada propiedad y encontramos tu mejor opción.</p><div className="two-columns"><form className="panel preferences" onSubmit={submit}><label>¿Dónde trabajas o estudias?<span className="hint">Elige un destino de demostración. La búsqueda de direcciones reales se conectará al backend.</span><select value={prefs.destination} onChange={e => set('destination', e.target.value)}>{destinations.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}</select></label><fieldset><legend>¿Cómo te mueves?</legend><div className="transport-options">{modes.map(m => {
              const Icon = icons[m.icon];
              return <button type="button" key={m.id} aria-pressed={prefs.mode === m.id} className={prefs.mode === m.id ? 'active' : ''} onClick={() => set('mode', m.id)}><Icon size={27} />{m.label}</button>;
            })}</div></fieldset><fieldset><legend>¿Cuántos días viajas a la semana?</legend><div className="stepper"><button type="button" aria-label="Disminuir días" disabled={prefs.days === 0} onClick={() => set('days', prefs.days - 1)}>−</button><output>{prefs.days} días</output><button type="button" aria-label="Aumentar días" disabled={prefs.days === 7} onClick={() => set('days', prefs.days + 1)}>+</button></div></fieldset><label>¿Qué te importa más?<span className="hint">Ponderamos el costo real y el tiempo de traslado para ordenar tus opciones.</span><span className="range-labels"><span>Ahorrar dinero</span><span>Ahorrar tiempo</span></span><input aria-label="Importancia del tiempo" type="range" min="0" max="100" value={prefs.timeWeight} onChange={e => set('timeWeight', +e.target.value)} /><output className="weight">{100 - prefs.timeWeight}% costo · {prefs.timeWeight}% tiempo</output></label><label>¿Cuánto vale una hora de tu tiempo?<span className="hint">Se usa para valorizar el tiempo mensual de traslado, en pesos chilenos.</span><input type="number" min="0" max="100000" required value={prefs.hourValue} onChange={e => set('hourValue', e.target.value === '' ? '' : +e.target.value)} /></label><p className="fine">Valores iniciales: Metro / Bus, 5 días, 60% costo / 40% tiempo y $3.000 por hora. Mes de 4,4 semanas, ida y vuelta.</p>{error && <p className="error" role="alert">{error}</p>}{selectedItems.length < 2 && <p className="error">Agrega al menos dos propiedades para continuar.</p>}<button className="primary full" disabled={selectedItems.length < 2}>Comparar mis propiedades</button><button type="button" className="text-button" onClick={() => setPrefs({
          ...defaults
        })}>Restablecer preferencias</button></form><aside className="sidebar"><section className="panel"><h2>Propiedades a comparar ({selectedItems.length})</h2>{selectedItems.map(p => <div className="selected-row" key={p.id}><PropertyVisual property={p} small /><div><strong>{p.address}</strong><p className="fine">Arriendo {money(p.rent)} · GC {p.feesMissing ? 'no informados' : money(p.fees)}</p></div><button aria-label={`Quitar ${p.address}`} onClick={() => toggleCompare(p.id)}><X size={17} /></button></div>)}<button className="text-button" onClick={() => navigate('/')}>+ Agregar otra propiedad</button></section><section className="notice"><h2>¿Cómo calculamos el costo real?</h2><p>Arriendo<br />+ Gastos comunes<br />+ Transporte mensual<br />+ Valor de tu tiempo de traslado</p><strong>= Costo real mensual</strong><p className="fine">Datos de demostración. Las rutas y tarifas no son información en tiempo real.</p></section><section className="panel"><h2>Tu perfil de preferencias</h2><p className="muted">{user ? 'Tus preferencias se guardan en este navegador.' : 'Como visitante, tus preferencias duran esta sesión de navegación.'}</p><button className="outline" onClick={() => user ? navigate('/perfil') : onLogin()}>{user ? 'Ver mi perfil' : 'Usar cuenta de demostración'}</button></section></aside></div></>;
}
