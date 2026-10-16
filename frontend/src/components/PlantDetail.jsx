import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Activity,
  Table,
  ShieldCheck,
  TrendingDown,
  RotateCcw,
} from 'lucide-react';
import GenerationIrradianceChart from './GenerationIrradianceChart';
import PerformanceRatioChart from './PerformanceRatioChart';

const STATUS_META = {
  Healthy: { cls: 'healthy', color: '#4cc38a' },
  'Needs attention': { cls: 'attention', color: '#e2a53c' },
  Underperforming: { cls: 'underperforming', color: '#e5604c' },
};

function IssueIcon({ type, size = 13 }) {
  if (type === 'SUDDEN_DROP') return <TrendingDown size={size} />;
  if (type === 'GRADUAL_DECLINE') return <Activity size={size} />;
  return <AlertTriangle size={size} />;
}

export default function PlantDetail({
  plantData,
  onBack,
  onDateFilterChange,
  filterStartDate,
  filterEndDate,
}) {
  const [activeTab, setActiveTab] = useState('charts');
  const [highlightDate, setHighlightDate] = useState(null);

  const presetKeys = useMemo(
    () => ({
      'All 90d': ['', ''],
      'Jan': ['2026-01-01', '2026-01-31'],
      'Feb': ['2026-02-01', '2026-02-28'],
      'Mar': ['2026-03-01', '2026-03-31'],
      'First 14d': ['2026-01-01', '2026-01-14'],
      'Last 14d': ['2026-03-18', '2026-03-31'],
    }),
    []
  );

  const activePreset = Object.entries(presetKeys).find(
    ([, range]) => range[0] === (filterStartDate || '') && range[1] === (filterEndDate || '')
  )?.[0];

  if (!plantData || !plantData.plant) {
    return (
      <div className="loading-box">
        <div className="spinner" />
        <p>Loading plant telemetry…</p>
      </div>
    );
  }

  const { plant, daily_readings = [], issues = [], data_quality_log = [] } = plantData;
  const meta = STATUS_META[plant.current_status] || STATUS_META.Healthy;

  const filteredTotalGen = daily_readings.reduce(
    (acc, r) => acc + (r.generation_kwh || 0),
    0
  );

  const handlePreset = (preset) => {
    const [start, end] = presetKeys[preset];
    onDateFilterChange(start, end);
  };

  const tabs = [
    { id: 'charts', label: 'Telemetry & PR', icon: Activity, count: null },
    { id: 'issues', label: 'Diagnostic Log', icon: AlertTriangle, count: issues.length },
    { id: 'telemetry', label: 'Daily Data', icon: Table, count: daily_readings.length },
    { id: 'quality', label: 'Data Quality', icon: ShieldCheck, count: data_quality_log.length },
  ];

  return (
    <div>
      {/* ===== Top bar ===== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
        }}
      >
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Fleet Overview</span>
        </button>
        <span
          className="site-id-tag"
          style={{ fontSize: '0.85rem', fontWeight: 700 }}
        >
          {plant.site_id}
        </span>
      </div>

      {/* ===== Hero ===== */}
      <div className="glass-panel detail-hero reveal">
        <div>
          <div className="kicker">Plant Performance Dossier</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <h1>{plant.name}</h1>
            <div className={`status-pill ${meta.cls}`}>
              <span className="status-dot" />
              {meta.cls === 'healthy' && <CheckCircle2 size={12} />}
              {meta.cls === 'attention' && <AlertTriangle size={12} />}
              {meta.cls === 'underperforming' && <AlertCircle size={12} />}
              <span>{plant.current_status}</span>
            </div>
          </div>
          <p className="hero-meta">
            Monitoring window <strong>{plant.first_date}</strong> → <strong>{plant.last_date}</strong>
          </p>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="stat-title">7-Day PR</span>
            <span className="stat-number" style={{ color: meta.color }}>
              {plant.current_pr_7d != null ? plant.current_pr_7d.toFixed(3) : 'N/A'}
            </span>
          </div>
          <div className="hero-stat">
            <span className="stat-title">Lifetime PR</span>
            <span className="stat-number" style={{ color: '#b688e0' }}>
              {plant.lifetime_avg_pr != null ? plant.lifetime_avg_pr.toFixed(3) : 'N/A'}
            </span>
          </div>
          <div className="hero-stat">
            <span className="stat-title">Outages</span>
            <span
              className="stat-number"
              style={{ color: plant.outage_days_count > 0 ? '#e5604c' : '#4cc38a' }}
            >
              {plant.outage_days_count}
            </span>
          </div>
          <div className="hero-stat">
            <span className="stat-title">Window Yield</span>
            <span className="stat-number" style={{ color: '#e6b450' }}>
              {(filteredTotalGen / 1000).toFixed(1)} MWh
            </span>
          </div>
        </div>
      </div>

      {/* ===== Date range filter ===== */}
      <div className="filter-toolbar reveal" style={{ animationDelay: '80ms' }}>
        <div className="filter-group">
          <Calendar size={16} style={{ color: 'var(--gold)' }} />
          <span className="filter-label">Range</span>
          <input
            type="date"
            className="date-input"
            value={filterStartDate || ''}
            onChange={(e) => onDateFilterChange(e.target.value, filterEndDate)}
          />
          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>to</span>
          <input
            type="date"
            className="date-input"
            value={filterEndDate || ''}
            onChange={(e) => onDateFilterChange(filterStartDate, e.target.value)}
          />
          {(filterStartDate || filterEndDate) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onDateFilterChange('', '')}
              title="Reset date filter"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="preset-group">
          {Object.keys(presetKeys).map((preset) => (
            <button
              key={preset}
              className={`preset-btn ${activePreset === preset ? 'active' : ''}`}
              onClick={() => handlePreset(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Segmented tabs ===== */}
      <div className="tab-list reveal" style={{ animationDelay: '140ms' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.66rem',
                  opacity: 0.75,
                  background: activeTab === tab.id ? 'rgba(0,0,0,0.14)' : 'rgba(240,234,220,0.07)',
                  borderRadius: '99px',
                  padding: '1px 7px',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ===== Charts ===== */}
      {activeTab === 'charts' && (
        <div>
          <div className="chart-box reveal">
            <div className="chart-header">
              <div className="chart-title-group">
                <h3>Daily Energy Generation vs. Solar Irradiance</h3>
                <p>Actual generation (amber) against incident solar energy (blue). Outage days marked.</p>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-line" style={{ background: '#e6b450', height: '4px' }} />
                  <span>Energy Generation (kWh)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-line" style={{ background: '#6fb5d8', borderStyle: 'dashed' }} />
                  <span>Solar Irradiance (kWh/m²)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#e5604c' }} />
                  <span>Outage Flag</span>
                </div>
              </div>
            </div>
            <GenerationIrradianceChart
              readings={daily_readings}
              onSelectDate={(d) => {
                setHighlightDate(d);
                setActiveTab('telemetry');
              }}
            />
          </div>

          <div className="chart-box reveal" style={{ animationDelay: '60ms' }}>
            <div className="chart-header">
              <div className="chart-title-group">
                <h3>Performance Ratio &amp; 7-Day Rolling Trend</h3>
                <p>Healthy ≥ 0.70 · Needs attention 0.60–0.70 · Underperforming &lt; 0.60</p>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-line" style={{ background: '#b688e0', height: '4px' }} />
                  <span>7-Day Rolling PR</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: 'rgba(182, 136, 224, 0.7)' }} />
                  <span>Daily PR</span>
                </div>
                <div className="legend-item">
                  <span className="legend-line" style={{ background: '#4cc38a', borderStyle: 'dashed' }} />
                  <span>0.70 Threshold</span>
                </div>
                <div className="legend-item">
                  <span className="legend-line" style={{ background: '#e2a53c', borderStyle: 'dashed' }} />
                  <span>0.60 Threshold</span>
                </div>
              </div>
            </div>
            <PerformanceRatioChart readings={daily_readings} issues={issues} />
          </div>
        </div>
      )}

      {/* ===== Diagnostic timeline ===== */}
      {activeTab === 'issues' && (
        <div className="glass-panel reveal">
          <div style={{ marginBottom: '24px' }}>
            <div className="kicker">Diagnostic Log</div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>
              Identified Faults &amp; Pattern Anomalies
            </h3>
            <p className="section-subtitle" style={{ marginTop: '4px' }}>
              Rule-based evaluation — outages, sudden drops &gt; 20%, and gradual declines &gt; 10%. No black-box scoring.
            </p>
          </div>

          {issues.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={40} style={{ color: '#4cc38a', marginBottom: '12px' }} />
              <h4 style={{ color: 'var(--text-main)', marginBottom: '6px' }}>No Performance Issues Detected</h4>
              <p style={{ fontSize: '0.84rem' }}>
                Plant {plant.site_id} is operating within nominal PR parameters with zero unhandled outage events.
              </p>
            </div>
          ) : (
            <div>
              {issues.map((iss, idx) => (
                <div key={idx} className="issue-alert-card">
                  <div className="timeline-rail">
                    <div className={`timeline-node ${iss.severity === 'warning' ? 'warning' : 'critical'}`} />
                    <div className="timeline-stem" />
                  </div>
                  <div className="issue-body">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        marginBottom: '5px',
                      }}
                    >
                      <span className="issue-heading">{iss.title}</span>
                      <span
                        className={`issue-tag ${iss.severity === 'warning' ? 'warning' : 'critical'}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
                      >
                        <IssueIcon type={iss.issue_type} size={11} />
                        {iss.issue_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="issue-detail">{iss.reason}</div>
                    {iss.date && <span className="issue-date-tag">Detected {iss.date}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== Telemetry table ===== */}
      {activeTab === 'telemetry' && (
        <div className="data-table-wrap reveal">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Energy (kWh)</th>
                <th>Irradiance</th>
                <th>Ideal (Cap × Irr)</th>
                <th>Daily PR</th>
                <th>7-Day Rolling</th>
                <th>Cloud</th>
                <th>Temp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {daily_readings.map((r, i) => (
                <tr
                  key={i}
                  className={`${r.is_outage ? 'row-outage' : ''} ${highlightDate === r.date ? 'row-highlight' : ''}`}
                >
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{r.date}</td>
                  <td style={{ color: r.is_outage ? '#e5604c' : '#e6b450', fontWeight: 600 }}>
                    {r.generation_kwh != null ? r.generation_kwh.toFixed(1) : <span style={{ color: '#e5604c' }}>Missing</span>}
                  </td>
                  <td style={{ color: '#6fb5d8' }}>
                    {r.irradiance != null ? r.irradiance.toFixed(2) : <span style={{ color: '#e5604c' }}>Missing</span>}
                  </td>
                  <td>{r.ideal_generation_kwh ? r.ideal_generation_kwh.toFixed(1) : '—'}</td>
                  <td style={{ color: '#b688e0' }}>
                    {r.pr != null ? r.pr.toFixed(3) : r.is_outage ? '0.000' : '—'}
                  </td>
                  <td
                    style={{
                      fontWeight: 700,
                      color:
                        r.rolling_pr_7d != null
                          ? r.rolling_pr_7d >= 0.7
                            ? '#4cc38a'
                            : r.rolling_pr_7d >= 0.6
                            ? '#e2a53c'
                            : '#e5604c'
                          : '#6f6a5e',
                    }}
                  >
                    {r.rolling_pr_7d != null ? r.rolling_pr_7d.toFixed(3) : '—'}
                  </td>
                  <td>{r.cloud_cover != null ? `${r.cloud_cover.toFixed(1)}%` : '—'}</td>
                  <td>{r.temperature != null ? `${r.temperature.toFixed(1)}°C` : '—'}</td>
                  <td>
                    {r.is_outage ? (
                      <span className="status-pill underperforming">Outage</span>
                    ) : r.status ? (
                      <span className={`status-pill ${STATUS_META[r.status]?.cls || 'healthy'}`}>{r.status}</span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== Data quality ===== */}
      {activeTab === 'quality' && (
        <div className="glass-panel reveal">
          <div style={{ marginBottom: '18px' }}>
            <div className="kicker">Ingestion Audit</div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>
              Data Quality Sanitization Log
            </h3>
            <p className="section-subtitle" style={{ marginTop: '4px' }}>
              Every automatic correction applied to raw plant {plant.site_id} telemetry.
            </p>
          </div>
          {data_quality_log.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={36} style={{ color: '#4cc38a', marginBottom: '8px' }} />
              <p>No anomalous or dirty readings encountered for plant {plant.site_id}.</p>
            </div>
          ) : (
            <div className="data-table-wrap" style={{ background: 'transparent', backdropFilter: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Field</th>
                    <th>Raw Value</th>
                    <th>Action</th>
                    <th>Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  {data_quality_log.map((log, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-main)' }}>{log.date}</td>
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
      )}
    </div>
  );
}
