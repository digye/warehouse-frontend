import { useEffect, useState, Fragment } from 'react';
import { apiRequest } from '../api.js';

export default function Inventory() {
  const [rows, setRows] = useState([]); // grouped by product, each with a .warehouses breakdown
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product_id: '', location_id: '', quantity: '' });
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  function load() {
    Promise.all([
      apiRequest('/inventory'),
      apiRequest('/products'),
      apiRequest('/locations'),
    ])
      .then(([inv, prods, locs]) => {
        setRows(inv);
        setProducts(prods);
        setLocations(locs);
        setForm((f) => ({
          ...f,
          product_id: f.product_id || prods[0]?.product_id || '',
          location_id: f.location_id || locs[0]?.location_id || '',
        }));
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiRequest('/inventory', {
        method: 'POST',
        body: {
          product_id: Number(form.product_id),
          location_id: Number(form.location_id),
          quantity: Number(form.quantity),
        },
      });
      setForm({ ...form, quantity: '' });
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

  const canAdd = products.length && locations.length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>Stock by product, broken down by warehouse</p>
        </div>
        <button className="btn" onClick={() => setShowForm((v) => !v)} disabled={!canAdd}>
          {showForm ? 'Cancel' : 'Add stock'}
        </button>
      </div>

      {error && <p style={{ color: 'var(--warn)', marginBottom: 16 }}>{error}</p>}

      {!canAdd && (
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
          Add at least one product and one location before adding stock.
        </p>
      )}

      {showForm && (
        <form className="panel" onSubmit={handleAdd} style={{ padding: 20, marginBottom: 20 }}>
          <div className="field">
            <label htmlFor="product">Product</label>
            <select
              id="product"
              value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid var(--line)' }}
            >
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  {p.name}{p.item_type ? ` — ${p.item_type}` : ''} ({p.sku})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="location">Location</label>
            <select
              id="location"
              value={form.location_id}
              onChange={(e) => setForm({ ...form, location_id: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid var(--line)' }}
            >
              {locations.map((l) => (
                <option key={l.location_id} value={l.location_id}>
                  {l.warehouse_name} — {[l.aisle, l.shelf, l.bin].filter(Boolean).join('-')}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
          </div>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save stock'}
          </button>
        </form>
      )}

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Item</th>
              <th>SKU</th>
              <th>Total quantity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const expanded = expandedId === r.product_id;
              return (
                <Fragment key={r.product_id}>
                  <tr onClick={() => toggle(r.product_id)} style={{ cursor: 'pointer' }}>
                    <td style={{ color: 'var(--muted)', width: 20 }}>{expanded ? '▾' : '▸'}</td>
                    <td>
                      {r.name}
                      {r.item_type && (
                        <span style={{ color: 'var(--muted)' }}> — {r.item_type}</span>
                      )}
                    </td>
                    <td>{r.sku}</td>
                    <td>{r.total_quantity}</td>
                  </tr>
                  {expanded && (
                    <tr>
                      <td></td>
                      <td colSpan={3} style={{ background: 'var(--paper)', padding: '12px 16px' }}>
                        {r.warehouses.length === 0 ? (
                          <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
                            No stock recorded in any warehouse yet.
                          </p>
                        ) : (
                          <table style={{ width: '100%' }}>
                            <thead>
                              <tr>
                                <th style={{ padding: '4px 0', fontSize: 12 }}>Warehouse</th>
                                <th style={{ padding: '4px 0', fontSize: 12, textAlign: 'right' }}>Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {r.warehouses.map((w) => (
                                <tr key={w.warehouse_id}>
                                  <td style={{ padding: '4px 0', border: 'none' }}>{w.warehouse_name}</td>
                                  <td style={{ padding: '4px 0', border: 'none', textAlign: 'right' }}>{w.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
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