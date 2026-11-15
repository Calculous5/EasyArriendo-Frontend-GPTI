import { destinations } from '../data/properties.js';
export default function MockMap({
  properties,
  prefs,
  onDetail
}) {
  const dest = destinations.find(d => d.id === prefs.destination);
  return <section className="panel"><h2>Tu próximo hogar, en contexto</h2><p className="muted">Esquema de ubicación · sin rutas reales ni escala geográfica</p><div className="mock-map" aria-label="Esquema de propiedades y destino"><div className="park park-one" /><div className="park park-two" /><span className="map-label">ÑUÑOA</span><span className="map-label macul">MACUL</span>{properties.map((p, i) => <button key={p.id} className="map-pin" style={{
        left: `${p.point[0]}%`,
        top: `${p.point[1]}%`
      }} onClick={() => onDetail(p.id)} aria-label={`Ver ${p.address}`}>{i + 1}</button>)}<span className="destination-pin" style={{
        left: `${dest.point[0]}%`,
        top: `${dest.point[1]}%`
      }} title={dest.label}>★</span></div><p className="fine">★ Destino: {dest.label}. Los números siguen el orden de la comparación.</p></section>;
}
