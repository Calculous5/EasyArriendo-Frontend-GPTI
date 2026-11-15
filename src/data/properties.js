export const properties = [{
  id: 1,
  address: 'Zañartu 1315',
  location: 'Ñuñoa',
  beds: 1,
  baths: 1,
  area: 42,
  rent: 351700,
  fees: 65000,
  floor: 7,
  parking: 0,
  distance: 8.2,
  times: [32, 22, 31, 98],
  point: [42, 34],
  tone: 0
}, {
  id: 2,
  address: 'Irarrázaval 2401',
  location: 'Ñuñoa',
  beds: 2,
  baths: 1,
  area: 58,
  rent: 521200,
  fees: 85000,
  floor: 5,
  parking: 1,
  distance: 7.1,
  times: [25, 20, 27, 85],
  point: [61, 24],
  tone: 1
}, {
  id: 3,
  address: 'Vicuña Mackenna 1432',
  location: 'Ñuñoa',
  beds: 1,
  baths: 1,
  area: 38,
  rent: 361500,
  fees: 48000,
  floor: 12,
  parking: 0,
  distance: 5.3,
  times: [18, 15, 20, 64],
  point: [33, 52],
  tone: 2
}, {
  id: 4,
  address: 'Pedro de Valdivia 3010',
  location: 'Ñuñoa',
  beds: 0,
  baths: 1,
  area: 30,
  rent: 320000,
  fees: 55000,
  floor: 3,
  parking: 0,
  distance: 7.4,
  times: [29, 21, 28, 89],
  point: [68, 42],
  tone: 3
}, {
  id: 5,
  address: 'Los Leones 1450',
  location: 'Providencia',
  beds: 2,
  baths: 2,
  area: 64,
  rent: 610000,
  fees: 110000,
  floor: 8,
  parking: 1,
  distance: 10.2,
  times: [39, 29, 38, 122],
  point: [73, 14],
  tone: 1
}, {
  id: 6,
  address: 'Av. Macul 4200',
  location: 'Macul',
  beds: 1,
  baths: 1,
  area: 40,
  rent: 340000,
  fees: null,
  floor: 4,
  parking: 0,
  distance: 3.2,
  times: [16, 12, 13, 39],
  point: [76, 68],
  tone: 2
}, {
  id: 7,
  address: 'Grecia 890',
  location: 'Santiago',
  beds: 2,
  baths: 1,
  area: 51,
  rent: 410000,
  fees: 72000,
  floor: 6,
  parking: 0,
  distance: 6.2,
  times: [24, 19, 24, 74],
  point: [19, 39],
  tone: 0
}, {
  id: 8,
  address: 'Simón Bolívar 5200',
  location: 'Ñuñoa',
  beds: 3,
  baths: 2,
  area: 85,
  rent: 690000,
  fees: 120000,
  floor: 2,
  parking: 1,
  distance: 11.4,
  times: null,
  point: [88, 30],
  tone: 3
}];
export const destinations = [{
  id: 'campus',
  label: 'Campus San Joaquín — Av. Vicuña Mackenna 4860, Macul',
  point: [48, 82],
  factor: 1
}, {
  id: 'centro',
  label: 'Universidad de Chile — Av. Libertador Bernardo O’Higgins 1058, Santiago',
  point: [15, 18],
  factor: 1.35
}, {
  id: 'costanera',
  label: 'Costanera Center — Av. Andrés Bello 2425, Providencia',
  point: [84, 12],
  factor: 1.7
}];
export const modes = [{
  id: 'transit',
  label: 'Metro / Bus',
  icon: 'Bus'
}, {
  id: 'car',
  label: 'Auto',
  icon: 'Car'
}, {
  id: 'bike',
  label: 'Bicicleta',
  icon: 'Bike'
}, {
  id: 'walk',
  label: 'A pie',
  icon: 'Footprints'
}];
export const defaults = {
  destination: 'campus',
  mode: 'transit',
  days: 5,
  timeWeight: 40,
  hourValue: 3000
};
export const emptyFilters = {
  query: '',
  min: '',
  max: '',
  beds: '',
  baths: '',
  area: '',
  favorites: false
};
