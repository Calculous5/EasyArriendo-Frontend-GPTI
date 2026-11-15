import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export default function Modal({
  title,
  onClose,
  children
}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    el.showModal();
    return () => el.close();
  }, []);
  return <dialog ref={ref} onCancel={onClose} onClick={e => {
    if (e.target === e.currentTarget) onClose();
  }} aria-labelledby="modal-title"><div className="modal-heading"><h2 id="modal-title">{title}</h2><button aria-label="Cerrar ventana" onClick={onClose}><X size={20} /></button></div>{children}</dialog>;
}
