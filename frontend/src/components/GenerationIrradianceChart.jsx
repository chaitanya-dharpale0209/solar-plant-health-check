import React, { useState, useRef } from 'react';

export default function GenerationIrradianceChart({ readings = [], onSelectDate }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const containerRef = useRef(null);

  if (!readings || readings.length === 0) {
    return <div className="empty-state">No telemetry readings available for the selected range.</div>;
  }

  // Dimensions
  const width = 1000;
  const height = 340;
  const padding = { top: 25, right: 65, bottom: 45, left: 65 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Max calculations
  const maxGen = Math.max(
    ...readings.map((r) => r.generation_kwh || 0),
    ...readings.map((r) => r.ideal_generation_kwh || 0),
    100
  ) * 1.1;

  const maxIrr = Math.max(...readings.map((r) => r.irradiance || 0), 7) * 1.15;

  const n = readings.length;
  const getX = (i) => padding.left + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
  const getYGen = (val) => padding.top + chartH - (val / maxGen) * chartH;
  const getYIrr = (val) => padding.top + chartH - (val / maxIrr) * chartH;

  // Construct SVG paths
  // Generation Area & Line
  let genLinePoints = [];
  readings.forEach((r, i) => {
    if (r.generation_kwh !== null && r.generation_kwh !== undefined) {
      genLinePoints.push({ x: getX(i), y: getYGen(r.generation_kwh), idx: i });
    }
  });

  const genLinePath = genLinePoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  const genAreaPath =
    genLinePoints.length > 0
      ? `${genLinePath} L ${genLinePoints[genLinePoints.length - 1].x} ${padding.top + chartH} L ${genLinePoints[0].x} ${padding.top + chartH} Z`
      : '';

  // Irradiance Line
  let irrLinePoints = [];
  readings.forEach((r, i) => {
    if (r.irradiance !== null && r.irradiance !== undefined) {
      irrLinePoints.push({ x: getX(i), y: getYIrr(r.irradiance), idx: i });
    }
  });

  const irrLinePath = irrLinePoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  // Outage days
  const outagePoints = readings
    .map((r, i) => ({ ...r, idx: i, x: getX(i) }))
    .filter((r) => r.is_outage);

  const hoveredData = hoveredIdx !== null ? readings[hoveredIdx] : null;

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id="genAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e6b450" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#e6b450" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="irrGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6fb5d8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = padding.top + chartH * (1 - pct);
          const genVal = Math.round(maxGen * pct);
          const irrVal = (maxIrr * pct).toFixed(1);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="4 4"
              />
              {/* Left Y Axis (Generation kWh) */}
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fill="#e6b450"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
              >
                {genVal}
              </text>
              {/* Right Y Axis (Irradiance kWh/m²) */}
              <text
                x={width - padding.right + 10}
                y={y + 4}
                textAnchor="start"
                fill="#6fb5d8"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
              >
                {irrVal}
              </text>
            </g>
          );
        })}

        {/* Generation Area & Line */}
        {genAreaPath && <path d={genAreaPath} fill="url(#genAreaGrad)" />}
        {genLinePath && (
          <path
            d={genLinePath}
            fill="none"
            stroke="#e6b450"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        )}

        {/* Irradiance Line */}
        {irrLinePath && (
          <path
            d={irrLinePath}
            fill="none"
            stroke="#6fb5d8"
            strokeWidth="2"
            strokeDasharray="5 3"
            strokeLinejoin="round"
          />
        )}

        {/* Outage Highlighting Markers */}
        {outagePoints.map((pt, i) => (
          <g key={i} style={{ cursor: 'pointer' }} onClick={() => onSelectDate && onSelectDate(pt.date)}>
            <circle cx={pt.x} cy={padding.top + chartH} r="14" fill="rgba(239, 68, 68, 0.25)" />
            <circle cx={pt.x} cy={padding.top + chartH} r="6" fill="#e5604c" stroke="#fff" strokeWidth="2" />
            <line
              x1={pt.x}
              y1={padding.top}
              x2={pt.x}
              y2={padding.top + chartH}
              stroke="#e5604c"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              opacity="0.8"
            />
            <rect
              x={pt.x - 24}
              y={padding.top + 10}
              width="48"
              height="18"
              rx="4"
              fill="#e5604c"
            />
            <text
              x={pt.x}
              y={padding.top + 23}
              textAnchor="middle"
              fill="#fff"
              fontSize="9"
              fontWeight="bold"
            >
              OUTAGE
            </text>
          </g>
        ))}

        {/* X-axis date labels */}
        {readings.map((r, i) => {
          // Show roughly 8-10 evenly spaced date labels
          const step = Math.max(1, Math.floor(readings.length / 8));
          if (i % step === 0 || i === readings.length - 1) {
            const x = getX(i);
            const formattedDate = r.date.slice(5); // MM-DD
            return (
              <text
                key={i}
                x={x}
                y={height - 12}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                fontFamily="Inter, sans-serif"
              >
                {formattedDate}
              </text>
            );
          }
          return null;
        })}

        {/* Hover Crosshair & Trigger Rectangles */}
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
            {readings[hoveredIdx].generation_kwh !== null && (
              <circle
                cx={getX(hoveredIdx)}
                cy={getYGen(readings[hoveredIdx].generation_kwh)}
                r="5"
                fill="#e6b450"
                stroke="#fff"
                strokeWidth="2"
              />
            )}
            {readings[hoveredIdx].irradiance !== null && (
              <circle
                cx={getX(hoveredIdx)}
                cy={getYIrr(readings[hoveredIdx].irradiance)}
                r="4"
                fill="#6fb5d8"
                stroke="#fff"
                strokeWidth="1.5"
              />
            )}
          </g>
        )}
      </svg>

      {/* Axis Titles */}
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: '60px',
          fontSize: '0.75rem',
          fontWeight: '600',
          color: '#e6b450',
        }}
      >
        ▲ Energy Generated (kWh)
      </div>
      <div
        style={{
          position: 'absolute',
          top: '2px',
          right: '60px',
          fontSize: '0.75rem',
          fontWeight: '600',
          color: '#6fb5d8',
        }}
      >
        Irradiance (kWh/m²) ▲
      </div>

      {/* Interactive Floating Tooltip */}
      {hoveredData && (
        <div
          className="chart-tooltip"
          style={{
            position: 'absolute',
            top: '40px',
            left: `${Math.min(Math.max(10, readings.length > 1 ? (hoveredIdx / (readings.length - 1)) * 85 : 50), 75)}%`,
          }}
        >
          <div className="tooltip-date">
            📅 {hoveredData.date}
            {hoveredData.is_outage && (
              <span style={{ color: '#e5604c', marginLeft: '6px' }}>● OUTAGE</span>
            )}
          </div>
          <div className="tooltip-row">
            <span style={{ color: '#e6b450' }}>● Generation:</span>
            <strong>{hoveredData.generation_kwh !== null ? `${hoveredData.generation_kwh.toFixed(1)} kWh` : 'Missing'}</strong>
          </div>
          <div className="tooltip-row">
            <span style={{ color: '#6fb5d8' }}>--- Irradiance:</span>
            <strong>{hoveredData.irradiance !== null ? `${hoveredData.irradiance.toFixed(2)} kWh/m²` : 'Missing'}</strong>
          </div>
          <div className="tooltip-row">
            <span style={{ color: '#94a3b8' }}>Ideal (Cap × Irr):</span>
            <span>{hoveredData.ideal_generation_kwh ? `${hoveredData.ideal_generation_kwh.toFixed(1)} kWh` : 'N/A'}</span>
          </div>
          <div className="tooltip-row">
            <span style={{ color: '#a855f7' }}>Daily PR:</span>
            <strong>{hoveredData.pr !== null ? hoveredData.pr.toFixed(3) : 'N/A'}</strong>
          </div>
          <div className="tooltip-row">
            <span style={{ color: '#64748b' }}>Cloud / Temp:</span>
            <span>{hoveredData.cloud_cover ?? '—'}% / {hoveredData.temperature ?? '—'}°C</span>
          </div>
          {hoveredData.flags && hoveredData.flags.length > 0 && (
            <div style={{ marginTop: '6px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {hoveredData.flags.map((f, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    fontSize: '0.7rem',
                    background: hoveredData.is_outage ? '#e5604c' : '#e6b450',
                    color: '#fff',
                    padding: '2px 5px',
                    borderRadius: '3px',
                    marginRight: '4px',
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
