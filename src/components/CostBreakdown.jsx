import { money } from '../services/calculations.js';

// Desglose del costo real mensual (REQ-F03-03, REQ-IU-04). Los valores estimados se distinguen de los publicados (RN-09).
export default function CostBreakdown({
  property: p,
  prefs,
  rates
}) {
  const trips = 2 * prefs.days * (rates?.weeks_per_month ?? 4);
  return <section className="panel breakdown" id="desglose"><h2>Tu costo real mensual</h2><dl><div><dt>Arriendo <small>Publicado</small></dt><dd>{money(p.rent)}</dd></div><div><dt>Gastos comunes <small>{p.feesMissing ? 'No informados · se usa $0' : 'Publicado'}</small></dt><dd>{money(p.fees)}</dd></div>{p.available && <><div><dt>Transporte <small className="estimated">Estimado · {trips} viajes / mes</small></dt><dd>{money(p.transport)}</dd></div><div><dt>Tiempo valorizado <small className="estimated">Estimado · {p.minutes} min × {trips} viajes × {money(rates?.hour_value ?? 3000)}/h</small></dt><dd>{money(p.timeCost)}</dd></div></>}</dl>{!prefs.origin ? <p className="notice">Indica dónde trabajas o estudias para calcular transporte y tiempo.</p> : p.pending ? <p className="notice">Calculando traslado…</p> : p.available ? <div className="cost total"><span>Total mensual estimado</span><strong>{money(p.total)}</strong></div> : <p className="notice">Traslado no disponible. Esta propiedad se excluye del ranking.</p>}<p className="fine">Costo real = arriendo + gastos comunes + transporte + tiempo valorizado. Transporte y tiempo son estimaciones; el transporte público se estima a partir del tiempo en auto.</p></section>;
}
