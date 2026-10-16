import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
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

export default function GenerationChart({ readings = [], onSelectDate }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [chartWidth, setChartWidth] = useState(SCREEN_WIDTH - 48);

  if (!readings || readings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No telemetry readings available for this date filter.</Text>
      </View>
    );
  }

  const height = 240;
  const padding = { top: 22, right: 40, bottom: 34, left: 45 };
  const innerW = Math.max(100, chartWidth - padding.left - padding.right);
  const innerH = height - padding.top - padding.bottom;

  // Max calculations
  const maxGen = Math.max(
    ...readings.map((r) => r.generation_kwh || 0),
    ...readings.map((r) => r.ideal_generation_kwh || 0),
    50
  ) * 1.1;

  const maxIrr = Math.max(...readings.map((r) => r.irradiance || 0), 6) * 1.15;

  const n = readings.length;
  const getX = (i) => padding.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const getYGen = (val) => padding.top + innerH - (val / maxGen) * innerH;
  const getYIrr = (val) => padding.top + innerH - (val / maxIrr) * innerH;

  // Paths
  let genPoints = [];
  readings.forEach((r, i) => {
    if (r.generation_kwh !== null && r.generation_kwh !== undefined) {
      genPoints.push({ x: getX(i), y: getYGen(r.generation_kwh), idx: i });
    }
  });

  const genLinePath = genPoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  const genAreaPath =
    genPoints.length > 0
      ? `${genLinePath} L ${genPoints[genPoints.length - 1].x} ${padding.top + innerH} L ${genPoints[0].x} ${padding.top + innerH} Z`
      : '';

  let irrPoints = [];
  readings.forEach((r, i) => {
    if (r.irradiance !== null && r.irradiance !== undefined) {
      irrPoints.push({ x: getX(i), y: getYIrr(r.irradiance), idx: i });
    }
  });

  const irrLinePath = irrPoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  // Outages
  const outages = readings
    .map((r, i) => ({ ...r, idx: i, x: getX(i) }))
    .filter((r) => r.is_outage);

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
          <Text style={styles.chartTitle}>Daily Generation vs. Solar Irradiance</Text>
          <Text style={styles.chartSubtitle}>
            Dual-axis tracking actual output (kWh) vs incident sunlight (kWh/m²)
          </Text>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicator, { backgroundColor: COLORS.solarAmber }]} />
            <Text style={styles.legendText}>Gen (kWh)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicator, { backgroundColor: COLORS.solarSky }]} />
            <Text style={styles.legendText}>Irr (kWh/m²)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicator, { backgroundColor: COLORS.outage, borderRadius: 4 }]} />
            <Text style={styles.legendText}>Outage</Text>
          </View>
        </View>
      </View>

      {/* SVG Canvas with Touch Tracking */}
      <View
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
        onResponderRelease={() => {}}
      >
        <Svg width={chartWidth} height={height}>
          <Defs>
            <LinearGradient id="genAreaMobile" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Grid lines & axis labels */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const y = padding.top + innerH * (1 - pct);
            const genVal = Math.round(maxGen * pct);
            const irrVal = (maxIrr * pct).toFixed(1);
            return (
              <G key={i}>
                <Line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeDasharray="4 4"
                />
                <SvgText
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#f59e0b"
                  fontSize="9"
                  fontWeight="600"
                >
                  {genVal}
                </SvgText>
                <SvgText
                  x={chartWidth - padding.right + 6}
                  y={y + 3}
                  textAnchor="start"
                  fill="#38bdf8"
                  fontSize="9"
                  fontWeight="600"
                >
                  {irrVal}
                </SvgText>
              </G>
            );
          })}

          {/* Area fill */}
          {genAreaPath ? <Path d={genAreaPath} fill="url(#genAreaMobile)" /> : null}

          {/* Lines */}
          {genLinePath ? (
            <Path
              d={genLinePath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          ) : null}

          {irrLinePath ? (
            <Path
              d={irrLinePath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeDasharray="4 3"
              strokeLinejoin="round"
            />
          ) : null}

          {/* Outage Indicators */}
          {outages.map((pt, i) => (
            <G key={i}>
              <Circle
                cx={pt.x}
                cy={padding.top + innerH}
                r="10"
                fill="rgba(239, 68, 68, 0.25)"
              />
              <Circle
                cx={pt.x}
                cy={padding.top + innerH}
                r="4.5"
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <Line
                x1={pt.x}
                y1={padding.top + 8}
                x2={pt.x}
                y2={padding.top + innerH}
                stroke="#ef4444"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <Rect
                x={pt.x - 18}
                y={padding.top + 6}
                width="36"
                height="14"
                rx="3"
                fill="#ef4444"
              />
              <SvgText
                x={pt.x}
                y={padding.top + 16}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="7.5"
                fontWeight="bold"
              >
                OUTAGE
              </SvgText>
            </G>
          ))}

          {/* Date Axis (Sparse 5 dates) */}
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
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="1"
              />
              {readings[hoveredIdx].generation_kwh !== null && (
                <Circle
                  cx={getX(hoveredIdx)}
                  cy={getYGen(readings[hoveredIdx].generation_kwh)}
                  r="5"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              )}
              {readings[hoveredIdx].irradiance !== null && (
                <Circle
                  cx={getX(hoveredIdx)}
                  cy={getYIrr(readings[hoveredIdx].irradiance)}
                  r="4"
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              )}
            </G>
          )}
        </Svg>
      </View>

      <Text style={styles.touchTip}>
        👆 Touch or drag across the chart to inspect daily readings
      </Text>

      {/* Selected Day Telemetry Card */}
      {selectedReading && (
        <View style={styles.tooltipCard}>
          <View style={styles.tooltipHeader}>
            <Text style={styles.tooltipDate}>📅 {selectedReading.date}</Text>
            {selectedReading.is_outage ? (
              <View style={styles.outageBadge}>
                <Text style={styles.outageBadgeText}>OUTAGE (0 kWh)</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.tooltipGrid}>
            <View style={styles.tooltipItem}>
              <Text style={styles.tooltipLabel}>Generation</Text>
              <Text style={[styles.tooltipValue, { color: COLORS.solarAmber }]}>
                {selectedReading.generation_kwh !== null
                  ? `${selectedReading.generation_kwh.toFixed(1)} kWh`
                  : 'Missing'}
              </Text>
            </View>

            <View style={styles.tooltipItem}>
              <Text style={styles.tooltipLabel}>Irradiance</Text>
              <Text style={[styles.tooltipValue, { color: COLORS.solarSky }]}>
                {selectedReading.irradiance !== null
                  ? `${selectedReading.irradiance.toFixed(2)} kWh/m²`
                  : 'Missing'}
              </Text>
            </View>

            <View style={styles.tooltipItem}>
              <Text style={styles.tooltipLabel}>Daily PR</Text>
              <Text style={[styles.tooltipValue, { color: COLORS.prTrendLight }]}>
                {selectedReading.pr !== null ? selectedReading.pr.toFixed(3) : 'N/A'}
              </Text>
            </View>

            <View style={styles.tooltipItem}>
              <Text style={styles.tooltipLabel}>7-Day Rolling PR</Text>
              <Text
                style={[
                  styles.tooltipValue,
                  {
                    color:
                      selectedReading.rolling_pr_7d >= 0.7
                        ? COLORS.healthy
                        : selectedReading.rolling_pr_7d >= 0.6
                        ? COLORS.attention
                        : COLORS.underperforming,
                  },
                ]}
              >
                {selectedReading.rolling_pr_7d !== null
                  ? selectedReading.rolling_pr_7d.toFixed(3)
                  : 'Skipped'}
              </Text>
            </View>
          </View>

          {selectedReading.flags && selectedReading.flags.length > 0 ? (
            <View style={styles.flagsRow}>
              {selectedReading.flags.map((flag, idx) => (
                <View key={idx} style={styles.flagPill}>
                  <Text style={styles.flagText}>{flag}</Text>
                </View>
              ))}
            </View>
          ) : null}
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
  outageBadge: {
    backgroundColor: COLORS.outageBg,
    borderColor: COLORS.underperformingBorder,
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  outageBadgeText: {
    color: COLORS.outage,
    fontSize: 9.5,
    fontWeight: '800',
  },
  tooltipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tooltipItem: {
    width: '45%',
  },
  tooltipLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 1,
  },
  tooltipValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  flagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  flagPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  flagText: {
    color: COLORS.solarAmber,
    fontSize: 10,
    fontWeight: '600',
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
