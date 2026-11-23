import { Heart, Check, ArrowUpRight } from 'lucide-react';
import PropertyVisual from './PropertyVisual.jsx';
import { money, title } from '../services/calculations.js';

export function Amenities({ property: p }) {
  if (!p.petsAllowed && !p.hasParking) return null;
  return <p className="amenities">{p.petsAllowed && <span>Admite mascotas</span>}{p.hasParking && <span>Estacionamiento</span>}</p>;
}

export default function PropertyCard({
  property: p,
  hasOrigin,
  selected,
  favorite,
  onCompare,
  onFavorite,
  onDetail
}) {
  const cost = !hasOrigin ? ['Indica tu destino', 'para calcular transporte y tiempo'] : p.pending ? ['Calculando…', 'Consultando el traslado'] : p.available ? [money(p.total), `${p.minutes} min por viaje al destino`] : ['Traslado no disponible', 'Consulta los datos de la publicación'];
  return <article className="property-card"><div className="card-image"><PropertyVisual property={p} /><button className={`compare-toggle ${selected ? 'selected' : ''}`} aria-pressed={selected} onClick={onCompare}>{selected && <Check size={14} />} {selected ? 'Comparando' : 'Comparar'}</button><button className={`favorite ${favorite ? 'saved' : ''}`} aria-label={`${favorite ? 'Quitar de' : 'Agregar a'} favoritos ${p.address}`} aria-pressed={favorite} onClick={onFavorite}><Heart size={18} fill={favorite ? 'currentColor' : 'none'} /></button></div><div className="card-content"><span className="eyebrow">{p.location} · Departamento</span><h2><button onClick={onDetail}>{title(p)}</button></h2><p className="muted specs">{p.beds || 'Estudio'}{p.beds ? ' dorm' : ''} · {p.baths} baño{p.baths > 1 ? 's' : ''} · {p.area} m²</p><p className="published">Arriendo <strong>{money(p.rent)}</strong></p><p className="fine">Gastos comunes: {p.feesMissing ? 'no informados' : money(p.fees)}</p><Amenities property={p} /><div className="cost"><small>Costo real mensual estimado</small><strong>{cost[0]}</strong><span>{cost[1]}</span></div><button className="detail-link" onClick={onDetail}>Ver propiedad <ArrowUpRight size={15} /></button></div></article>;
}
