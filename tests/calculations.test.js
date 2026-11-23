import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, emptyFilters } from '../src/data/properties.js';
import { filtersToQuery, money, title, validateFilters, validatePreferences } from '../src/services/calculations.js';
import { toProperty, withEstimate } from '../src/api/adapters.js';

const origin = { lat: -33.4986, lng: -70.6116, label: 'Campus San Joaquín' };

test('las preferencias exigen destino, días entre 1 y 7 e importancia en pasos de 10 (RN-25)', () => {
  assert.match(validatePreferences(defaults), /dirección/);
  assert.equal(validatePreferences({ ...defaults, origin }), '');
  assert.match(validatePreferences({ ...defaults, origin, days: 0 }), /1 y 7/);
  assert.match(validatePreferences({ ...defaults, origin, days: 8 }), /1 y 7/);
  assert.match(validatePreferences({ ...defaults, origin, costWeight: 55, timeWeight: 45 }), /pasos de 10/);
  assert.match(validatePreferences({ ...defaults, origin, costWeight: 60, timeWeight: 30 }), /sumar 100/);
  assert.match(validatePreferences({ ...defaults, origin, mode: 'avion' }), /transporte/);
});

test('los valores por defecto son 50/50, transporte público y 5 días', () => {
  assert.deepEqual({ ...defaults, origin: undefined }, { origin: undefined, mode: 'transit', days: 5, costWeight: 50, timeWeight: 50 });
});

test('filtros inválidos muestran mensajes claros', () => {
  assert.equal(validateFilters(emptyFilters), '');
  assert.match(validateFilters({ ...emptyFilters, min: '-1' }), /positivos/);
  assert.match(validateFilters({ ...emptyFilters, min: '500000', max: '100000' }), /mínimo/);
});

test('los filtros se traducen a la API, incluidos mascotas y estacionamiento (SC-01)', () => {
  const query = filtersToQuery({ ...emptyFilters, query: ' Ñuñoa ', min: '300000', beds: '2', pets: true, parking: false });
  assert.equal(query.q, 'Ñuñoa');
  assert.equal(query.rent_min, '300000');
  assert.equal(query.bedrooms, '2');
  assert.equal(query.pets, true);
  assert.equal(query.parking, false);
  assert.equal(filtersToQuery(emptyFilters).q, undefined);
});

test('el adaptador combina propiedad y estimación sin perder datos', () => {
  const p = toProperty({ id: 7, title: 'Depto', address: 'Lira 350', comuna: 'Santiago', lat: -33.4, lng: -70.6, rent_clp: 300000, common_expenses_clp: null, fees_missing: true, bedrooms: 0, bathrooms: 1, area_m2: 26, floor: 15, pets_allowed: null, has_parking: false, listing_url: null, image_url: null, source: 'demo', updated_at: '2026-11-22T00:00:00Z' });
  assert.equal(p.fees, 0);
  assert.equal(p.feesMissing, true);
  assert.equal(p.location, 'Santiago');
  assert.equal(withEstimate(p, undefined).pending, true);
  const merged = withEstimate(p, { route_available: true, distance_km: 5.2, minutes: 30, transport_clp: 35800, time_value_clp: 60000, total_clp: 395800, estimated: ['minutes'] });
  assert.equal(merged.total, 395800);
  assert.equal(merged.total, merged.rent + merged.fees + merged.transport + merged.timeCost);
  assert.equal(withEstimate(p, { route_available: false }).available, false);
});

test('formato de montos en pesos chilenos y títulos', () => {
  assert.equal(money(501300).replace(/\s/g, ' '), '$501.300');
  assert.equal(title({ address: 'Lira 350', beds: 0 }), 'Lira 350, estudio');
  assert.equal(title({ title: 'Estudio en Santiago', address: 'Lira 350', beds: 0 }), 'Estudio en Santiago');
});
