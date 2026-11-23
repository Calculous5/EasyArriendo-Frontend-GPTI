import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

function DevLink({ link }) {
  if (!link) return null;
  return <p className="fine dev-link">Modo desarrollo (sin servicio de correo): <a href={link}>abrir el enlace del correo</a>.</p>;
}

// Registro, inicio de sesión y recuperación de contraseña (F-10).
export function AuthPanel({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', accept: false });
  const [status, setStatus] = useState({ ok: '', error: '', link: '', busy: false, unverified: false });
  const set = (k, v) => setForm({ ...form, [k]: v });
  const switchTo = next => {
    setMode(next);
    setStatus({ ok: '', error: '', link: '', busy: false, unverified: false });
  };
  const submit = async e => {
    e.preventDefault();
    setStatus({ ok: '', error: '', link: '', busy: true, unverified: false });
    try {
      if (mode === 'login') {
        const data = await api.login(form.email, form.password);
        onAuthenticated(data);
        return;
      }
      if (mode === 'register') {
        const data = await api.register({ email: form.email, password: form.password, full_name: form.name, accept_privacy: form.accept });
        setStatus({ ok: data.message, error: '', link: data.dev_link, busy: false, unverified: false });
        return;
      }
      const data = await api.forgotPassword(form.email);
      setStatus({ ok: data.message, error: '', link: data.dev_link, busy: false, unverified: false });
    } catch (err) {
      setStatus({ ok: '', error: err.message, link: '', busy: false, unverified: err.status === 403 });
    }
  };
  const resend = async () => {
    const data = await api.resendVerification(form.email).catch(err => ({ message: err.message }));
    setStatus({ ok: data.message, error: '', link: data.dev_link, busy: false, unverified: false });
  };
  return <><div className="auth-tabs" role="tablist">{[['login', 'Iniciar sesión'], ['register', 'Crear cuenta']].map(([id, label]) => <button key={id} role="tab" aria-selected={mode === id} className={mode === id ? 'active' : ''} onClick={() => switchTo(id)}>{label}</button>)}</div><form className="preferences" onSubmit={submit}>{mode === 'forgot' && <p className="muted">Te enviaremos un enlace para crear una nueva contraseña.</p>}{mode === 'register' && <label>Nombre<input required minLength="2" maxLength="120" autoComplete="name" value={form.name} onChange={e => set('name', e.target.value)} /></label>}<label>Correo<input type="email" required autoComplete="email" value={form.email} onChange={e => set('email', e.target.value)} /></label>{mode !== 'forgot' && <label>Contraseña{mode === 'register' && <span className="hint">Al menos 8 caracteres.</span>}<input type="password" required minLength={mode === 'register' ? 8 : 1} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={form.password} onChange={e => set('password', e.target.value)} /></label>}{mode === 'register' && <><details className="privacy"><summary>Política de privacidad</summary><p>Guardamos tu nombre, correo, contraseña cifrada, tus preferencias de vivienda y tus favoritos solo para entregarte comparaciones y rankings personalizados. No guardamos tu ubicación exacta: solo el texto de la dirección que eliges guardar. Puedes acceder a tus datos, corregirlos o eliminar tu cuenta con todos sus datos en cualquier momento desde Mi cuenta (ley 21.719). No compartimos tus datos con terceros.</p></details><label className="check"><input type="checkbox" required checked={form.accept} onChange={e => set('accept', e.target.checked)} /> Acepto la política de privacidad</label></>}{status.error && <p className="error" role="alert">{status.error}</p>}{status.unverified && <button type="button" className="text-button" onClick={resend}>Reenviar correo de verificación</button>}{status.ok && <p className="notice" role="status">{status.ok}</p>}<DevLink link={status.link} /><button className="primary full" disabled={status.busy}>{status.busy ? 'Enviando…' : mode === 'login' ? 'Iniciar sesión' : mode === 'register' ? 'Crear cuenta' : 'Enviar enlace'}</button>{mode === 'login' && <button type="button" className="text-button" onClick={() => switchTo('forgot')}>Olvidé mi contraseña</button>}{mode === 'forgot' && <button type="button" className="text-button" onClick={() => switchTo('login')}>Volver a iniciar sesión</button>}</form></>;
}

// El enlace es de un solo uso: se consulta una vez por token aunque el efecto se ejecute dos veces.
const verifications = new Map();
const verifyOnce = token => {
  if (!verifications.has(token)) verifications.set(token, api.verifyEmail(token));
  return verifications.get(token);
};

// Enlace del correo de verificación (REQ-F10-02).
export function VerifyEmailView({ token, onLogin }) {
  const [state, setState] = useState({ token: '', ok: '', error: '' });
  useEffect(() => {
    let alive = true;
    verifyOnce(token).then(r => alive && setState({ token, ok: r.message, error: '' })).catch(err => alive && setState({ token, ok: '', error: err.message }));
    return () => {
      alive = false;
    };
  }, [token]);
  if (state.token !== token) return <p className="notice" role="status">Verificando tu correo…</p>;
  return <section className="panel empty"><h1>{state.ok ? '¡Cuenta verificada!' : 'No pudimos verificar tu correo'}</h1><p>{state.ok || state.error}</p><button className="primary" onClick={() => onLogin('/')}>Iniciar sesión</button></section>;
}

// Enlace del correo de recuperación (REQ-F10-04).
export function ResetPasswordView({ token, onLogin }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState({ ok: '', error: '' });
  const submit = async e => {
    e.preventDefault();
    if (password !== confirm) return setStatus({ ok: '', error: 'Las contraseñas no coinciden.' });
    try {
      const r = await api.resetPassword(token, password);
      setStatus({ ok: r.message, error: '' });
    } catch (err) {
      setStatus({ ok: '', error: err.message });
    }
  };
  if (status.ok) return <section className="panel empty"><h1>Contraseña actualizada</h1><p>{status.ok}</p><button className="primary" onClick={() => onLogin('/')}>Iniciar sesión</button></section>;
  return <form className="panel preferences narrow" onSubmit={submit}><h1>Crea una nueva contraseña</h1><label>Nueva contraseña<span className="hint">Al menos 8 caracteres.</span><input type="password" required minLength="8" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /></label><label>Repite la contraseña<input type="password" required minLength="8" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} /></label>{status.error && <p className="error" role="alert">{status.error}</p>}<button className="primary full">Guardar contraseña</button></form>;
}
