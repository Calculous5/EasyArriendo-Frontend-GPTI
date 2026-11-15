import { money } from '../services/calculations.js';
export default function CostBreakdown({
  property: p,
  prefs
}) {
  return <section className="panel breakdown" id="desglose"><h2>Tu costo real mensual</h2><dl><div><dt>Arriendo <small>Publicado</small></dt><dd>{money(p.rent)}</dd></div><div><dt>Gastos comunes <small>{p.feesMissing ? 'No informados · se usa $0' : 'Publicado'}</small></dt><dd>{money(p.fees)}</dd></div>{p.available && <><div><dt>Transporte <small>Estimado · {p.trips} viajes / mes</small></dt><dd>{money(p.transport)}</dd></div><div><dt>Tiempo valorizado <small>{p.minutes} min × {p.trips} viajes × {money(prefs.hourValue)}/h</small></dt><dd>{money(p.timeCost)}</dd></div></>}</dl>{p.available ? <div className="cost total"><span>Total mensual estimado</span><strong>{money(p.total)}</strong></div> : <p className="notice">Traslado no disponible. Esta propiedad se excluye del ranking.</p>}<p className="fine">Costo real = arriendo + gastos comunes + transporte + tiempo valorizado. Los traslados y tarifas son datos de demostración.</p></section>;
}
