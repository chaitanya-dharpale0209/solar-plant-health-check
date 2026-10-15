import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sun,
  Activity,
  Layers,
  Table,
  ShieldCheck,
  TrendingDown,
  Filter,
  RotateCcw,
} from 'lucide-react';
import GenerationIrradianceChart from './GenerationIrradianceChart';
import PerformanceRatioChart from './PerformanceRatioChart';

export default function PlantDetail({
  plantData,
  onBack,
  onDateFilterChange,
  filterStartDate,
  filterEndDate,
}) {
  const [activeTab, setActiveTab] = useState('charts'); // 'charts' | 'issues' | 'telemetry' | 'quality'
  const [highlightDate, setHighlightDate] = useState(null);

  if (!plantData || !plantData.plant) {
    return <div className="loading-box"><div className="spinner"></div><p>Loading plant telemetry...</p></div>;
  }

  const { plant, daily_readings = [], issues = [], data_quality_log = [] } = plantData;

  const getStatusClass = (status) => {
    if (status === 'Healthy') return 'healthy';
    if (status === 'Needs attention') return 'attention';
    return 'underperforming';
  };

  const getStatusIcon = (status) => {
    if (status === 'Healthy') return <CheckCircle2 size={16} />;
    if (status === 'Needs attention') return <AlertTriangle size={16} />;
    return <AlertCircle size={16} />;
  };

  // Preset Handlers
  const handlePreset = (type) => {
    if (type === 'all') {
      onDateFilterChange('', '');
    } else if (type === 'jan') {
      onDateFilterChange('2026-01-01', '2026-01-31');
    } else if (type === 'feb') {
      onDateFilterChange('2026-02-01', '2026-02-28');
    } else if (type === 'mar') {
      onDateFilterChange('2026-03-01', '2026-03-31');
    } else if (type === 'first14') {
      onDateFilterChange('2026-01-01', '2026-01-14');
    } else if (type === 'last14') {
      onDateFilterChange('2026-03-18', '2026-03-31');
    }
  };

  const filteredTotalGen = daily_readings.reduce(
    (acc, r) => acc + (r.generation_kwh || 0),
    0
  );

  return (
    <div>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Fleet Overview</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Plant ID:</span>
          <span className="site-id-tag" style={{ fontSize: '1rem', fontWeight: 700 }}>
            {plant.site_id}
          </span>
        </div>
      </div>

      {/* Plant Banner Header */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>
              {plant.name}
            </h1>
            <div className={`status-pill ${getStatusClass(plant.current_status)}`} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              <span className="status-dot"></span>
              {getStatusIcon(plant.current_status)}
              <span>{plant.current_status}</span>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Installed Capacity: <strong style={{ color: '#fff' }}>{plant.capacity_kw} kW</strong> &bull; Total Monitored: <strong style={{ color: '#fff' }}>{plant.total_days} Days</strong>
          </p>
        </div>

        {/* Quick KPI stats pills */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block' }}>Current 7d PR</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 700, color: plant.current_status === 'Healthy' ? '#10b981' : plant.current_status === 'Needs attention' ? '#f59e0b' : '#ef4444' }}>
              {plant.current_pr_7d !== null ? plant.current_pr_7d.toFixed(3) : 'N/A'}
            </span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block' }}>Lifetime Avg PR</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#a855f7' }}>
              {plant.lifetime_avg_pr !== null ? plant.lifetime_avg_pr.toFixed(3) : 'N/A'}
            </span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block' }}>Outages</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 700, color: plant.outage_days_count > 0 ? '#ef4444' : '#10b981' }}>
              {plant.outage_days_count}
            </span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block' }}>Total Gen</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f59e0b' }}>
              {(filteredTotalGen / 1000).toFixed(1)} MWh
            </span>
          </div>
        </div>
      </div>

      {/* Date Range Filter Toolbar (Bonus Feature) */}
      <div className="filter-toolbar">
        <div className="filter-group">
          <Calendar size={18} style={{ color: 'var(--solar-amber)' }} />
          <span className="filter-label">Filter Date Range:</span>

          <input
            type="date"
            className="date-input"
            value={filterStartDate || ''}
            onChange={(e) => onDateFilterChange(e.target.value, filterEndDate)}
            placeholder="Start Date"
          />
          <span style={{ color: 'var(--text-dim)' }}>to</span>
          <input
            type="date"
            className="date-input"
            value={filterEndDate || ''}
            onChange={(e) => onDateFilterChange(filterStartDate, e.target.value)}
            placeholder="End Date"
          />

          {(filterStartDate || filterEndDate) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onDateFilterChange('', '')}
              title="Reset Date Filter"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Quick Range Presets */}
        <div className="filter-group">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Presets:</span>
          <button className="btn btn-secondary btn-sm" onClick={() => handlePreset('all')}>All 90 Days</button>
          <button className="btn btn-secondary btn-sm" onClick={() => handlePreset('jan')}>Jan</button>
          <button className="btn btn-secondary btn-sm" onClick={() => handlePreset('feb')}>Feb</button>
          <button className="btn btn-secondary btn-sm" onClick={() => handlePreset('mar')}>Mar</button>
          <button className="btn btn-secondary btn-sm" onClick={() => handlePreset('first14')}>First 14d</button>
          <button className="btn btn-secondary btn-sm" onClick={() => handlePreset('last14')}>Last 14d</button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-list">
        <button
          className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          <Activity size={15} style={{ display: 'inline', marginRight: '6px' }} />
          Telemetry &amp; PR Charts
        </button>
        <button
          className={`tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
          onClick={() => setActiveTab('issues')}
        >
          <AlertTriangle size={15} style={{ display: 'inline', marginRight: '6px' }} />
          Detected Issues &amp; Diagnostic Log ({issues.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
          onClick={() => setActiveTab('telemetry')}
        >
          <Table size={15} style={{ display: 'inline', marginRight: '6px' }} />
          Daily Telemetry Data ({daily_readings.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'quality' ? 'active' : ''}`}
          onClick={() => setActiveTab('quality')}
        >
          <ShieldCheck size={15} style={{ display: 'inline', marginRight: '6px' }} />
          Data Quality Sanitization ({data_quality_log.length})
        </button>
      </div>

      {/* Tab Content 1: CHARTS */}
      {activeTab === 'charts' && (
        <div>
          {/* Chart 1: Generation vs Irradiance */}
          <div className="chart-box">
            <div className="chart-header">
              <div className="chart-title-group">
                <h3>Daily Energy Generation vs. Solar Irradiance</h3>
                <p>Compares actual generation (kWh) against incident solar energy (kWh/m²). Problem days highlighted.</p>
              </div>

              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-line" style={{ background: '#f59e0b', height: '4px' }}></span>
                  <span>Energy Generation (kWh)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-line" style={{ background: '#38bdf8', borderStyle: 'dashed' }}></span>
                  <span>Solar Irradiance (kWh/m²)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#ef4444' }}></span>
                  <span>Outage Flag (0 kWh)</span>
                </div>
              </div>
            </div>

            <GenerationIrradianceChart
              readings={daily_readings}
              onSelectDate={(d) => setHighlightDate(d)}
            />
          </div>

          {/* Chart 2: Performance Ratio with Thresholds */}
          <div className="chart-box">
            <div className="chart-header">
              <div className="chart-title-group">
                <h3>Performance Ratio (PR) &amp; 7-Day Rolling Health Trend</h3>
                <p>Status thresholds: Healthy (PR &ge; 0.70), Needs Attention (0.60 &ndash; 0.70), Underperforming (&lt; 0.60)</p>
              </div>

              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-line" style={{ background: '#a855f7', height: '4px' }}></span>
                  <span>7-Day Rolling PR</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: 'rgba(168, 85, 247, 0.7)' }}></span>
                  <span>Daily PR Point</span>
                </div>
                <div className="legend-item">
                  <span className="legend-line" style={{ background: '#10b981', borderStyle: 'dashed' }}></span>
                  <span>0.70 Threshold</span>
                </div>
                <div className="legend-item">
                  <span className="legend-line" style={{ background: '#f59e0b', borderStyle: 'dashed' }}></span>
                  <span>0.60 Threshold</span>
                </div>
              </div>
            </div>

            <PerformanceRatioChart
              readings={daily_readings}
              issues={issues}
            />
          </div>
        </div>
      )}

      {/* Tab Content 2: DETECTED ISSUES & DIAGNOSTICS */}
      {activeTab === 'issues' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '4px' }}>
              Identified Operational Faults &amp; Pattern Anomaly Report
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Rule-based evaluation detecting outages, sudden drops, and gradual degradation without black-box ML.
            </p>
          </div>

          {issues.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={40} style={{ color: '#10b981', marginBottom: '12px' }} />
              <h4 style={{ color: '#fff', marginBottom: '6px' }}>No Performance Issues Detected</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Plant {plant.site_id} is operating within nominal PR parameters with zero unhandled outage events.
              </p>
            </div>
          ) : (
            <div>
              {issues.map((iss, idx) => (
                <div
                  key={idx}
                  className={`issue-alert-card ${iss.severity === 'warning' ? 'warning' : ''}`}
                >
                  <div className="issue-icon-wrap">
                    {iss.issue_type === 'OUTAGE' && <AlertTriangle size={20} />}
                    {iss.issue_type === 'SUDDEN_DROP' && <TrendingDown size={20} />}
                    {iss.issue_type === 'GRADUAL_DECLINE' && <Activity size={20} />}
                  </div>

                  <div className="issue-content">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div className="issue-heading">{iss.title}</div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: iss.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: iss.severity === 'critical' ? '#ef4444' : '#f59e0b',
                        }}
                      >
                        {iss.issue_type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="issue-detail">{iss.reason}</div>

                    {iss.date && (
                      <span className="issue-date-tag">
                        Detected Date: {iss.date}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: TELEMETRY TABLE */}
      {activeTab === 'telemetry' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Energy (kWh)</th>
                <th>Irradiance (kWh/m²)</th>
                <th>Ideal (Cap × Irr)</th>
                <th>Daily PR</th>
                <th>7-Day Rolling PR</th>
                <th>Cloud (%)</th>
                <th>Temp (°C)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {daily_readings.map((r, i) => (
                <tr
                  key={i}
                  className={r.is_outage ? 'row-outage' : ''}
                  style={highlightDate === r.date ? { background: 'rgba(245, 158, 11, 0.15)' } : {}}
                >
                  <td className="mono" style={{ fontWeight: 600 }}>{r.date}</td>
                  <td style={{ color: r.is_outage ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>
                    {r.generation_kwh !== null ? r.generation_kwh.toFixed(1) : <span style={{ color: '#ef4444' }}>Missing</span>}
                  </td>
                  <td style={{ color: '#38bdf8' }}>
                    {r.irradiance !== null ? r.irradiance.toFixed(2) : <span style={{ color: '#ef4444' }}>Missing</span>}
                  </td>
                  <td style={{ color: '#94a3b8' }}>
                    {r.ideal_generation_kwh ? r.ideal_generation_kwh.toFixed(1) : '—'}
                  </td>
                  <td className="mono" style={{ color: '#a855f7' }}>
                    {r.pr !== null ? r.pr.toFixed(3) : (r.is_outage ? '0.000' : '—')}
                  </td>
                  <td className="mono" style={{ fontWeight: 700, color: r.rolling_pr_7d >= 0.7 ? '#10b981' : r.rolling_pr_7d >= 0.6 ? '#f59e0b' : '#ef4444' }}>
                    {r.rolling_pr_7d !== null ? r.rolling_pr_7d.toFixed(3) : '—'}
                  </td>
                  <td>{r.cloud_cover !== null ? `${r.cloud_cover.toFixed(1)}%` : '—'}</td>
                  <td>{r.temperature !== null ? `${r.temperature.toFixed(1)}°C` : '—'}</td>
                  <td>
                    {r.is_outage ? (
                      <span className="status-pill underperforming">Outage</span>
                    ) : r.status ? (
                      <span className={`status-pill ${getStatusClass(r.status)}`}>
                        {r.status}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content 4: DATA QUALITY & SANITIZATION */}
      {activeTab === 'quality' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '4px' }}>
              Data Quality Sanitization &amp; Audit Log
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              All dirty data handling actions applied automatically on plant {plant.site_id}.
            </p>
          </div>

          {data_quality_log.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={36} style={{ color: '#10b981', marginBottom: '8px' }} />
              <p>No anomalous or dirty readings encountered for plant {plant.site_id}.</p>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Field</th>
                    <th>Raw Value</th>
                    <th>Action Taken</th>
                    <th>Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  {data_quality_log.map((log, i) => (
                    <tr key={i}>
                      <td className="mono">{log.date}</td>
                      <td style={{ color: '#f59e0b', fontWeight: 600 }}>{log.field}</td>
                      <td className="mono" style={{ color: '#ef4444' }}>{log.raw_value || 'None (Blank)'}</td>
                      <td>
                        <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {log.action_taken}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
