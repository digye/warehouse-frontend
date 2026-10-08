import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const emptyForm = {
  requester_name: '',
  requester_email: '',
  needed_by: '',
  warehouse_name: '',
  warehouse_email: '',
};

const emptyLine = { product_id: '', quantity: '' };

export default function MaterialRequest() {
  const [step, setStep] = useState('form'); // 'form' | 'preview' | 'sent'
  const [form, setForm] = useState(emptyForm);
  const [lines, setLines] = useState([{ ...emptyLine }]);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmedId, setConfirmedId] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsState, setProductsState] = useState('loading'); // 'loading' | 'ready' | 'error'

  // Load the list of real products for the item dropdowns
  useEffect(() => {
    fetch('/api/material-requests/items')
      .then((res) => {
        if (!res.ok) throw new Error('Could not load items');
        return res.json();
      })
      .then((list) => {
        setProducts(list);
        setProductsState('ready');
      })
      .catch(() => setProductsState('error'));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateLine(index, field, value) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, { ...emptyLine }]);
  }

  function removeLine(index) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function productFor(line) {
    return products.find((p) => String(p.product_id) === String(line.product_id));
  }

  // Product IDs already picked in other rows, so the same item can't be added twice
  function takenElsewhere(index) {
    return new Set(
      lines.filter((_, i) => i !== index).map((l) => String(l.product_id)).filter(Boolean)
    );
  }

  function handlePreview(e) {
    e.preventDefault();
    setError('');
    if (!lines.length || lines.some((l) => !l.product_id || !l.quantity)) {
      setError('Please select an item and quantity for every row.');
      return;
    }
    setStep('preview');
  }

  async function handleConfirmSend() {
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/material-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: lines.map((l) => ({ product_id: Number(l.product_id), quantity: Number(l.quantity) })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong sending the request');

      setConfirmedId(data.request.request_id);
      setStep('sent');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  function startOver() {
    setForm(emptyForm);
    setLines([{ ...emptyLine }]);
    setStep('form');
    setConfirmedId(null);
  }

  const formattedDate = form.needed_by
    ? new Date(form.needed_by).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'Not specified';

  return (
    <div className="request-page">
      <div className="request-container">
        <div className="login-toggle login-toggle-light" style={{ marginBottom: 20 }}>
          <Link to="/login" className="login-toggle-inactive-light">Warehouse Manager</Link>
          <span className="login-toggle-active">Request Materials</span>
        </div>

        <div className="request-header">
          <h1>Request Materials</h1>
          <p>Fill this out to request items from a warehouse</p>
        </div>

        {step === 'form' && (
          <form className="panel" onSubmit={handlePreview} style={{ padding: 24 }}>
            <div className="field">
              <label htmlFor="requester_name"> Name</label>
              <input
                id="requester_name"
                value={form.requester_name}
                onChange={(e) => update('requester_name', e.target.value)}
                placeholder="Enter your fullname"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="requester_email"> Email Address</label>
              <input
                id="requester_email"
                type="email"
                value={form.requester_email}
                onChange={(e) => update('requester_email', e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
              Items
            </label>

            {productsState === 'error' && (
              <p style={{ color: 'var(--warn)', fontSize: 13, margin: '0 0 12px' }}>
                Couldn't load the item list. Please refresh the page and try again.
              </p>
            )}
            {productsState === 'ready' && products.length === 0 && (
              <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 12px' }}>
                No items are available to request yet.
              </p>
            )}

            {lines.map((line, index) => {
              const selected = productFor(line);
              const taken = takenElsewhere(index);
              return (
                <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                  <select
                    value={line.product_id}
                    onChange={(e) => updateLine(index, 'product_id', e.target.value)}
                    required
                    disabled={productsState !== 'ready' || products.length === 0}
                    style={{ flex: 2, padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}
                  >
                    <option value="">
                      {productsState === 'loading' ? 'Loading items...' : 'Select an item'}
                    </option>
                    {products
                      .filter((p) => !taken.has(String(p.product_id)))
                      .map((p) => (
                        <option key={p.product_id} value={p.product_id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    placeholder={selected && selected.unit_of_measure ? `Qty (${selected.unit_of_measure})` : 'Qty'}
                    value={line.quantity}
                    onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                    required
                    style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 14, fontFamily: 'inherit' }}
                  />
                  {lines.length > 1 && (
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => removeLine(index)}
                      style={{ padding: '9px 12px' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              className="btn-outline"
              onClick={addLine}
              disabled={productsState !== 'ready' || lines.length >= products.length}
              style={{ marginBottom: 20 }}
            >
              + Add another item
            </button>

            <div className="field">
              <label htmlFor="needed_by">Date and time needed</label>
              <input
                id="needed_by"
                type="datetime-local"
                value={form.needed_by}
                onChange={(e) => update('needed_by', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="warehouse_name">Warehouse Name</label>
              <input
                id="warehouse_name"
                value={form.warehouse_name}
                onChange={(e) => update('warehouse_name', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="warehouse_email">Warehouse Email</label>
              <input
                id="warehouse_email"
                type="email"
                value={form.warehouse_email}
                onChange={(e) => update('warehouse_email', e.target.value)}
                placeholder="elvysmartinz@gmail.com"
                required
              />
            </div>

            {error && <p style={{ color: 'var(--warn)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button className="btn" type="submit" style={{ width: '100%', marginTop: 8 }}>
              Preview request
            </button>
          </form>
        )}

        {step === 'preview' && (
          <>
            <div className="invoice-card">
              <div className="invoice-head">
                <h2>Material Request</h2>
                <p>Preview — not yet sent</p>
              </div>
              <div className="invoice-body">
                <div className="invoice-row">
                  <span className="label">Requested by</span>
                  <span>{form.requester_name}</span>
                </div>
                <div className="invoice-row">
                  <span className="label">Requester email</span>
                  <span>{form.requester_email}</span>
                </div>
                <div className="invoice-row">
                  <span className="label">Needed by</span>
                  <span>{formattedDate}</span>
                </div>
                <div className="invoice-row">
                  <span className="label">Warehouse</span>
                  <span>{form.warehouse_name}</span>
                </div>
                <div className="invoice-row">
                  <span className="label">Sending to</span>
                  <span>{form.warehouse_email}</span>
                </div>

                <p style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.03em', margin: '20px 0 6px' }}>
                  Items
                </p>
                {lines.map((line, index) => {
                  const selected = productFor(line);
                  return (
                    <div className="invoice-row" key={index}>
                      <span>{selected ? selected.name : ''}</span>
                      <span>×{line.quantity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && <p style={{ color: 'var(--warn)', marginTop: 16 }}>{error}</p>}

            <div className="form-actions">
              <button className="btn-outline" onClick={() => setStep('form')} disabled={sending}>
                Edit
              </button>
              <button className="btn" onClick={handleConfirmSend} disabled={sending} style={{ flex: 1 }}>
                {sending ? 'Sending...' : 'Confirm & send'}
              </button>
            </div>
          </>
        )}

        {step === 'sent' && (
          <div className="panel" style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
            <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Request sent</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
              Request #{confirmedId} was emailed to {form.warehouse_email}.
            </p>
            <button className="btn-outline" onClick={startOver}>
              Submit another request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
