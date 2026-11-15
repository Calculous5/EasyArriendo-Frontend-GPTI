import test from 'node:test';
import assert from 'node:assert/strict';
import { properties, defaults, emptyFilters } from '../src/data/properties.js';
import { calculate, rankProperties, validatePreferences, validateFilters, filterProperties } from '../src/services/calculations.js';
test('el desglose suma exactamente los cuatro componentes', () => {
  for (const p of properties) {
    const c = calculate(p, defaults);
    if (c.available) assert.equal(c.total, c.rent + c.fees + c.transport + c.timeCost);
  }
  const c = calculate(properties[2], defaults);
  assert.equal(c.trips, 44);
  assert.equal(c.timeCost, 39600);
  assert.equal(c.transport, 52200);
  assert.equal(c.total, 501300);
});
test('frecuencia, transporte y destino cambian las estimaciones', () => {
  const p = properties[0];
  const base = calculate(p, defaults);
  assert.ok(calculate(p, {
    ...defaults,
    days: 3
  }).total < base.total);
  assert.equal(calculate(p, {
    ...defaults,
    mode: 'bike'
  }).transport, 0);
  assert.notEqual(calculate(p, {
    ...defaults,
    destination: 'centro'
  }).minutes, base.minutes);
});
test('cero días elimina traslado y tiempo; gastos no informados se señalan', () => {
  const c = calculate(properties[5], {
    ...defaults,
    days: 0
  });
  assert.equal(c.total, c.rent);
  assert.equal(c.minutes, 0);
  assert.equal(c.transport, 0);
  assert.equal(c.timeCost, 0);
  assert.equal(c.feesMissing, true);
});
test('fallo de ruta excluye solo la propiedad afectada', () => {
  const data = properties.map(p => calculate(p, defaults));
  assert.equal(data[7].available, false);
  assert.equal(rankProperties(data)(defaults).length, 7);
  assert.deepEqual(rankProperties([])(defaults), []);
});
test('ranking determinista, solo selección y ponderación efectiva', () => {
  const rows = [{
    id: 1,
    total: 400000,
    minutes: 50,
    available: true
  }, {
    id: 2,
    total: 600000,
    minutes: 10,
    available: true
  }];
  assert.equal(rankProperties(rows)({
    ...defaults,
    timeWeight: 0
  })[0].id, 1);
  assert.equal(rankProperties(rows)({
    ...defaults,
    timeWeight: 100
  })[0].id, 2);
  assert.deepEqual(rankProperties(rows)(defaults), rankProperties(rows)(defaults));
  const tied = [{
    id: 5,
    total: 100,
    minutes: 10,
    available: true
  }, {
    id: 2,
    total: 100,
    minutes: 10,
    available: true
  }];
  assert.equal(rankProperties(tied)(defaults)[0].id, 2);
});
test('filtros por comuna sin acentos, montos, atributos y favoritos', () => {
  assert.equal(filterProperties(properties, {
    ...emptyFilters,
    query: 'nunoa'
  }).length, 5);
  assert.equal(filterProperties(properties, {
    ...emptyFilters,
    beds: '2',
    baths: '2'
  })[0].id, 5);
  assert.equal(filterProperties(properties, {
    ...emptyFilters,
    favorites: true
  }, [3]).length, 1);
  assert.equal(filterProperties(properties, {
    ...emptyFilters,
    min: '9999999'
  }).length, 0);
  assert.ok(validateFilters({
    ...emptyFilters,
    min: '500',
    max: '100'
  }));
});
test('valida preferencias inválidas y rechaza cálculos con entradas erróneas', () => {
  for (const value of [{
    days: -1
  }, {
    days: 8
  }, {
    hourValue: -1
  }, {
    hourValue: ''
  }, {
    timeWeight: 101
  }, {
    destination: 'desconocido'
  }, {
    mode: 'avion'
  }]) {
    assert.ok(validatePreferences({
      ...defaults,
      ...value
    }));
    assert.throws(() => calculate(properties[0], {
      ...defaults,
      ...value
    }));
  }
});
