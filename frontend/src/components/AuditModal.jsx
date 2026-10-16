import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';

export default function AuditModal({ logs = [], onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-shell" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="modal-icon">
              <ShieldCheck size={19} />
            </div>
            <div>
              <div className="kicker" style={{ marginBottom: '4px' }}>Ingestion Integrity</div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                Fleet-Wide Data Sanitization Audit
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Duplicates discarded · sensor spikes rejected · negatives caught · missing data handled.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '7px', borderRadius: '50%' }}>
            <X size={17} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {logs.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={36} style={{ color: '#4cc38a', marginBottom: '8px' }} />
              <p>A pristine dataset — zero sanitization actions required.</p>
            </div>
          ) : (
            <div className="data-table-wrap" style={{ background: 'transparent', backdropFilter: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Plant</th>
                    <th>Field</th>
                    <th>Raw Anomaly</th>
                    <th>Action</th>
                    <th>Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-main)' }}>{log.date}</td>
                      <td style={{ color: '#e6b450', fontWeight: 600 }}>{log.site_id}</td>
                      <td style={{ color: '#e6b450', fontWeight: 600 }}>{log.field}</td>
                      <td style={{ color: '#e5604c' }}>{log.raw_value || 'None (blank)'}</td>
                      <td>
                        <span
                          style={{
                            background: 'rgba(111, 181, 216, 0.12)',
                            border: '1px solid rgba(111, 181, 216, 0.3)',
                            color: '#6fb5d8',
                            padding: '2px 9px',
                            borderRadius: '5px',
                            fontSize: '0.7rem',
                            fontWeight: 650,
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {log.action_taken}
                        </span>
                      </td>
                      <td>{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
}
