import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { modeLabel } from '../services/calculations.js';

// Mi cuenta (F-09) y derechos sobre los datos personales (ley 21.719).
export default function ProfileView({ user, onUserChange, onLogout, onDelete, onLogin, navigate, notify }) {
  const [name, setName] = useState(user?.full_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [status, setStatus] = useState({ ok: '', error: '' });
  const [passwords, setPasswords] = useState({ current: '', next: '' });
  const [passStatus, setPassStatus] = useState({ ok: '', error: '' });
  const [prefs, setPrefs] = useState(null);
  const isRegistered = user?.role === 'registered';
  useEffect(() => {
    if (!isRegistered) return;
    let alive = true;
    api.preferences().then(p => alive && setPrefs(p)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [isRegistered]);
  if (!user) return <section className="panel empty"><h1>Tu cuenta EasyArriendo</h1><p>Inicia sesión para guardar tus preferencias, tus favoritos y ver tu ranking.</p><button className="primary" onClick={() => onLogin('/perfil')}>Iniciar sesión o crear cuenta</button></section>;
  const saveAccount = async e => {
    e.preventDefault();
    try {
      const changedEmail = email.trim().toLowerCase() !== user.email;
      const updated = await api.updateMe({ full_name: name.trim(), ...(changedEmail ? { email: email.trim() } : {}) });
      if (changedEmail) {
        notify('Te enviamos un correo para verificar tu nueva dirección. Verifícala para volver a entrar.');
        onLogout(false);
        return;
      }
      onUserChange(updated);
      setStatus({ ok: 'Datos actualizados.', error: '' });
    } catch (err) {
      setStatus({ ok: '', error: err.message });
    }
  };
  const savePassword = async e => {
    e.preventDefault();
    try {
      await api.changePassword(passwords.current, passwords.next);
      setPasswords({ current: '', next: '' });
      setPassStatus({ ok: 'Tu contraseña se actualizó.', error: '' });
    } catch (err) {
      setPassStatus({ ok: '', error: err.message });
    }
  };
  const download = async () => {
    try {
      const data = await api.exportData();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mis-datos-easyarriendo.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      notify(err.message);
    }
  };
  const resetPrefs = async () => {
    try {
      setPrefs(await api.resetPreferences());
      notify('Tus preferencias volvieron a los valores por defecto.');
    } catch (err) {
      notify(err.message);
    }
  };
  return <div className="profile"><h1>Mi cuenta</h1><p className="muted">{user.role === 'admin' ? 'Cuenta de administración.' : 'Gestiona tus datos, preferencias y privacidad.'}</p><form className="panel preferences" onSubmit={saveAccount}><h2>Datos de la cuenta</h2><label>Nombre<input required minLength="2" maxLength="120" value={name} onChange={e => setName(e.target.value)} /></label><label>Correo<span className="hint">Si lo cambias, deberás verificar la nueva dirección.</span><input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label><button className="primary">Guardar cambios</button>{status.ok && <p className="notice" role="status">{status.ok}</p>}{status.error && <p className="error" role="alert">{status.error}</p>}</form><form className="panel preferences" onSubmit={savePassword}><h2>Cambiar contraseña</h2><label>Contraseña actual<input type="password" required autoComplete="current-password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} /></label><label>Nueva contraseña<span className="hint">Al menos 8 caracteres.</span><input type="password" required minLength="8" autoComplete="new-password" value={passwords.next} onChange={e => setPasswords({ ...passwords, next: e.target.value })} /></label><button className="outline">Actualizar contraseña</button>{passStatus.ok && <p className="notice" role="status">{passStatus.ok}</p>}{passStatus.error && <p className="error" role="alert">{passStatus.error}</p>}</form>{isRegistered && <section className="panel"><h2>Preferencias guardadas</h2>{prefs ? prefs.is_default ? <p className="muted">Aún no guardas preferencias. Se usan los valores por defecto.</p> : <p>{prefs.home_address ?? 'Sin destino'} · {modeLabel(prefs.mode)} · {prefs.days} días / semana · {prefs.cost_weight}% costo / {prefs.time_weight}% tiempo</p> : <p className="muted">Cargando…</p>}<button className="outline" onClick={() => navigate('/preferencias')}>Modificar preferencias</button>{prefs && !prefs.is_default && <button className="text-button" onClick={resetPrefs}>Restablecer preferencias</button>}</section>}<section className="panel"><h2>Tus datos personales</h2><p className="muted">Puedes acceder a tus datos, rectificarlos desde este perfil o solicitar su eliminación, según la ley 21.719.</p><button className="text-button" onClick={download}>Descargar mis datos</button></section><div className="account-actions"><button className="outline" onClick={() => onLogout(true)}>Cerrar sesión</button><button className="danger" onClick={onDelete}>Eliminar mi cuenta</button></div></div>;
}
