import { modes } from '../data/properties.js';

// El cálculo del costo real y el ranking ocurren en el backend. Aquí solo quedan formato y validaciones
// de formulario, que se repiten en el servidor (REQ-GEN-03).
export const money = value => new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0
}).format(value);

export const title = p => p.title || `${p.address}, ${p.beds ? `depto ${p.beds} dormitorio${p.beds > 1 ? 's' : ''}` : 'estudio'}`;

export const modeLabel = id => modes.find(m => m.id === id)?.label ?? id;

export function validatePreferences(p) {
  if (!p.origin || !Number.isFinite(p.origin.lat) || !Number.isFinite(p.origin.lng)) return 'Busca y selecciona la dirección donde trabajas o estudias.';
  if (!modes.some(m => m.id === p.mode)) return 'Selecciona un medio de transporte.';
  if (!Number.isInteger(p.days) || p.days < 1 || p.days > 7) return 'La frecuencia debe estar entre 1 y 7 días por semana.';
  if (p.costWeight % 10 || p.timeWeight % 10 || p.costWeight + p.timeWeight !== 100) return 'La importancia se indica en pasos de 10 y debe sumar 100.';
  return '';
}

export function validateFilters(f) {
  for (const k of ['min', 'max', 'beds', 'baths', 'area']) if (f[k] !== '' && (!Number.isFinite(Number(f[k])) || Number(f[k]) < 0)) return 'Los filtros deben ser números positivos o cero.';
  if (f.min !== '' && f.max !== '' && Number(f.min) > Number(f.max)) return 'El arriendo mínimo no puede superar al máximo.';
  return '';
}

// Convierte los filtros del formulario en parámetros de la API.
export const filtersToQuery = f => ({
  q: f.query.trim() || undefined,
  rent_min: f.min,
  rent_max: f.max,
  bedrooms: f.beds,
  bathrooms_min: f.baths,
  area_min: f.area,
  pets: f.pets,
  parking: f.parking
});
