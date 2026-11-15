import { useState } from 'react';
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import PropertyCard from '../components/PropertyCard.jsx';
import { emptyFilters, destinations, modes } from '../data/properties.js';
import { filterProperties, validateFilters } from '../services/calculations.js';
export default function ListView({
  items,
  selected,
  favorites,
  toggleCompare,
  toggleFavorite,
  navigate,
  prefs,
  onlyFavorites = false
}) {
  const [draft, setDraft] = useState({
    ...emptyFilters,
    favorites: onlyFavorites
  });
  const [filters, setFilters] = useState({
    ...emptyFilters,
    favorites: onlyFavorites
  });
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('relevant');
  const [advanced, setAdvanced] = useState(false);
  const set = (key, value) => setDraft({
    ...draft,
    [key]: value
  });
  const found = filterProperties(items, filters, favorites).sort((a, b) => sort === 'rent' ? a.rent - b.rent : sort === 'cost' ? (a.total ?? Infinity) - (b.total ?? Infinity) : a.id - b.id);
  const pages = Math.max(1, Math.ceil(found.length / 4));
  const current = Math.min(page, pages);
  const apply = e => {
    e.preventDefault();
    const message = validateFilters(draft);
    setError(message);
    if (!message) {
      setFilters(draft);
      setPage(1);
    }
  };
  const reset = () => {
    const f = {
      ...emptyFilters,
      favorites: onlyFavorites
    };
    setDraft(f);
    setFilters(f);
    setPage(1);
    setError('');
  };
  return <><p className="breadcrumb">Inicio › Arriendo › Región Metropolitana</p><div className="page-heading"><div><span className="eyebrow">ENCUENTRA TU EQUILIBRIO</span><h1>{onlyFavorites ? 'Tus propiedades favoritas' : 'Un hogar que calce con tu vida'}</h1><p className="muted">{found.length} propiedades{filters.query ? ` para “${filters.query}”` : ''} · compara lo que realmente cuesta vivir aquí.</p></div><span className="heading-symbol">⌂</span></div><section className="notice preference-banner"><div><span className="pill">● Costo real</span><strong>Calculado para {destinations.find(d => d.id === prefs.destination).label.split(' — ')[0]}</strong><p>{modes.find(m => m.id === prefs.mode).label} · {prefs.days} días / semana · {100 - prefs.timeWeight}% costo / {prefs.timeWeight}% tiempo · valores estimados</p></div><button className="outline" onClick={() => navigate('/preferencias')}>Editar preferencias</button></section><form className="search-panel" onSubmit={apply}><div className="search-row"><label className="query"><Search size={19} /><span className="sr-only">Comuna o dirección</span><input placeholder="Comuna o dirección, por ejemplo Ñuñoa" value={draft.query} onChange={e => set('query', e.target.value)} /></label><button type="button" className="outline" aria-expanded={advanced} onClick={() => setAdvanced(!advanced)}><SlidersHorizontal size={17} /> Filtros</button><button className="orange" type="submit">Buscar</button></div>{advanced && <div className="filters"><label>Arriendo mínimo<input type="number" min="0" value={draft.min} onChange={e => set('min', e.target.value)} /></label><label>Arriendo máximo<input type="number" min="0" value={draft.max} onChange={e => set('max', e.target.value)} /></label><label>Dormitorios<select value={draft.beds} onChange={e => set('beds', e.target.value)}><option value="">Todos</option>{[0, 1, 2, 3].map(n => <option key={n} value={n}>{n || 'Estudio'}</option>)}</select></label><label>Baños mínimos<select value={draft.baths} onChange={e => set('baths', e.target.value)}><option value="">Todos</option><option value="1">1</option><option value="2">2</option></select></label><label>Superficie mínima (m²)<input type="number" min="0" value={draft.area} onChange={e => set('area', e.target.value)} /></label></div>}{error && <p className="error" role="alert">{error}</p>}</form><div className="results-toolbar"><button className="text-button" onClick={reset}>Limpiar filtros</button><label>Ordenar por <select value={sort} onChange={e => setSort(e.target.value)}><option value="relevant">Más relevantes</option><option value="rent">Menor arriendo</option><option value="cost">Menor costo real</option></select></label></div>{found.length ? <div className="property-grid">{found.slice((current - 1) * 4, current * 4).map(p => <PropertyCard key={p.id} property={p} selected={selected.includes(p.id)} favorite={favorites.includes(p.id)} onCompare={() => toggleCompare(p.id)} onFavorite={() => toggleFavorite(p.id)} onDetail={() => navigate(`/propiedad/${p.id}`)} />)}</div> : <section className="panel empty"><h2>{onlyFavorites ? 'Aún no hay favoritos que coincidan' : 'No encontramos propiedades'}</h2><p>Prueba con otra comuna o amplía los filtros.</p><button className="outline" onClick={onlyFavorites ? () => navigate('/') : reset}>{onlyFavorites ? 'Explorar propiedades' : 'Limpiar filtros'}</button></section>}<nav className="pagination" aria-label="Paginación"><button disabled={current === 1} onClick={() => setPage(current - 1)}>Anterior</button><span>Página {current} de {pages}</span><button disabled={current === pages} onClick={() => setPage(current + 1)}>Siguiente</button></nav><div className="comparison-dock"><div><strong>{selected.length} propiedades seleccionadas</strong><span>Selecciona al menos 2 para comparar</span></div><button className="primary" disabled={selected.length < 2} onClick={() => navigate('/preferencias')}>Tus preferencias <ArrowRight size={17} /></button></div></>;
}
