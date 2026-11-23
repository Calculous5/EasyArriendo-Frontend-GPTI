import { Heart, ExternalLink } from 'lucide-react';
import PropertyVisual from '../components/PropertyVisual.jsx';
import CostBreakdown from '../components/CostBreakdown.jsx';
import MapView from '../components/MapView.jsx';
import { withEstimate } from '../api/adapters.js';
import { useEstimates } from '../hooks/useEstimates.js';
import { money, title } from '../services/calculations.js';

const yesNo = value => value == null ? 'Sin información' : value ? 'Sí' : 'No';

// Detalle de propiedad con desglose del costo real (REQ-F01-06, REQ-IU-04).
export default function DetailView({
  property,
  missing,
  prefs,
  rates,
  selected,
  favorite,
  hasComparison,
  toggleCompare,
  toggleFavorite,
  navigate
}) {
  const estimates = useEstimates(property ? [property.id] : [], prefs);
  if (missing) return <section className="panel empty"><h1>Propiedad no encontrada</h1><p>{missing}</p><button className="primary" onClick={() => navigate('/')}>Volver al listado</button></section>;
  if (!property) return <p className="notice" role="status">Cargando propiedad…</p>;
  const p = withEstimate(property, estimates.byId[property.id]);
  return <><button className="text-button back" onClick={() => navigate(hasComparison ? '/comparacion' : '/')}>← {hasComparison ? 'Volver a la comparación' : 'Volver al listado'}</button><p className="breadcrumb">Inicio › Arriendo › {p.location}</p><span className="eyebrow">{p.location} · DEPARTAMENTO EN ARRIENDO</span><h1>{title(p)}</h1><p className="muted lead">{p.address}, {p.location} · Región Metropolitana</p><div className="two-columns detail-columns"><div><section className="gallery"><PropertyVisual property={p} />{!p.imageUrl && <p className="fine">Ilustración de referencia. No es una fotografía del inmueble.</p>}</section><div className="price-row"><section className="panel"><small>Arriendo publicado</small><strong>{money(p.rent)}</strong><p className="fine">Gastos comunes {p.feesMissing ? 'no informados' : money(p.fees)}</p></section><a className="cost" href="#desglose" onClick={e => {
            e.preventDefault();
            document.getElementById('desglose').scrollIntoView({ behavior: 'smooth' });
          }}><small>Tu costo real mensual</small><strong>{!prefs.origin ? 'Indica tu destino' : p.pending ? 'Calculando…' : p.available ? money(p.total) : 'No disponible'}</strong><span>Ver desglose ↓</span></a></div>{estimates.routingError && <p className="error" role="status">{estimates.routingError}</p>}<section className="panel"><h2>Características destacadas</h2><dl className="features">{[['Dormitorios', p.beds || 'Estudio'], ['Baños', p.baths], ['Superficie', `${p.area} m²`], ['Piso', p.floor ?? 'Sin información'], ['Admite mascotas', yesNo(p.petsAllowed)], ['Estacionamiento', yesNo(p.hasParking)]].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></section><MapView properties={[p]} origin={prefs.origin} onDetail={() => {}} title="Ubicación y destino habitual" /></div><aside className="sidebar"><CostBreakdown property={p} prefs={prefs} rates={rates} /><button className="orange full" aria-pressed={selected} onClick={() => toggleCompare(p.id)}>{selected ? 'Quitar de la comparación' : 'Agregar a comparar'}</button><button className="outline full" aria-pressed={favorite} onClick={() => toggleFavorite(p.id)}><Heart size={17} />{favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}</button><section className="panel"><h2>¿Te interesa?</h2>{p.listingUrl ? <><p className="muted">Revisa la publicación original para contactar al publicador.</p><a className="primary full" href={p.listingUrl} target="_blank" rel="noopener noreferrer">Ver publicación <ExternalLink size={15} /></a></> : <p className="muted">Esta propiedad es parte de la muestra de demostración y no tiene publicación original.</p>}</section></aside></div></>;
}
