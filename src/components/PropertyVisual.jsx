import { Building2 } from 'lucide-react';
export default function PropertyVisual({
  property,
  small = false
}) {
  return <div className={`property-visual tone-${property.tone} ${small ? 'small' : ''}`} role="img" aria-label={`Imagen de referencia para ${property.address}`}><div className="window-scene"><i /><i /><i /></div><div className="sofa" /><div className="plant" /><Building2 size={small ? 22 : 30} />{!small && <span>Imagen de referencia · {property.location}</span>}</div>;
}
