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

// Valores por defecto (RN-25). El backend informa los vigentes en /parameters/public.
export const defaults = {
  origin: null,
  mode: 'transit',
  days: 5,
  costWeight: 50,
  timeWeight: 50
};

export const emptyFilters = {
  query: '',
  min: '',
  max: '',
  beds: '',
  baths: '',
  area: '',
  pets: false,
  parking: false
};
