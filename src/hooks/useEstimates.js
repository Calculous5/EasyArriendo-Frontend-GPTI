import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

// Pide al backend el costo real de un grupo de propiedades. La importancia del costo y del tiempo no
// cambia la estimación, por eso no se vuelve a consultar cuando solo cambia la ponderación (RNF-03).
export function useEstimates(ids, prefs) {
  const [state, setState] = useState({ key: '', byId: {}, error: '', routingError: '' });
  const origin = prefs.origin;
  const key = origin && ids.length ? `${ids.join(',')}|${origin.lat},${origin.lng}|${prefs.mode}|${prefs.days}` : '';
  useEffect(() => {
    if (!key) return;
    let alive = true;
    const [idPart] = key.split('|');
    api.estimates(idPart.split(',').map(Number).slice(0, 24), { origin, mode: prefs.mode, days: prefs.days, costWeight: 50, timeWeight: 50 })
      .then(data => alive && setState({
        key,
        byId: Object.fromEntries(data.items.map(item => [item.property_id, item])),
        error: '',
        routingError: data.routing_error ?? ''
      }))
      .catch(err => alive && setState({ key, byId: {}, error: err.message, routingError: '' }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  if (!key) return { byId: {}, loading: false, error: '', routingError: '' };
  return { ...state, byId: state.key === key ? state.byId : {}, loading: state.key !== key };
}
