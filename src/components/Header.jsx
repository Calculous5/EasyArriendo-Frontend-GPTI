import { Heart, HelpCircle, UserRound } from 'lucide-react';
export default function Header({
  navigate,
  user,
  onLogin,
  onInfo,
  favoriteCount
}) {
  const firstName = user?.full_name?.split(' ')[0];
  return <><header><div className="shell header-inner"><button className="brand" onClick={() => navigate('/')} aria-label="EasyArriendo, inicio"><strong>TOCTOC<span>•</span></strong><span className="brand-tag">EasyArriendo</span></button><nav className="top-nav" aria-label="Cuenta"><button aria-label={`Favoritos (${favoriteCount})`} onClick={() => navigate('/favoritos')}><Heart size={17} /><span>Favoritos ({favoriteCount})</span></button><button aria-label="Ayuda" onClick={() => onInfo('ayuda')}><HelpCircle size={17} /><span>Ayuda</span></button><button aria-label={user ? `Mi perfil: ${user.full_name}` : 'Iniciar sesión'} onClick={() => user ? navigate('/perfil') : onLogin()}><UserRound size={17} /><span>{user ? firstName : 'Iniciar sesión'}</span></button></nav></div></header><div className="subnav"><div className="shell subnav-inner"><button onClick={() => navigate('/')}>Arrendar</button><button onClick={() => navigate('/preferencias')}>Costo real de arrendar <span>Nuevo</span></button><span className="demo-tag">MVP académico · Grupo 8</span></div></div></>;
}
