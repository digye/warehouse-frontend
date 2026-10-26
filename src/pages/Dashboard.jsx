import { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: null,
    openOrders: null,
  });
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiRequest('/products'),
      apiRequest('/orders'),
      apiRequest('/inventory'),
    ])
      .then(([products, orders, inv]) => {
        setStats({
          totalProducts: products.length,
          openOrders: orders.filter((o) => o.status !== 'issued').length,
        });
        setInventory(inv.slice(0, 5));
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of current stock and activity</p>
        </div>
      </div>

      {error && <p style={{ color: 'var(--warn)', marginBottom: 16 }}>{error}</p>}

      <div className="stat-row">
        <div className="panel stat-card">
          <div className="value">{stats.totalProducts ?? '—'}</div>
          <div className="label">Total products</div>
        </div>
        <div className="panel stat-card">
          <div className="value">{stats.openOrders ?? '—'}</div>
          <div className="label">Open orders</div>
        </div>
      </div>

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Warehouses</th>
              <th>Total quantity</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((r) => (
              <tr key={r.product_id}>
                <td>
                  {r.name}
                  {r.item_type && <span style={{ color: 'var(--muted)' }}> — {r.item_type}</span>}
                </td>
                <td>
                  {r.warehouses && r.warehouses.length
                    ? r.warehouses.map((w) => w.warehouse_name).join(', ')
                    : '—'}
                </td>
                <td>{r.total_quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}