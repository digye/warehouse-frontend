import { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sku: '', name: '', unit_of_measure: '' });
  const [saving, setSaving] = useState(false);

  function load() {
    apiRequest('/products')
      .then(setProducts)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiRequest('/products', { method: 'POST', body: form });
      setForm({ sku: '', name: '', unit_of_measure: '' });
      setShowForm(false);
      load(); // refresh the table with the new product included
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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
            <label htmlFor="name">Name</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
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
              <th>SKU</th>
              <th>Name</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.product_id}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.unit_of_measure}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
