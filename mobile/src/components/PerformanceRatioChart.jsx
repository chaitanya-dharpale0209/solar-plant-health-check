import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Line,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { COLORS } from '../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PerformanceRatioChart({ readings = [], issues = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [chartWidth, setChartWidth] = useState(SCREEN_WIDTH - 48);

  if (!readings || readings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No Performance Ratio telemetry data available.</Text>
      </View>
    );
  }

  const height = 230;
  const padding = { top: 22, right: 28, bottom: 32, left: 38 };
  const innerW = Math.max(100, chartWidth - padding.left - padding.right);
  const innerH = height - padding.top - padding.bottom;

  // PR ranges 0.0 to 1.0
  const yMin = 0.0;
  const yMax = 1.0;

  const n = readings.length;
  const getX = (i) => padding.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const getY = (prVal) => {
    const clamped = Math.max(yMin, Math.min(yMax, prVal));
    return padding.top + innerH - ((clamped - yMin) / (yMax - yMin)) * innerH;
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

  // Daily PR Points (scatter)
  let dailyPoints = [];
  readings.forEach((r, i) => {
    if (r.pr !== null && r.pr !== undefined && !r.is_outage) {
      dailyPoints.push({ x: getX(i), y: getY(r.pr), idx: i });
    }
  });

  // Sudden drop dates
  const suddenDropDates = issues
    .filter((iss) => iss.issue_type === 'SUDDEN_DROP')
    .map((iss) => iss.date);

  // Touch handler
  const handleTouch = (evt) => {
    const touchX = evt.nativeEvent.locationX;
    const clampedX = Math.max(padding.left, Math.min(chartWidth - padding.right, touchX));
    const ratio = (clampedX - padding.left) / innerW;
    const targetIdx = Math.round(ratio * (n - 1));
    const safeIdx = Math.max(0, Math.min(n - 1, targetIdx));
    setHoveredIdx(safeIdx);
  };

  const selectedReading = hoveredIdx !== null ? readings[hoveredIdx] : null;

  return (
    <View
      style={styles.card}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) setChartWidth(w);
      }}
    >
      {/* Title & Legend */}
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>Performance Ratio (PR) &amp; Health Trend</Text>
          <Text style={styles.chartSubtitle}>
            Thresholds: Healthy (&ge; 0.70) &bull; Attention (0.60–0.70) &bull; Underperforming (&lt; 0.60)
          </Text>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicator, { backgroundColor: COLORS.prTrend }]} />
            <Text style={styles.legendText}>7d Rolling PR</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicator, { backgroundColor: COLORS.healthy }]} />
            <Text style={styles.legendText}>0.70 Ref</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicator, { backgroundColor: COLORS.attention }]} />
            <Text style={styles.legendText}>0.60 Ref</Text>
          </View>
        </View>
      </View>

      {/* SVG Canvas */}
      <View
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
        onResponderRelease={() => {}}
      >
        <Svg width={chartWidth} height={height}>
          <Defs>
            <LinearGradient id="healthyZone" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#10b981" stopOpacity="0.14" />
              <Stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
            </LinearGradient>
            <LinearGradient id="attentionZone" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.14" />
              <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0.04" />
            </LinearGradient>
            <LinearGradient id="dangerZone" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.16" />
              <Stop offset="100%" stopColor="#ef4444" stopOpacity="0.04" />
            </LinearGradient>
          </Defs>

          {/* Background Bands */}
          {/* Healthy Zone: 0.70 to 1.0 */}
          <Rect
            x={padding.left}
            y={getY(1.0)}
            width={innerW}
            height={yHealthyLine - getY(1.0)}
            fill="url(#healthyZone)"
          />
          {/* Attention Zone: 0.60 to 0.70 */}
          <Rect
            x={padding.left}
            y={yHealthyLine}
            width={innerW}
            height={yAttentionLine - yHealthyLine}
            fill="url(#attentionZone)"
          />
          {/* Underperforming Zone: 0.0 to 0.60 */}
          <Rect
            x={padding.left}
            y={yAttentionLine}
            width={innerW}
            height={getY(0.0) - yAttentionLine}
            fill="url(#dangerZone)"
          />

          {/* 0.70 Healthy Threshold Line */}
          <Line
            x1={padding.left}
            y1={yHealthyLine}
            x2={chartWidth - padding.right}
            y2={yHealthyLine}
            stroke="#10b981"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />

          {/* 0.60 Attention Threshold Line */}
          <Line
            x1={padding.left}
            y1={yAttentionLine}
            x2={chartWidth - padding.right}
            y2={yAttentionLine}
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />

          {/* Y Axis Grid & Labels */}
          {[0.0, 0.3, 0.6, 0.7, 1.0].map((val, i) => {
            const y = getY(val);
            return (
              <G key={i}>
                <SvgText
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="9"
                  fontWeight="600"
                >
                  {val.toFixed(2)}
                </SvgText>
              </G>
            );
          })}

          {/* Daily PR Scatter Dots */}
          {dailyPoints.map((pt, i) => (
            <Circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="2"
              fill="rgba(168, 85, 247, 0.6)"
            />
          ))}

          {/* 7-Day Rolling PR Bold Curve */}
          {rollingLinePath ? (
            <Path
              d={rollingLinePath}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {/* Sudden Drop Highlight Markers */}
          {readings.map((r, i) => {
            if (suddenDropDates.includes(r.date)) {
              const x = getX(i);
              const y = r.rolling_pr_7d ? getY(r.rolling_pr_7d) : padding.top + 30;
              return (
                <G key={i}>
                  <Line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + innerH}
                    stroke="#ef4444"
                    strokeWidth="1.8"
                    strokeDasharray="3 3"
                  />
                  <Circle cx={x} cy={y} r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                  <Rect
                    x={x - 40}
                    y={padding.top + 6}
                    width="80"
                    height="16"
                    rx="4"
                    fill="#ef4444"
                  />
                  <SvgText
                    x={x}
                    y={padding.top + 18}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="7.5"
                    fontWeight="bold"
                  >
                    SUDDEN DROP &gt;20%
                  </SvgText>
                </G>
              );
            }
            return null;
          })}

          {/* Date Axis */}
          {readings.map((r, i) => {
            const step = Math.max(1, Math.floor(readings.length / 5));
            if (i % step === 0 || i === readings.length - 1) {
              const x = getX(i);
              return (
                <SvgText
                  key={i}
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                >
                  {r.date ? r.date.slice(5) : ''}
                </SvgText>
              );
            }
            return null;
          })}

          {/* Hover Crosshair */}
          {hoveredIdx !== null && (
            <G>
              <Line
                x1={getX(hoveredIdx)}
                y1={padding.top}
                x2={getX(hoveredIdx)}
                y2={padding.top + innerH}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1"
              />
              {readings[hoveredIdx].rolling_pr_7d !== null && (
                <Circle
                  cx={getX(hoveredIdx)}
                  cy={getY(readings[hoveredIdx].rolling_pr_7d)}
                  r="5"
                  fill="#a855f7"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
            </G>
          )}
        </Svg>
      </View>

      <Text style={styles.touchTip}>
        👆 Touch or drag across the chart to view Performance Ratios
      </Text>

      {/* Selected Day PR Card */}
      {selectedReading && (
        <View style={styles.tooltipCard}>
          <View style={styles.tooltipHeader}>
            <Text style={styles.tooltipDate}>📅 {selectedReading.date}</Text>
            <Text
              style={[
                styles.tooltipStatus,
                {
                  color:
                    selectedReading.status === 'Healthy'
                      ? COLORS.healthy
                      : selectedReading.status === 'Needs attention'
                      ? COLORS.attention
                      : COLORS.underperforming,
                },
              ]}
            >
              {selectedReading.status || 'Insufficient Data'}
            </Text>
          </View>

          <View style={styles.tooltipGrid}>
            <View style={styles.tooltipItem}>
              <Text style={styles.tooltipLabel}>7-Day Rolling PR</Text>
              <Text style={[styles.tooltipValue, { color: COLORS.prTrend }]}>
                {selectedReading.rolling_pr_7d !== null
                  ? selectedReading.rolling_pr_7d.toFixed(3)
                  : 'Skipped'}
              </Text>
            </View>

            <View style={styles.tooltipItem}>
              <Text style={styles.tooltipLabel}>Single-Day PR</Text>
              <Text style={[styles.tooltipValue, { color: '#ffffff' }]}>
                {selectedReading.pr !== null
                  ? selectedReading.pr.toFixed(3)
                  : selectedReading.is_outage
                  ? '0.000 (Outage)'
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: COLORS.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 16,
    marginBottom: 18,
  },
  chartHeader: {
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  chartSubtitle: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendIndicator: {
    width: 10,
    height: 3,
    borderRadius: 1.5,
  },
  legendText: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  touchTip: {
    fontSize: 10,
    color: COLORS.textDim,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
  tooltipCard: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: COLORS.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 12,
    marginTop: 12,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tooltipDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  tooltipStatus: {
    fontSize: 11,
    fontWeight: '700',
  },
  tooltipGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  tooltipItem: {
    flex: 1,
  },
  tooltipLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  tooltipValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
