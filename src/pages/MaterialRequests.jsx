import { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';

function ItemStock({ item }) {
  const a = item.availability;
  if (!a) return null;
  if (!a.product_found) {
    return <span className="tag tag-low">Not in system</span>;
  }
  return (
    <>
      <span className={`tag ${a.sufficient ? 'tag-ok' : 'tag-low'}`}>
        {a.sufficient ? `In stock (${a.available})` : `Only ${a.available} available`}
      </span>
      {a.scope === 'all' && (
        <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>All warehouses</div>
      )}
    </>
  );
}

function StatusTag({ status }) {
  if (status === 'approved') return <span className="tag tag-ok">Approved</span>;
  if (status === 'rejected') return <span className="tag tag-low">Rejected</span>;
  return <span className="tag tag-pending">Pending</span>;
}

export default function MaterialRequests() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  function load() {
    apiRequest('/material-requests')
      .then(setRequests)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function decide(request, action) {
    const verb = action === 'approve' ? 'Approve' : 'Reject';
    const itemList = request.items.map((i) => `${i.quantity} × ${i.item_name}`).join(', ');
    const extra = action === 'approve' ? ` This will remove: ${itemList} from stock.` : '';
    if (!window.confirm(`${verb} this request from ${request.requester_name}?${extra}`)) return;

    setBusyId(request.request_id);
    setError('');
    try {
      await apiRequest(`/material-requests/${request.request_id}/${action}`, { method: 'POST' });
      load();
    } catch (err) {
      setError(err.message);
      load(); // refresh so the stock check reflects the latest numbers
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Material Requests</h1>
          <p>Incoming requests from maintenance staff. Approving deducts the stock automatically.</p>
        </div>
      </div>

      {error && <p style={{ color: 'var(--warn)', marginBottom: 16 }}>{error}</p>}

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Requested by</th>
              <th>Items</th>
              <th>Needed by</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const pending = r.status === 'sent';
              const canApprove = pending && r.items.length > 0 &&
                r.items.every((i) => i.availability && i.availability.sufficient);
              return (
                <tr key={r.request_id}>
                  <td>
                    {r.requester_name}
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>{r.requester_email}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>{r.warehouse_name}</div>
                  </td>
                  <td>
                    {r.items.map((item) => (
                      <div key={item.request_item_id} style={{ marginBottom: 6 }}>
                        <div>{item.item_name} × {item.quantity}</div>
                        {pending && <ItemStock item={item} />}
                      </div>
                    ))}
                  </td>
                  <td>{r.needed_by ? new Date(r.needed_by).toLocaleString() : '—'}</td>
                  <td><StatusTag status={r.status} /></td>
                  <td style={{ whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                    {pending && (
                      <>
                        <button
                          className="btn"
                          disabled={!canApprove || busyId === r.request_id}
                          onClick={() => decide(r, 'approve')}
                          style={{ padding: '6px 12px', marginRight: 6, opacity: canApprove ? 1 : 0.4 }}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-outline"
                          disabled={busyId === r.request_id}
                          onClick={() => decide(r, 'reject')}
                          style={{ padding: '6px 12px' }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
