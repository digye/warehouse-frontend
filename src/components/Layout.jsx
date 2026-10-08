import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/inventory', label: 'Inventory' },
  { to: '/products', label: 'Products' },
  { to: '/orders', label: 'Orders' },
  { to: '/locations', label: 'Locations' },
  { to: '/material-requests', label: 'Material Requests' },
];

export default function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          Ware<span>house</span>
        </div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            {link.label}
          </NavLink>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--sidebar-active)' }}>
          {user && (
            <div style={{ padding: '0 12px', marginBottom: 10 }}>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{user.name}</div>
              <div style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'capitalize' }}>
                {user.role}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', font: 'inherit' }}
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
