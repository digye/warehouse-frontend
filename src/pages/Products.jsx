import { useEffect, useState, Fragment } from 'react';
import { apiRequest } from '../api.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [breakdowns, setBreakdowns] = useState({}); // product_id -> [{warehouse_name, quantity}]
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sku: '', name: '', item_type: '', unit_of_measure: '' });
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  function load() {
    Promise.all([apiRequest('/products'), apiRequest('/inventory')])
      .then(([prods, inv]) => {
        setProducts(prods);
        const map = {};
        for (const row of inv) map[row.product_id] = row.warehouses;
        setBreakdowns(map);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiRequest('/products', { method: 'POST', body: form });
      setForm({ sku: '', name: '', item_type: '', unit_of_measure: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function toggle(id) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Everything tracked in the system</p>
        </div>
        <button className="btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'Add product'}
        </button>
      </div>

      {error && <p style={{ color: 'var(--warn)', marginBottom: 16 }}>{error}</p>}

      {showForm && (
        <form className="panel" onSubmit={handleAdd} style={{ padding: 20, marginBottom: 20 }}>
          <div className="field">
            <label htmlFor="sku">SKU</label>
            <input
              id="sku"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="name">Item name</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="item_type">Item type (optional)</label>
            <input
              id="item_type"
              placeholder="e.g. 3-inch, Medium, Red — for items that come in variants"
              value={form.item_type}
              onChange={(e) => setForm({ ...form, item_type: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="unit">Unit of measure</label>
            <input
              id="unit"
              placeholder="e.g. each, roll, pair"
              value={form.unit_of_measure}
              onChange={(e) => setForm({ ...form, unit_of_measure: e.target.value })}
            />
          </div>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save product'}
          </button>
        </form>
      )}

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Item</th>
              <th>Type</th>
              <th>SKU</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const expanded = expandedId === p.product_id;
              const warehouses = breakdowns[p.product_id] || [];
              return (
                <Fragment key={p.product_id}>
                  <tr
                    onClick={() => toggle(p.product_id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ color: 'var(--muted)', width: 20 }}>{expanded ? '▾' : '▸'}</td>
                    <td>{p.name}</td>
                    <td>{p.item_type || '—'}</td>
                    <td>{p.sku}</td>
                    <td>{p.total_quantity}</td>
                  </tr>
                  {expanded && (
                    <tr>
                      <td></td>
                      <td colSpan={4} style={{ background: 'var(--paper)', padding: '16px 16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div>
                            <p style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 8px' }}>
                              Details
                            </p>
                            {p.description && <div style={{ marginBottom: 6 }}>{p.description}</div>}
                            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                              {p.unit_of_measure && <div>Unit: {p.unit_of_measure}</div>}
                              {p.unit_cost != null && <div>Unit cost: ${p.unit_cost}</div>}
                              {p.reorder_level != null && <div>Reorder level: {p.reorder_level}</div>}
                              {p.hazard_class && <div>Hazard class: {p.hazard_class}</div>}
                            </div>
                          </div>
                          <div>
                            <p style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 8px' }}>
                              Stock by warehouse
                            </p>
                            {warehouses.length === 0 ? (
                              <p style={{ color: 'var(--muted)', fontSize: 13 }}>No stock recorded yet.</p>
                            ) : (
                              warehouses.map((w) => (
                                <div
                                  key={w.warehouse_id}
                                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}
                                >
                                  <span>{w.warehouse_name}</span>
                                  <span>{w.quantity}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
