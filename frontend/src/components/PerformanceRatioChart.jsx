import React, { useState } from 'react';

export default function PerformanceRatioChart({ readings = [], issues = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!readings || readings.length === 0) {
    return <div className="empty-state">No PR data available.</div>;
  }

  const width = 1000;
  const height = 300;
  const padding = { top: 25, right: 40, bottom: 40, left: 55 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // PR ranges typically 0.0 to 1.0 (with 0.70 and 0.60 key thresholds)
  const yMin = 0.0;
  const yMax = 1.0;

  const n = readings.length;
  const getX = (i) => padding.left + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
  const getY = (prVal) => {
    const clamped = Math.max(yMin, Math.min(yMax, prVal));
    return padding.top + chartH - ((clamped - yMin) / (yMax - yMin)) * chartH;
  };

  const yHealthyLine = getY(0.70);
  const yAttentionLine = getY(0.60);

  // 7-day Rolling PR Path
  let rollingPoints = [];
  readings.forEach((r, i) => {
    if (r.rolling_pr_7d !== null && r.rolling_pr_7d !== undefined) {
      rollingPoints.push({ x: getX(i), y: getY(r.rolling_pr_7d), idx: i });
    }
  });

  const rollingLinePath = rollingPoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  // Daily PR Points (scatter / faint line)
  let dailyPoints = [];
  readings.forEach((r, i) => {
    if (r.pr !== null && r.pr !== undefined && !r.is_outage) {
      dailyPoints.push({ x: getX(i), y: getY(r.pr), idx: i });
    }
  });

  const dailyLinePath = dailyPoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  // Sudden drop dates
  const suddenDropDates = issues
    .filter((iss) => iss.issue_type === 'SUDDEN_DROP')
    .map((iss) => iss.date);

  const hoveredData = hoveredIdx !== null ? readings[hoveredIdx] : null;

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id="healthyZoneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4cc38a" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#4cc38a" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="attentionZoneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2a53c" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#e2a53c" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="dangerZoneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e5604c" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#e5604c" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* Health Threshold Background Bands */}
        {/* Healthy Zone: 0.70 to 1.0 */}
        <rect
          x={padding.left}
          y={getY(1.0)}
          width={chartW}
          height={yHealthyLine - getY(1.0)}
          fill="url(#healthyZoneGrad)"
        />
        {/* Needs Attention Zone: 0.60 to 0.70 */}
        <rect
          x={padding.left}
          y={yHealthyLine}
          width={chartW}
          height={yAttentionLine - yHealthyLine}
          fill="url(#attentionZoneGrad)"
        />
        {/* Underperforming Zone: 0.0 to 0.60 */}
        <rect
          x={padding.left}
          y={yAttentionLine}
          width={chartW}
          height={getY(0.0) - yAttentionLine}
          fill="url(#dangerZoneGrad)"
        />

        {/* 0.70 Threshold Line */}
        <line
          x1={padding.left}
          y1={yHealthyLine}
          x2={width - padding.right}
          y2={yHealthyLine}
          stroke="#4cc38a"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <text
          x={width - padding.right - 5}
          y={yHealthyLine - 5}
          textAnchor="end"
          fill="#4cc38a"
          fontSize="10"
          fontWeight="bold"
        >
          0.70 Healthy Threshold
        </text>

        {/* 0.60 Threshold Line */}
        <line
          x1={padding.left}
          y1={yAttentionLine}
          x2={width - padding.right}
          y2={yAttentionLine}
          stroke="#e2a53c"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <text
          x={width - padding.right - 5}
          y={yAttentionLine - 5}
          textAnchor="end"
          fill="#e2a53c"
          fontSize="10"
          fontWeight="bold"
        >
          0.60 Attention Threshold
        </text>

        {/* Y Axis Gridlines and Labels */}
        {[0.0, 0.2, 0.4, 0.6, 0.7, 0.8, 1.0].map((val, i) => {
          const y = getY(val);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255, 255, 255, 0.05)"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {val.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Daily PR Faint Line */}
        {dailyLinePath && (
          <path
            d={dailyLinePath}
            fill="none"
            stroke="rgba(182, 136, 224, 0.35)"
            strokeWidth="1.2"
          />
        )}

        {/* Daily PR Points */}
        {dailyPoints.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r="2.5"
            fill="rgba(182, 136, 224, 0.6)"
          />
        ))}

        {/* 7-Day Rolling PR Bold Curve */}
        {rollingLinePath && (
          <path
            d={rollingLinePath}
            fill="none"
            stroke="#b688e0"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Sudden Drop Highlight Markers */}
        {readings.map((r, i) => {
          if (suddenDropDates.includes(r.date)) {
            const x = getX(i);
            const y = r.rolling_pr_7d ? getY(r.rolling_pr_7d) : padding.top + 30;
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + chartH}
                  stroke="#e5604c"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
                <circle cx={x} cy={y} r="7" fill="#e5604c" stroke="#fff" strokeWidth="2" />
                <rect x={x - 45} y={padding.top + 8} width="90" height="18" rx="4" fill="#e5604c" />
                <text
                  x={x}
                  y={padding.top + 21}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="9"
                  fontWeight="bold"
                >
                  SUDDEN DROP &gt;20%
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* X Axis Dates */}
        {readings.map((r, i) => {
          const step = Math.max(1, Math.floor(readings.length / 8));
          if (i % step === 0 || i === readings.length - 1) {
            const x = getX(i);
            return (
              <text
                key={i}
                x={x}
                y={height - 10}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
              >
                {r.date.slice(5)}
              </text>
            );
          }
          return null;
        })}

        {/* Interactive Hover Areas */}
        {readings.map((r, i) => {
          const x = getX(i);
          const barW = Math.max(8, chartW / readings.length);
          return (
            <rect
              key={i}
              x={x - barW / 2}
              y={padding.top}
              width={barW}
              height={chartH}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIdx(i)}
            />
          );
        })}

        {/* Active Hover Crosshair Line */}
        {hoveredIdx !== null && (
          <g>
            <line
              x1={getX(hoveredIdx)}
              y1={padding.top}
              x2={getX(hoveredIdx)}
              y2={padding.top + chartH}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1"
            />
            {readings[hoveredIdx].rolling_pr_7d !== null && (
              <circle
                cx={getX(hoveredIdx)}
                cy={getY(readings[hoveredIdx].rolling_pr_7d)}
                r="6"
                fill="#b688e0"
                stroke="#fff"
                strokeWidth="2"
              />
            )}
          </g>
        )}
      </svg>

      {/* Axis Title */}
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: '55px',
          fontSize: '0.75rem',
          fontWeight: '600',
          color: '#b688e0',
        }}
      >
        ▲ Performance Ratio (PR)
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredData && (
        <div
          className="chart-tooltip"
          style={{
            position: 'absolute',
            top: '40px',
            left: `${Math.min(Math.max(10, readings.length > 1 ? (hoveredIdx / (readings.length - 1)) * 85 : 50), 75)}%`,
          }}
        >
          <div className="tooltip-date">📅 {hoveredData.date}</div>
          <div className="tooltip-row">
            <span style={{ color: '#b688e0' }}>7-Day Rolling PR:</span>
            <strong>{hoveredData.rolling_pr_7d !== null ? hoveredData.rolling_pr_7d.toFixed(3) : 'Skipped'}</strong>
          </div>
          <div className="tooltip-row">
            <span style={{ color: 'rgba(182, 136, 224, 0.8)' }}>Single Day PR:</span>
            <span>{hoveredData.pr !== null ? hoveredData.pr.toFixed(3) : (hoveredData.is_outage ? '0.0 (Outage)' : 'N/A')}</span>
          </div>
          <div className="tooltip-row">
            <span style={{ color: '#94a3b8' }}>Status:</span>
            <span
              style={{
                color:
                  hoveredData.status === 'Healthy'
                    ? '#4cc38a'
                    : hoveredData.status === 'Needs attention'
                    ? '#e2a53c'
                    : '#e5604c',
                fontWeight: 600,
              }}
            >
              {hoveredData.status || 'Insufficient Data'}
            </span>
          </div>
          {hoveredData.is_low_irradiance && (
            <div style={{ color: '#6fb5d8', fontSize: '0.75rem', marginTop: '4px' }}>
              ℹ Low Irradiance (&lt;1.0) excluded from average
            </div>
          )}
          {hoveredData.is_outage && (
            <div style={{ color: '#e5604c', fontSize: '0.75rem', marginTop: '4px' }}>
              ⚠ Outage day excluded from rolling PR
            </div>
          )}
        </div>
      )}
    </div>
  );
}
