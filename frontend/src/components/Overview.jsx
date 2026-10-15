import React from 'react';
import {
  Sun,
  Zap,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Layers,
} from 'lucide-react';

export default function Overview({
  fleetData,
  onSelectPlant,
  onViewAudit,
}) {
  if (!fleetData) return null;

  const {
    plants = [],
    total_fleet_capacity_kw = 0,
    total_fleet_generation_kwh = 0,
    fleet_health_summary = {},
    total_outage_events = 0,
    data_quality_issues_count = 0,
  } = fleetData;

  const healthyCount = fleet_health_summary['Healthy'] || 0;
  const attentionCount = fleet_health_summary['Needs attention'] || 0;
  const underperformingCount = fleet_health_summary['Underperforming'] || 0;

  const getStatusClass = (status) => {
    if (status === 'Healthy') return 'healthy';
    if (status === 'Needs attention') return 'attention';
    return 'underperforming';
  };

  const getStatusIcon = (status) => {
    if (status === 'Healthy') return <CheckCircle2 size={14} />;
    if (status === 'Needs attention') return <AlertTriangle size={14} />;
    return <AlertCircle size={14} />;
  };

  return (
    <div>
      {/* Fleet Executive Summary KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Fleet Capacity</span>
            <Zap size={20} className="kpi-icon" style={{ color: '#f59e0b' }} />
          </div>
          <div className="kpi-value">{total_fleet_capacity_kw} <span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>kW</span></div>
          <div className="kpi-subtext">5 Monitored Solar Installations</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">90-Day Energy</span>
            <Sun size={20} className="kpi-icon" style={{ color: '#38bdf8' }} />
          </div>
          <div className="kpi-value">{(total_fleet_generation_kwh / 1000).toFixed(1)} <span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>MWh</span></div>
          <div className="kpi-subtext">{total_fleet_generation_kwh.toLocaleString()} kWh total generation</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Fleet Health Status</span>
            <Activity size={20} className="kpi-icon" style={{ color: '#10b981' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ color: '#10b981', fontWeight: 700, fontSize: '1.5rem' }}>{healthyCount} Healthy</span>
            <span style={{ color: '#64748b' }}>/</span>
            <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '1.1rem' }}>{attentionCount} Attn</span>
            <span style={{ color: '#64748b' }}>/</span>
            <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '1.1rem' }}>{underperformingCount} Under</span>
          </div>
          <div className="kpi-subtext">Based on 7-day rolling Performance Ratio</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Outage Incidents</span>
            <AlertTriangle size={20} className="kpi-icon" style={{ color: total_outage_events > 0 ? '#ef4444' : '#10b981' }} />
          </div>
          <div className="kpi-value" style={{ color: total_outage_events > 0 ? '#ef4444' : '#10b981' }}>
            {total_outage_events}
          </div>
          <div className="kpi-subtext">Zero generation days during sunlight</div>
        </div>
      </div>

      {/* Section Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Solar Plant Fleet Status</h2>
          <p className="section-subtitle">
            Evaluated using 7-day rolling Performance Ratio (PR) excluding outage days &amp; low irradiance (&lt;1.0 kWh/m²)
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onViewAudit}
          title="View data sanitization and anomaly audit log"
        >
          <ShieldCheck size={15} style={{ color: '#10b981' }} />
          <span>Data Quality Audit ({data_quality_issues_count} Events)</span>
        </button>
      </div>

      {/* 5 Plant Cards */}
      <div className="plants-grid">
        {plants.map((plant) => {
          const statusClass = getStatusClass(plant.current_status);
          const prPct = plant.current_pr_7d ? Math.min(100, Math.round(plant.current_pr_7d * 100)) : 0;
          const barColor =
            plant.current_status === 'Healthy'
              ? '#10b981'
              : plant.current_status === 'Needs attention'
              ? '#f59e0b'
              : '#ef4444';

          return (
            <div
              key={plant.site_id}
              className="plant-card"
              onClick={() => onSelectPlant(plant.site_id)}
            >
              <div className="plant-card-top">
                <div className="site-badge">
                  <span className="site-id-tag">{plant.site_id}</span>
                  <span>{plant.name.split(' - ')[0]}</span>
                </div>
                <div className={`status-pill ${statusClass}`}>
                  <span className="status-dot"></span>
                  {getStatusIcon(plant.current_status)}
                  <span>{plant.current_status}</span>
                </div>
              </div>

              {/* Plant Metrics */}
              <div className="plant-stats">
                <div className="stat-item">
                  <span className="stat-title">Capacity</span>
                  <span className="stat-number">{plant.capacity_kw} kW</span>
                </div>
                <div className="stat-item">
                  <span className="stat-title">90-Day Total</span>
                  <span className="stat-number">{(plant.total_generation_kwh / 1000).toFixed(1)} MWh</span>
                </div>
                <div className="stat-item">
                  <span className="stat-title">Current 7d PR</span>
                  <span className="stat-number" style={{ color: barColor }}>
                    {plant.current_pr_7d !== null ? plant.current_pr_7d.toFixed(3) : 'N/A'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-title">Outages</span>
                  <span
                    className="stat-number"
                    style={{ color: plant.outage_days_count > 0 ? '#ef4444' : '#94a3b8' }}
                  >
                    {plant.outage_days_count} {plant.outage_days_count === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>

              {/* PR Meter Bar */}
              <div className="pr-meter-wrap">
                <div className="pr-meter-label">
                  <span>7-Day Rolling PR</span>
                  <strong style={{ color: barColor }}>{prPct}% (Ref: 70%+)</strong>
                </div>
                <div className="pr-bar-bg">
                  <div
                    className="pr-bar-fill"
                    style={{
                      width: `${prPct}%`,
                      backgroundColor: barColor,
                      boxShadow: `0 0 10px ${barColor}`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Active Issue Highlights */}
              <div style={{ marginTop: '16px', flex: 1 }}>
                {plant.active_issues && plant.active_issues.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {plant.active_issues.slice(0, 2).map((iss, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: '0.75rem',
                          background: iss.severity === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          border: `1px solid ${iss.severity === 'critical' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          color: iss.severity === 'critical' ? '#ef4444' : '#f59e0b',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {iss.issue_type === 'SUDDEN_DROP' && <TrendingDown size={13} />}
                        {iss.issue_type === 'OUTAGE' && <AlertTriangle size={13} />}
                        {iss.issue_type === 'GRADUAL_DECLINE' && <Activity size={13} />}
                        <span style={{ fontWeight: 600 }}>{iss.title}</span>
                      </div>
                    ))}
                    {plant.active_issues.length > 2 && (
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'right' }}>
                        +{plant.active_issues.length - 2} more detected issues
                      </span>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#10b981',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <CheckCircle2 size={13} />
                    <span>Operating within optimal performance specifications</span>
                  </div>
                )}
              </div>

              {/* Card Footer Action */}
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'var(--solar-amber-light)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                }}
              >
                <span>View Plant Analytics</span>
                <ArrowRight size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Take-Home Context & Engineering Notes Banner */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={16} style={{ color: '#f59e0b' }} />
            Performance Ratio (PR) Physics
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
            PR accounts for fluctuating sunlight (<span className="mono">generation ÷ [capacity × irradiance]</span>).
            Plant S5 proves that cloudy weather lowers raw generation, but leaves PR healthy (~0.76).
          </p>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} style={{ color: '#a855f7' }} />
            7-Day Rolling Window
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
            Status is judged on the 7-day rolling average to filter daily sensor noise.
            Outages are flagged separately and excluded from the average. Days with irradiance &lt; 1.0 are skipped.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} style={{ color: '#10b981' }} />
            Automated Data Sanitization
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
            Backend pipeline automatically de-duplicates records, filters impossible sensor spikes (e.g. S2 48,210 kWh spike),
            rejects negative readings, and audits missing values.
          </p>
        </div>
      </div>
    </div>
  );
}
