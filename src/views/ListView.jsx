import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import PropertyCard from '../components/PropertyCard.jsx';
import { emptyFilters } from '../data/properties.js';
import { api } from '../api/client.js';
import { toProperty, withEstimate } from '../api/adapters.js';
import { useEstimates } from '../hooks/useEstimates.js';
import { filtersToQuery, modeLabel, validateFilters } from '../services/calculations.js';

const PAGE_SIZE = 8;

export default function ListView({
  prefs,
  selected,
  favorites,
  toggleCompare,
  toggleFavorite,
  navigate,
  remember,
  onlyFavorites = false
}) {
  const [draft, setDraft] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('relevant');
  const [advanced, setAdvanced] = useState(false);
  const [result, setResult] = useState({ key: '', items: [], total: 0, pages: 1, error: '' });
  const noFavorites = onlyFavorites && !favorites.length;
  const query = { ...filtersToQuery(filters), sort, page, page_size: PAGE_SIZE, ids: onlyFavorites ? favorites : undefined };
  const key = JSON.stringify(query);
  useEffect(() => {
    if (noFavorites) return;
    let alive = true;
    api.properties(JSON.parse(key)).then(data => {
      if (!alive) return;
      const items = data.items.map(toProperty);
      remember(items);
      setResult({ key, items, total: data.total, pages: data.pages, error: '' });
    }).catch(err => alive && setResult({ key, items: [], total: 0, pages: 1, error: err.message }));
    return () => {
      alive = false;
    };
  }, [key, noFavorites, remember]);
  const loading = !noFavorites && result.key !== key;
  const items = noFavorites ? [] : result.items;
  const estimates = useEstimates(items.map(p => p.id), prefs);
  const shown = items.map(p => withEstimate(p, estimates.byId[p.id]));
  const total = noFavorites ? 0 : result.total;
  const set = (k, value) => setDraft({ ...draft, [k]: value });
  const apply = e => {
    e.preventDefault();
    const message = validateFilters(draft);
    setError(message);
    if (!message) {
      setFilters(draft);
      setPage(1);
    }
  };
  const toggleQuick = k => {
    const next = { ...draft, [k]: !draft[k] };
    setDraft(next);
    if (!validateFilters(next)) {
      setFilters({ ...filters, [k]: next[k] });
      setPage(1);
    }
  };
  const reset = () => {
    setDraft(emptyFilters);
    setFilters(emptyFilters);
    setPage(1);
    setError('');
  };
  return <><p className="breadcrumb">Inicio › Arriendo › {filters.query || 'Región Metropolitana'}</p><div className="page-heading"><div><span className="eyebrow">ENCUENTRA TU EQUILIBRIO</span><h1>{onlyFavorites ? 'Tus propiedades favoritas' : 'Un hogar que calce con tu vida'}</h1><p className="muted">{loading ? 'Buscando propiedades…' : `${total} propiedades${filters.query ? ` para “${filters.query}”` : ''}`} · compara lo que realmente cuesta vivir aquí.</p></div><span className="heading-symbol">⌂</span></div><section className="notice preference-banner">{prefs.origin ? <div><span className="pill">● Costo real</span><strong>Calculado para {prefs.origin.label}</strong><p>{modeLabel(prefs.mode)} · {prefs.days} días / semana · {prefs.costWeight}% costo / {prefs.timeWeight}% tiempo · valores estimados</p></div> : <div><span className="pill">● Costo real</span><strong>¿Dónde trabajas o estudias?</strong><p>Indícalo para sumar transporte y tiempo de traslado al arriendo de cada propiedad.</p></div>}<button className="outline" onClick={() => navigate('/preferencias')}>{prefs.origin ? 'Editar preferencias' : 'Indicar mi destino'}</button></section><form className="search-panel" onSubmit={apply}><div className="search-row"><label className="query"><Search size={19} /><span className="sr-only">Comuna o dirección</span><input placeholder="Comuna o dirección, por ejemplo Ñuñoa" value={draft.query} onChange={e => set('query', e.target.value)} /></label><button type="button" className="outline" aria-expanded={advanced} onClick={() => setAdvanced(!advanced)}><SlidersHorizontal size={17} /> Filtros</button><button className="orange" type="submit">Buscar</button></div><fieldset className="quick-filters"><legend className="sr-only">Características</legend><label className="check"><input type="checkbox" checked={draft.pets} onChange={() => toggleQuick('pets')} /> Admite mascotas</label><label className="check"><input type="checkbox" checked={draft.parking} onChange={() => toggleQuick('parking')} /> Con estacionamiento</label></fieldset>{advanced && <div className="filters"><label>Arriendo mínimo<input type="number" min="0" step="10000" value={draft.min} onChange={e => set('min', e.target.value)} /></label><label>Arriendo máximo<input type="number" min="0" step="10000" value={draft.max} onChange={e => set('max', e.target.value)} /></label><label>Dormitorios<select value={draft.beds} onChange={e => set('beds', e.target.value)}><option value="">Todos</option>{[0, 1, 2, 3].map(n => <option key={n} value={n}>{n || 'Estudio'}</option>)}</select></label><label>Baños mínimos<select value={draft.baths} onChange={e => set('baths', e.target.value)}><option value="">Todos</option><option value="1">1</option><option value="2">2</option></select></label><label>Superficie mínima (m²)<input type="number" min="0" value={draft.area} onChange={e => set('area', e.target.value)} /></label></div>}{error && <p className="error" role="alert">{error}</p>}</form><div className="results-toolbar"><button className="text-button" onClick={reset}>Limpiar filtros</button><label>Ordenar por <select value={sort} onChange={e => {
          setSort(e.target.value);
          setPage(1);
        }}><option value="relevant">Más relevantes</option><option value="rent_asc">Menor arriendo</option><option value="rent_desc">Mayor arriendo</option><option value="area_desc">Mayor superficie</option></select></label></div>{result.error && !noFavorites && <p className="error" role="alert">{result.error}</p>}{estimates.error && <p className="error" role="status">{estimates.error}</p>}{estimates.routingError && <p className="error" role="status">{estimates.routingError}</p>}{shown.length ? <div className="property-grid">{shown.map(p => <PropertyCard key={p.id} property={p} hasOrigin={!!prefs.origin} selected={selected.includes(p.id)} favorite={favorites.includes(p.id)} onCompare={() => toggleCompare(p.id)} onFavorite={() => toggleFavorite(p.id)} onDetail={() => navigate(`/propiedad/${p.id}`)} />)}</div> : !loading && !result.error && <section className="panel empty"><h2>{onlyFavorites ? 'Aún no tienes favoritos' : 'No encontramos propiedades con esos filtros'}</h2><p>{onlyFavorites ? 'Marca el corazón de una propiedad para guardarla aquí.' : 'Prueba con otra comuna o amplía los filtros.'}</p><button className="outline" onClick={onlyFavorites ? () => navigate('/') : reset}>{onlyFavorites ? 'Explorar propiedades' : 'Limpiar filtros'}</button></section>}{result.pages > 1 && !noFavorites && <nav className="pagination" aria-label="Paginación"><button disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button><span>Página {page} de {result.pages}</span><button disabled={page >= result.pages} onClick={() => setPage(page + 1)}>Siguiente</button></nav>}<div className="comparison-dock"><div><strong>{selected.length} propiedades seleccionadas</strong><span>Selecciona al menos 2 para comparar</span></div><button className="primary" disabled={selected.length < 2} onClick={() => navigate('/preferencias')}>Tus preferencias <ArrowRight size={17} /></button></div></>;
}
