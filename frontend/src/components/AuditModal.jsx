import React from 'react';
import { X, ShieldCheck, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function AuditModal({ logs = [], onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>
                Fleet-Wide Data Sanitization Audit Log
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                System documentation of duplicates discarded, sensor spikes rejected, negative values caught, and missing data handled.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Table */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Field</th>
                  <th>Raw Anomaly</th>
                  <th>Sanitization Action</th>
                  <th>Audit Explanation</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i}>
                    <td className="mono">{log.date}</td>
                    <td style={{ color: '#f59e0b', fontWeight: 600 }}>{log.field}</td>
                    <td className="mono" style={{ color: '#ef4444' }}>{log.raw_value || 'None (Blank)'}</td>
                    <td>
                      <span
                        style={{
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {log.action_taken}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button className="btn btn-primary" onClick={onClose}>
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
}
