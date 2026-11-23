import { useEffect, useState } from 'react';
import PropertyVisual from '../components/PropertyVisual.jsx';
import { api } from '../api/client.js';
import { modeLabel, money } from '../services/calculations.js';

// Vista pública de un ranking compartido (SC-02): orden y costo total, sin desglose ni ubicación.
export default function SharedRankingView({ id, navigate }) {
  const [state, setState] = useState({ id: '', data: null, error: '' });
  useEffect(() => {
    let alive = true;
    api.shared(id).then(data => alive && setState({ id, data, error: '' })).catch(err => alive && setState({ id, data: null, error: err.message }));
    return () => {
      alive = false;
    };
  }, [id]);
  if (state.id !== id) return <p className="notice" role="status">Cargando ranking compartido…</p>;
  if (state.error) return <section className="panel empty"><h1>No pudimos abrir este ranking</h1><p>{state.error}</p><button className="primary" onClick={() => navigate('/')}>Buscar propiedades</button></section>;
  const { data } = state;
  return <><span className="eyebrow">RANKING COMPARTIDO</span><h1>Un ranking de arriendos para revisar juntos</h1><p className="muted">Ordenado con {data.cost_weight}% costo / {data.time_weight}% tiempo · {modeLabel(data.mode)} · {data.days} días / semana. Costos calculados para el destino de quien lo compartió.</p><div className="rank-list">{data.items.map(item => {
        const p = { id: item.property.id, address: item.property.address, location: item.property.comuna, imageUrl: item.property.image_url, tone: item.property.id % 4 };
        return <article key={item.position} className={`panel rank-card ${item.position === 1 ? 'best' : ''}`}><span className="rank-number">{item.position}</span><PropertyVisual property={p} small /><div className="rank-description">{item.position === 1 && <span className="pill">★ Primera opción</span>}<h2>{item.property.title}</h2><p className="muted">{item.property.address}, {item.property.comuna} · {item.property.bedrooms || 'Estudio'}{item.property.bedrooms ? ' dorm' : ''} · {item.property.area_m2} m²</p></div><div className="rank-stats"><div className="cost"><small>Costo real mensual estimado</small><strong>{money(item.total_clp)}</strong></div></div>{item.property.listing_url ? <a className="outline" href={item.property.listing_url} target="_blank" rel="noopener noreferrer">Ver publicación</a> : <button className="outline" onClick={() => navigate(`/propiedad/${item.property.id}`)}>Ver propiedad</button>}</article>;
      })}</div><section className="notice"><h2>¿Quieres saber cuánto te costaría a ti?</h2><p>El costo real depende de dónde trabajas o estudias y cómo te mueves. Calcula el tuyo gratis.</p><button className="primary" onClick={() => navigate('/')}>Calcular mi costo real</button></section><p className="fine">Enlace válido hasta {new Date(data.expires_at).toLocaleDateString('es-CL')}.</p></>;
}
