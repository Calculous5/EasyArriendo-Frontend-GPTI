import { useEffect, useRef } from 'react';

const TOKEN = import.meta.env?.VITE_MAPBOX_PUBLIC_TOKEN;

// Mapa de propiedades y destino habitual (REQ-F04-06). Con token público usa Mapbox GL; sin token
// (desarrollo local) dibuja un esquema proporcional a las coordenadas.
export default function MapView({ properties, origin, onDetail, title = 'Tu próximo hogar, en contexto' }) {
  const points = properties.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  return <section className="panel"><h2>{title}</h2>{TOKEN ? <MapboxMap points={points} origin={origin} onDetail={onDetail} /> : <SchematicMap points={points} origin={origin} onDetail={onDetail} />}<p className="fine">{origin ? <>★ Destino habitual: {origin.label}. </> : <>Indica tu destino habitual para verlo en el mapa. </>}Los números siguen el orden de la lista.</p></section>;
}

function MapboxMap({ points, origin, onDetail }) {
  const container = useRef(null);
  const detail = useRef(onDetail);
  useEffect(() => {
    detail.current = onDetail;
  });
  const key = JSON.stringify([points.map(p => [p.id, p.lat, p.lng]), origin && [origin.lat, origin.lng]]);
  useEffect(() => {
    let map;
    let cancelled = false;
    (async () => {
      const [{ default: mapboxgl }] = await Promise.all([import('mapbox-gl'), import('mapbox-gl/dist/mapbox-gl.css')]);
      if (cancelled || !container.current) return;
      mapboxgl.accessToken = TOKEN;
      map = new mapboxgl.Map({ container: container.current, style: 'mapbox://styles/mapbox/streets-v12', center: [-70.62, -33.46], zoom: 11, cooperativeGestures: true });
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
      const bounds = new mapboxgl.LngLatBounds();
      points.forEach((p, i) => {
        const el = document.createElement('button');
        el.className = 'gl-pin';
        el.textContent = String(i + 1);
        el.setAttribute('aria-label', `Ver ${p.address}`);
        el.addEventListener('click', () => detail.current(p.id));
        new mapboxgl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
        bounds.extend([p.lng, p.lat]);
      });
      if (origin) {
        const el = document.createElement('span');
        el.className = 'gl-pin destination';
        el.textContent = '★';
        el.title = origin.label;
        new mapboxgl.Marker({ element: el }).setLngLat([origin.lng, origin.lat]).addTo(map);
        bounds.extend([origin.lng, origin.lat]);
      }
      if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 50, maxZoom: 14, duration: 0 });
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return <div ref={container} className="gl-map" aria-label="Mapa de propiedades y destino habitual" />;
}

function SchematicMap({ points, origin, onDetail }) {
  const all = [...points, ...(origin ? [origin] : [])];
  if (!all.length) return <div className="mock-map" />;
  const lats = all.map(p => p.lat), lngs = all.map(p => p.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const x = lng => maxLng === minLng ? 50 : 8 + (lng - minLng) / (maxLng - minLng) * 84;
  const y = lat => maxLat === minLat ? 50 : 8 + (maxLat - lat) / (maxLat - minLat) * 84;
  return <div className="mock-map" aria-label="Esquema de propiedades y destino"><div className="park park-one" /><div className="park park-two" />{points.map((p, i) => <button key={p.id} className="map-pin" style={{ left: `${x(p.lng)}%`, top: `${y(p.lat)}%` }} onClick={() => onDetail(p.id)} aria-label={`Ver ${p.address}`}>{i + 1}</button>)}{origin && <span className="destination-pin" style={{ left: `${x(origin.lng)}%`, top: `${y(origin.lat)}%` }} title={origin.label}>★</span>}</div>;
}
