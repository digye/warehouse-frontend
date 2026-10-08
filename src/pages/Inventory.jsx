import { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';

export default function Inventory() {
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product_id: '', location_id: '', quantity: '' });
  const [saving, setSaving] = useState(false);

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

  const canAdd = products.length && locations.length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>Current stock across all locations</p>
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
                <option key={p.product_id} value={p.product_id}>{p.name} ({p.sku})</option>
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
              <th>Product</th>
              <th>Location</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
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
