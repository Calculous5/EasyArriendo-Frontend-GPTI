import { destinations, modes } from '../data/properties.js';
export const money = value => new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0
}).format(value);
export const title = p => `${p.address}, ${p.beds ? `depto ${p.beds} dormitorio${p.beds > 1 ? 's' : ''}` : 'estudio'}`;
export function validatePreferences(p) {
  if (!destinations.some(d => d.id === p.destination)) return 'Selecciona una dirección de la lista de destinos de demostración.';
  if (!modes.some(m => m.id === p.mode)) return 'Selecciona un medio de transporte.';
  if (!Number.isInteger(p.days) || p.days < 0 || p.days > 7) return 'La frecuencia debe estar entre 0 y 7 días.';
  if (!Number.isFinite(p.timeWeight) || p.timeWeight < 0 || p.timeWeight > 100) return 'La importancia debe estar entre 0 y 100.';
  if (!Number.isFinite(p.hourValue) || p.hourValue < 0 || p.hourValue > 100000) return 'El valor de tu hora debe estar entre $0 y $100.000.';
  return '';
}
export function calculate(p, prefs) {
  const error = validatePreferences(prefs);
  if (error) throw new Error(error);
  const trips = Math.round(prefs.days * 4.4 * 2);
  const fees = p.fees ?? 0;
  if (!p.times && trips > 0) return {
    ...p,
    fees,
    feesMissing: p.fees == null,
    available: false,
    trips
  };
  const destination = destinations.find(d => d.id === prefs.destination);
  // Fixtures deterministas; no representan rutas ni tarifas en tiempo real.
  const factor = prefs.destination === 'campus' ? 1 : destination.factor * (p.id % 2 ? 0.68 : 1.12);
  const minutes = trips === 0 ? 0 : Math.round(p.times[modes.findIndex(m => m.id === prefs.mode)] * factor);
  const distance = +(p.distance * factor).toFixed(1);
  const perTrip = prefs.mode === 'transit' ? 1186.36 : prefs.mode === 'car' ? distance * 180 + 1000 : 0;
  const transport = Math.round(perTrip * trips);
  const timeCost = Math.round(minutes / 60 * trips * prefs.hourValue);
  return {
    ...p,
    fees,
    feesMissing: p.fees == null,
    available: true,
    trips,
    minutes,
    distance,
    transport,
    timeCost,
    total: p.rent + fees + transport + timeCost
  };
}
export function rankProperties(items) {
  return prefs => {
    const valid = items.filter(p => p.available);
    if (!valid.length) return [];
    const costs = valid.map(p => p.total),
      times = valid.map(p => p.minutes);
    const normalize = (v, vs) => Math.max(...vs) === Math.min(...vs) ? 0 : (v - Math.min(...vs)) / (Math.max(...vs) - Math.min(...vs));
    return valid.map(p => ({
      ...p,
      score: Math.round(100 * (1 - ((1 - prefs.timeWeight / 100) * normalize(p.total, costs) + prefs.timeWeight / 100 * normalize(p.minutes, times))))
    })).sort((a, b) => b.score - a.score || a.total - b.total || a.id - b.id);
  };
}
export function validateFilters(f) {
  for (const k of ['min', 'max', 'beds', 'baths', 'area']) if (f[k] !== '' && (!Number.isFinite(Number(f[k])) || Number(f[k]) < 0)) return 'Los filtros deben ser números positivos o cero.';
  if (f.min !== '' && f.max !== '' && Number(f.min) > Number(f.max)) return 'El arriendo mínimo no puede superar al máximo.';
  return '';
}
const clean = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function filterProperties(items, f, favorites = []) {
  return items.filter(p => (!f.query || clean(`${p.address} ${p.location}`).includes(clean(f.query))) && (f.min === '' || p.rent >= +f.min) && (f.max === '' || p.rent <= +f.max) && (f.beds === '' || p.beds === +f.beds) && (f.baths === '' || p.baths >= +f.baths) && (f.area === '' || p.area >= +f.area) && (!f.favorites || favorites.includes(p.id)));
}
