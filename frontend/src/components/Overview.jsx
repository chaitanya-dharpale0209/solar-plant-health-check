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
} from 'lucide-react';

/* ---- Animated counter ---- */
function useCountUp(target, duration = 1100) {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    if (target === null || target === undefined) return undefined;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/* ---- Radial PR gauge ---- */
function PRGauge({ pr, color }) {
  const prValue = pr !== null && pr !== undefined ? pr : 0;
  const animated = useCountUp(prValue);
  const pct = Math.min(100, animated * 100);
  const R = 38;
  const CIRC = 2 * Math.PI * R;
  return (
    <div className="gauge-wrap reveal">
      <svg viewBox="0 0 92 92" width="92" height="92">
        <defs>
          <linearGradient id={`gaugeGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.55" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle cx="46" cy="46" r={R} fill="none" strokeWidth="7" className="gauge-track" />
        <circle
          cx="46"
          cy="46"
          r={R}
          fill="none"
          stroke={`url(#gaugeGrad-${color.replace('#', '')})`}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - pct / 100)}
          transform="rotate(-90 46 46)"
        />
      </svg>
      <div className="gauge-numbers">
        <span className="big">{pr !== null ? animated.toFixed(3) : '—'}</span>
        <span className="small">PR</span>
      </div>
    </div>
  );
}

const STATUS_META = {
  Healthy: { cls: 'healthy', color: '#4cc38a', glow: 'rgba(76,195,138,0.5)' },
  'Needs attention': { cls: 'attention', color: '#e2a53c', glow: 'rgba(226,165,60,0.5)' },
  Underperforming: { cls: 'underperforming', color: '#e5604c', glow: 'rgba(229,96,76,0.5)' },
};

export default function Overview({ fleetData, onSelectPlant, onViewAudit }) {
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

  const capacity = useCountUp(total_fleet_capacity_kw);
  const mwh = useCountUp(total_fleet_generation_kwh / 1000);

  return (
    <div>
      {/* ===== KPI Bento Row ===== */}
      <div className="kpi-grid">
        <div className="kpi-card reveal" style={{ animationDelay: '40ms' }}>
          <div className="kpi-header">
            <span className="kpi-label">Installed Capacity</span>
            <Zap size={18} className="kpi-icon" style={{ color: '#e6b450' }} />
          </div>
          <div className="kpi-value">
            {Math.round(capacity)}
            <span className="kpi-unit">kW</span>
          </div>
          <div className="kpi-subtext">Across 5 monitored installations</div>
        </div>

        <div className="kpi-card reveal" style={{ animationDelay: '100ms' }}>
          <div className="kpi-header">
            <span className="kpi-label">90-Day Energy Yield</span>
            <Sun size={18} className="kpi-icon" style={{ color: '#6fb5d8' }} />
          </div>
          <div className="kpi-value">
            {mwh.toFixed(1)}
            <span className="kpi-unit">MWh</span>
          </div>
          <div className="kpi-subtext">{Math.round(total_fleet_generation_kwh).toLocaleString()} kWh generated total</div>
        </div>

        <div className="kpi-card reveal" style={{ animationDelay: '160ms' }}>
          <div className="kpi-header">
            <span className="kpi-label">Fleet Health</span>
            <Activity size={18} className="kpi-icon" style={{ color: '#4cc38a' }} />
          </div>
          <div className="fleet-composition">
            <span style={{
              flexBasis: `${(healthyCount / plants.length) * 100 || 0}%`,
              minWidth: healthyCount > 0 ? undefined : '0',
              background: 'linear-gradient(90deg,#2f9e6c,#4cc38a)',
            }} />
            <span style={{
              flexBasis: `${(attentionCount / plants.length) * 100}%`,
              background: 'linear-gradient(90deg,#b97f22,#e2a53c)',
            }} />
            <span style={{
              flexBasis: `${(underperformingCount / plants.length) * 100}%`,
              background: 'linear-gradient(90deg,#a63d2d,#e5604c)',
            }} />
          </div>
          <div className="fleet-legend">
            <span className="fleet-legend-item"><span className="legend-pip" style={{ background: '#4cc38a' }} /><strong>{healthyCount}</strong> Healthy</span>
            <span className="fleet-legend-item"><span className="legend-pip" style={{ background: '#e2a53c' }} /><strong>{attentionCount}</strong> Attention</span>
            <span className="fleet-legend-item"><span className="legend-pip" style={{ background: '#e5604c' }} /><strong>{underperformingCount}</strong> Under</span>
          </div>
          <div className="kpi-subtext">Judged on 7-day rolling Performance Ratio</div>
        </div>

        <div className="kpi-card reveal" style={{ animationDelay: '220ms' }}>
          <div className="kpi-header">
            <span className="kpi-label">Outage Incidents</span>
            <AlertTriangle size={18} className="kpi-icon" style={{ color: total_outage_events > 0 ? '#e5604c' : '#4cc38a' }} />
          </div>
          <div className="kpi-value" style={{ color: total_outage_events > 0 ? '#e5604c' : '#4cc38a' }}>
            {total_outage_events}
          </div>
          <div className="kpi-subtext">
            {total_outage_events > 0
              ? 'Zero-generation days during usable sunlight'
              : 'No zero-generation days on record'}
            {' · '}
            <span style={{ color: '#a9a294' }}>{data_quality_issues_count} data anomalies sanitized</span>
          </div>
        </div>
      </div>

      {/* ===== Section header ===== */}
      <div className="section-header reveal">
        <div>
          <div className="kicker">Fleet Registry · 90 Consecutive Days</div>
          <h2 className="section-title">Solar Plant Health</h2>
          <p className="section-subtitle">
            PR = generation ÷ (capacity × irradiance) — outage days &amp; low-irradiance readings excluded from averaging
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onViewAudit}
          title="View data sanitization and anomaly audit log"
        >
          <ShieldCheck size={14} style={{ color: '#4cc38a' }} />
          <span>Audit Log · {data_quality_issues_count} Events</span>
        </button>
      </div>

      {/* ===== Plant cards ===== */}
      <div className="plants-grid">
        {plants.map((plant, idx) => {
          const meta = STATUS_META[plant.current_status] || STATUS_META.Healthy;
          const issueIcon =
            plant.active_issues.length > 0
              ? plant.active_issues[0].issue_type === 'SUDDEN_DROP'
                ? <TrendingDown size={13} />
                : plant.active_issues[0].issue_type === 'GRADUAL_DECLINE'
                ? <Activity size={13} />
                : <AlertTriangle size={13} />
              : null;

          return (
            <div
              key={plant.site_id}
              className="plant-card reveal"
              style={{ animationDelay: `${120 + idx * 70}ms`, '--card-glow': meta.glow }}
              onClick={() => onSelectPlant(plant.site_id)}
            >
              <div className="plant-card-top">
                <div className="site-badge">
                  <span className="site-id-tag">{plant.site_id}</span>
                  <div>
                    <div className="plant-name">{plant.name.split(' - ')[0]}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', letterSpacing: '0.06em', marginTop: '2px' }}>
                      {plant.capacity_kw} kW installed · {plant.total_days} days monitored
                    </div>
                  </div>
                </div>
                <div className={`status-pill ${meta.cls}`}>
                  <span className="status-dot" />
                  {meta.cls === 'healthy' && <CheckCircle2 size={12} />}
                  {meta.cls === 'attention' && <AlertTriangle size={12} />}
                  {meta.cls === 'underperforming' && <AlertCircle size={12} />}
                  <span>{plant.current_status}</span>
                </div>
              </div>

              {/* Gauge + readings */}
              <div className="plant-card-body">
                <PRGauge pr={plant.current_pr_7d} color={meta.color} />
                <div className="plant-readings">
                  <div className="stat-item">
                    <span className="stat-title">90-Day Yield</span>
                    <span className="stat-number">{(plant.total_generation_kwh / 1000).toFixed(1)} MWh</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-title">Lifetime PR</span>
                    <span className="stat-number" style={{ color: '#b688e0' }}>
                      {plant.lifetime_avg_pr?.toFixed(3) ?? '—'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-title">Outage Days</span>
                    <span className="stat-number" style={{ color: plant.outage_days_count > 0 ? '#e5604c' : '#6f6a5e' }}>
                      {plant.outage_days_count}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-title">Flagged Issues</span>
                    <span className="stat-number" style={{ color: plant.issue_count > 0 ? '#e2a53c' : '#6f6a5e' }}>
                      {plant.issue_count}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signals */}
              <div className="chip-stack">
                {plant.active_issues && plant.active_issues.length > 0 ? (
                  <>
                    {plant.active_issues.slice(0, 2).map((iss, i) => (
                      <div key={i} className={`issue-chip ${iss.severity === 'critical' ? 'critical' : 'warning'}`}>
                        {issueIcon}
                        <span style={{ fontWeight: 600 }}>{iss.title}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.66rem', fontFamily: 'var(--font-mono)', opacity: 0.75 }}>
                          {iss.date}
                        </span>
                      </div>
                    ))}
                    {plant.active_issues.length > 2 && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        +{plant.active_issues.length - 2} more signals
                      </span>
                    )}
                  </>
                ) : (
                  <div className="issue-chip ok">
                    <CheckCircle2 size={13} />
                    <span>Nominal operation — within healthy PR band</span>
                  </div>
                )}
              </div>

              <div className="plant-card-cta">
                <span>Open Analytics</span>
                <ArrowRight size={15} className="arrow" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== Methodology footer ===== */}
      <div className="methodology-grid reveal">
        <div className="method-card">
          <h4><Sun size={15} style={{ color: '#e6b450' }} /> Fair Comparison via PR</h4>
          <p>
            Raw kWh can't compare plants of different sizes under changing weather.
            <span className="mono"> PR = generation ÷ (capacity × irradiance)</span> normalizes both — plant S5 proves
            that heavy cloud depresses kWh output while PR stays healthy at ~0.76.
          </p>
        </div>
        <div className="method-card">
          <h4><Activity size={15} style={{ color: '#b688e0' }} /> 7-Day Rolling Health</h4>
          <p>
            A single day can dip from sensor noise, so status uses the 7-day rolling PR average.
            Outage days are flagged separately and excluded; days with irradiance &lt; 1.0 kWh/m² are skipped.
          </p>
        </div>
        <div className="method-card">
          <h4><ShieldCheck size={15} style={{ color: '#4cc38a' }} /> Sanitized Telemetry</h4>
          <p>
            The ingestion pipeline de-duplicates records, rejects impossible sensor spikes
            (e.g. S2's 48,210 kWh surge), filters negative readings, and audits every correction.
          </p>
        </div>
      </div>
    </div>
  );
}
