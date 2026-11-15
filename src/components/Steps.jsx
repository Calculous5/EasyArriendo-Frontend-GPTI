export default function Steps({
  step
}) {
  return <ol className="steps" aria-label="Pasos de comparación">{['Selecciona propiedades', 'Tus preferencias', 'Ranking y comparación'].map((s, i) => <li key={s} aria-current={step === i + 1 ? 'step' : undefined} className={step >= i + 1 ? 'active' : ''}><b>{step > i + 1 ? '✓' : i + 1}</b><span>{s}</span></li>)}</ol>;
}
