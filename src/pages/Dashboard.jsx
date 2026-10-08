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
          openOrders: orders.filter((o) => o.status !== 'shipped').length,
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
              <th>Product</th>
              <th>Location</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((r) => (
              <tr key={r.inventory_id}>
                <td>{r.product}</td>
                <td>{[r.aisle, r.shelf, r.bin].filter(Boolean).join('-')}</td>
                <td>{r.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
