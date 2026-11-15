import { useState } from 'react';
import { Heart } from 'lucide-react';
import PropertyVisual from '../components/PropertyVisual.jsx';
import CostBreakdown from '../components/CostBreakdown.jsx';
import MockMap from '../components/MockMap.jsx';
import { money, title } from '../services/calculations.js';
export default function DetailView({
  property: p,
  prefs,
  selected,
  favorite,
  toggleCompare,
  toggleFavorite,
  navigate,
  onContact
}) {
  const [photo, setPhoto] = useState(0);
  if (!p) return <section className="panel empty"><h1>Propiedad no encontrada</h1><button className="primary" onClick={() => navigate('/')}>Volver al listado</button></section>;
  return <><button className="text-button back" onClick={() => navigate('/comparacion')}>← Volver a la comparación</button><span className="eyebrow">{p.location} · DEPARTAMENTO EN ARRIENDO</span><h1>{title(p)}</h1><p className="muted lead">Región Metropolitana · Publicación de demostración</p><div className="two-columns detail-columns"><div><section className="gallery"><PropertyVisual property={{
            ...p,
            tone: (p.tone + photo) % 4
          }} /><div className="gallery-controls">{['Living', 'Dormitorio', 'Entorno'].map((label, i) => <button key={label} aria-pressed={photo === i} className={photo === i ? 'active' : ''} onClick={() => setPhoto(i)}>{label}</button>)}</div><p className="fine">Ilustraciones de referencia. No son fotografías del inmueble.</p></section><div className="price-row"><section className="panel"><small>Arriendo publicado</small><strong>{money(p.rent)}</strong><p className="fine">Gastos comunes {p.feesMissing ? 'no informados' : money(p.fees)}</p></section><a className="cost" href="#desglose" onClick={e => {
            e.preventDefault();
            document.getElementById('desglose').scrollIntoView({
              behavior: 'smooth'
            });
          }}><small>Tu costo real mensual</small><strong>{p.available ? money(p.total) : 'No disponible'}</strong><span>Ver desglose ↓</span></a></div><section className="panel"><h2>Características destacadas</h2><dl className="features">{[['Dormitorios', p.beds || 'Estudio'], ['Baños', p.baths], ['Superficie', `${p.area} m²`], ['Piso', p.floor], ['Estacionamiento', p.parking], ['Bodega', 0]].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></section><MockMap properties={[p]} prefs={prefs} onDetail={() => {}} /></div><aside className="sidebar"><CostBreakdown property={p} prefs={prefs} /><button className="orange full" aria-pressed={selected} onClick={() => toggleCompare(p.id)}>{selected ? 'Quitar de la comparación' : 'Agregar a comparar'}</button><button className="outline full" aria-pressed={favorite} onClick={() => toggleFavorite(p.id)}><Heart size={17} />{favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}</button><section className="panel"><h2>¿Te interesa?</h2><p className="muted">Prueba el formulario de contacto. En esta demostración la consulta no se envía al publicador.</p><button className="primary full" onClick={() => onContact(p)}>Contactar al publicador</button></section></aside></div></>;
}
