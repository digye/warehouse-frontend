import { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';

export default function Locations() {
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');

  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState({ name: '', address: '' });

  const [showLocationForm, setShowLocationForm] = useState(false);
  const [locationForm, setLocationForm] = useState({ warehouse_id: '', aisle: '', shelf: '', bin: '' });

  const [saving, setSaving] = useState(false);

  function load() {
    Promise.all([apiRequest('/warehouses'), apiRequest('/locations')])
      .then(([w, l]) => {
        setWarehouses(w);
        setLocations(l);
        if (w.length && !locationForm.warehouse_id) {
          setLocationForm((f) => ({ ...f, warehouse_id: w[0].warehouse_id }));
        }
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleAddWarehouse(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiRequest('/warehouses', { method: 'POST', body: warehouseForm });
      setWarehouseForm({ name: '', address: '' });
      setShowWarehouseForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddLocation(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiRequest('/locations', {
        method: 'POST',
        body: { ...locationForm, warehouse_id: Number(locationForm.warehouse_id) },
      });
      setLocationForm({ ...locationForm, aisle: '', shelf: '', bin: '' });
      setShowLocationForm(false);
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
          <h1>Warehouses &amp; Locations</h1>
          <p>Set these up first so products have somewhere to be stocked</p>
        </div>
      </div>

      {error && <p style={{ color: 'var(--warn)', marginBottom: 16 }}>{error}</p>}

      <div className="page-header" style={{ marginBottom: 12 }}>
        <h1 style={{ fontSize: 16 }}>Warehouses</h1>
        <button className="btn-outline" onClick={() => setShowWarehouseForm((v) => !v)}>
          {showWarehouseForm ? 'Cancel' : 'Add warehouse'}
        </button>
      </div>

      {showWarehouseForm && (
        <form className="panel" onSubmit={handleAddWarehouse} style={{ padding: 20, marginBottom: 20 }}>
          <div className="field">
            <label htmlFor="wname">Name</label>
            <input
              id="wname"
              value={warehouseForm.name}
              onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="waddress">Address</label>
            <input
              id="waddress"
              value={warehouseForm.address}
              onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
            />
          </div>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save warehouse'}
          </button>
        </form>
      )}

      <div className="panel" style={{ marginBottom: 32 }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((w) => (
              <tr key={w.warehouse_id}>
                <td>{w.name}</td>
                <td>{w.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="page-header" style={{ marginBottom: 12 }}>
        <h1 style={{ fontSize: 16 }}>Locations</h1>
        <button
          className="btn-outline"
          onClick={() => setShowLocationForm((v) => !v)}
          disabled={!warehouses.length}
        >
          {showLocationForm ? 'Cancel' : 'Add location'}
        </button>
      </div>

      {!warehouses.length && (
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
          Add a warehouse first before adding locations.
        </p>
      )}

      {showLocationForm && (
        <form className="panel" onSubmit={handleAddLocation} style={{ padding: 20, marginBottom: 20 }}>
          <div className="field">
            <label htmlFor="lwarehouse">Warehouse</label>
            <select
              id="lwarehouse"
              value={locationForm.warehouse_id}
              onChange={(e) => setLocationForm({ ...locationForm, warehouse_id: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid var(--line)' }}
            >
              {warehouses.map((w) => (
                <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="aisle">Aisle</label>
            <input
              id="aisle"
              value={locationForm.aisle}
              onChange={(e) => setLocationForm({ ...locationForm, aisle: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="shelf">Shelf</label>
            <input
              id="shelf"
              value={locationForm.shelf}
              onChange={(e) => setLocationForm({ ...locationForm, shelf: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="bin">Bin</label>
            <input
              id="bin"
              value={locationForm.bin}
              onChange={(e) => setLocationForm({ ...locationForm, bin: e.target.value })}
            />
          </div>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save location'}
          </button>
        </form>
      )}

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Warehouse</th>
              <th>Aisle</th>
              <th>Shelf</th>
              <th>Bin</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((l) => (
              <tr key={l.location_id}>
                <td>{l.warehouse_name}</td>
                <td>{l.aisle}</td>
                <td>{l.shelf}</td>
                <td>{l.bin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
