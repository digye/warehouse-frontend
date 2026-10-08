import { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [destination, setDestination] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: '' }]);
  const [saving, setSaving] = useState(false);

  function load() {
    Promise.all([apiRequest('/orders'), apiRequest('/products')])
      .then(([o, p]) => {
        setOrders(o);
        setProducts(p);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function addItemRow() {
    setItems((prev) => [...prev, { product_id: products[0]?.product_id || '', quantity: '' }]);
  }

  function removeItemRow(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiRequest('/orders', {
        method: 'POST',
        body: {
          customer_or_destination: destination,
          items: items
            .filter((it) => it.product_id && it.quantity)
            .map((it) => ({ product_id: Number(it.product_id), quantity: Number(it.quantity) })),
        },
      });
      setDestination('');
      setItems([{ product_id: '', quantity: '' }]);
      setShowForm(false);
      load();
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
          <h1>Orders</h1>
          <p>Outbound orders and their status</p>
        </div>
        <button className="btn" onClick={() => setShowForm((v) => !v)} disabled={!products.length}>
          {showForm ? 'Cancel' : 'New order'}
        </button>
      </div>

      {error && <p style={{ color: 'var(--warn)', marginBottom: 16 }}>{error}</p>}

      {!products.length && (
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
          Add at least one product before creating an order.
        </p>
      )}

      {showForm && (
        <form className="panel" onSubmit={handleAdd} style={{ padding: 20, marginBottom: 20 }}>
          <div className="field">
            <label htmlFor="destination">Destination</label>
            <input
              id="destination"
              placeholder="e.g. Acme Retail - Downtown"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>

          <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
            Items
          </label>
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
              <select
                value={item.product_id}
                onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                style={{ flex: 2, padding: '9px 12px', borderRadius: 6, border: '1px solid var(--line)' }}
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.product_id} value={p.product_id}>{p.name} ({p.sku})</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                style={{ flex: 1, padding: '9px 12px', borderRadius: 6, border: '1px solid var(--line)' }}
              />
              {items.length > 1 && (
                <button type="button" className="btn-outline" onClick={() => removeItemRow(index)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn-outline" onClick={addItemRow} style={{ marginBottom: 16 }}>
            + Add another item
          </button>

          <div>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Create order'}
            </button>
          </div>
        </form>
      )}

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Destination</th>
              <th>Items</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.order_id}>
                <td>{o.customer_or_destination}</td>
                <td>
                  {o.items && o.items.length
                    ? o.items.map((i) => `${i.product_name} ×${i.quantity}`).join(', ')
                    : '—'}
                </td>
                <td>{o.status}</td>
                <td>{new Date(o.order_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
