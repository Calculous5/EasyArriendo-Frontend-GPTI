import { useState } from 'react';
export default function ProfileView({
  user,
  prefs,
  onSave,
  onLogout,
  onDelete,
  onLogin,
  navigate
}) {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saved, setSaved] = useState(false);
  if (!user) return <section className="panel empty"><h1>Tu perfil de demostración</h1><button className="primary" onClick={() => onLogin('/perfil')}>Entrar a la demostración</button></section>;
  return <div className="profile"><h1>Mi perfil</h1><p className="muted">Cuenta local de demostración. No uses información personal real.</p><form className="panel preferences" onSubmit={e => {
      e.preventDefault();
      onSave({
        ...user,
        name: name.trim(),
        email
      });
      setSaved(true);
    }}><label>Nombre<input required minLength="2" maxLength="60" value={name} onChange={e => {
          setName(e.target.value);
          setSaved(false);
        }} /></label><label>Correo de demostración<input type="email" required value={email} onChange={e => {
          setEmail(e.target.value);
          setSaved(false);
        }} /></label><button className="primary">Guardar cambios</button>{saved && <p className="notice" role="status">Perfil actualizado en este navegador.</p>}</form><section className="panel"><h2>Preferencias guardadas</h2><p>{prefs.days} días / semana · {100 - prefs.timeWeight}% costo / {prefs.timeWeight}% tiempo</p><button className="outline" onClick={() => navigate('/preferencias')}>Modificar preferencias</button><button className="text-button" onClick={() => {
        const blob = new Blob([JSON.stringify({
          user,
          prefs
        }, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mi-perfil-easyarriendo.json';
        a.click();
        URL.revokeObjectURL(url);
      }}>Descargar mis datos de perfil</button></section><div className="account-actions"><button className="outline" onClick={onLogout}>Cerrar sesión</button><button className="danger" onClick={onDelete}>Eliminar datos de demostración</button></div></div>;
}
