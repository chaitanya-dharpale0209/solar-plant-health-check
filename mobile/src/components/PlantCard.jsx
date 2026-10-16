import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, getStatusColor } from '../theme/colors';
import StatusBadge from './StatusBadge';

export default function PlantCard({ plant, onPress }) {
  if (!plant) return null;

  const statusColor = getStatusColor(plant.current_status);
  const prPct = plant.current_pr_7d
    ? Math.min(100, Math.max(0, Math.round(plant.current_pr_7d * 100)))
    : 0;

  const plantShortName = plant.name ? plant.name.split(' - ')[0] : plant.site_id;
  const totalGenMWh = plant.total_generation_kwh
    ? (plant.total_generation_kwh / 1000).toFixed(1)
    : '0.0';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(plant.site_id)}
      activeOpacity={0.78}
    >
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.siteIdentity}>
          <View style={styles.siteBadge}>
            <Text style={styles.siteIdText}>{plant.site_id}</Text>
          </View>
          <Text style={styles.siteName}>{plantShortName}</Text>
        </View>

        <StatusBadge status={plant.current_status} size="sm" />
      </View>

      {/* Grid of Key Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Capacity</Text>
          <Text style={styles.statValue}>{plant.capacity_kw} kW</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>90-Day Gen</Text>
          <Text style={styles.statValue}>{totalGenMWh} MWh</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>7-Day PR</Text>
          <Text style={[styles.statValue, { color: statusColor }]}>
            {plant.current_pr_7d !== null && plant.current_pr_7d !== undefined
              ? Number(plant.current_pr_7d).toFixed(3)
              : 'N/A'}
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Outages</Text>
          <Text
            style={[
              styles.statValue,
              { color: plant.outage_days_count > 0 ? COLORS.outage : COLORS.textMuted },
            ]}
          >
            {plant.outage_days_count} {plant.outage_days_count === 1 ? 'day' : 'days'}
          </Text>
        </View>
      </View>

      {/* Performance Ratio Meter Bar */}
      <View style={styles.meterSection}>
        <View style={styles.meterHeader}>
          <Text style={styles.meterLabel}>7-Day Rolling PR</Text>
          <Text style={[styles.meterValueText, { color: statusColor }]}>
            {prPct}% <Text style={styles.meterRefText}>(Ref: 70%+)</Text>
          </Text>
        </View>

        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              {
                width: `${prPct}%`,
                backgroundColor: statusColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Active Issues / Healthy State Badge */}
      <View style={styles.issueSection}>
        {plant.active_issues && plant.active_issues.length > 0 ? (
          <View style={styles.issueList}>
            {plant.active_issues.slice(0, 2).map((iss, idx) => {
              const isCrit = iss.severity === 'critical';
              return (
                <View
                  key={idx}
                  style={[
                    styles.issuePill,
                    {
                      backgroundColor: isCrit ? COLORS.underperformingBg : COLORS.attentionBg,
                      borderColor: isCrit ? COLORS.underperformingBorder : COLORS.attentionBorder,
                    },
                  ]}
                >
                  <Text style={styles.issueIcon}>
                    {iss.issue_type === 'OUTAGE' ? '⚠️' : iss.issue_type === 'SUDDEN_DROP' ? '📉' : '📊'}
                  </Text>
                  <Text
                    style={[
                      styles.issueText,
                      { color: isCrit ? COLORS.underperforming : COLORS.attention },
                    ]}
                    numberOfLines={1}
                  >
                    {iss.title}
                  </Text>
                </View>
              );
            })}
            {plant.active_issues.length > 2 && (
              <Text style={styles.moreIssuesText}>
                +{plant.active_issues.length - 2} more issues
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.healthyPill}>
            <Text style={styles.healthyIcon}>✓</Text>
            <Text style={styles.healthyText}>Optimal performance &bull; Zero anomalies</Text>
          </View>
        )}
      </View>

      {/* Footer Action */}
      <View style={styles.footerRow}>
        <Text style={styles.footerActionText}>View Plant Telemetry &amp; Charts</Text>
        <Text style={styles.footerArrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: COLORS.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  siteIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  siteBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  siteIdText: {
    color: COLORS.solarAmber,
    fontSize: 12,
    fontWeight: '800',
  },
  siteName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: COLORS.radiusMd,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  meterSection: {
    marginBottom: 14,
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  meterLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  meterValueText: {
    fontSize: 12,
    fontWeight: '700',
  },
  meterRefText: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: '500',
  },
  barBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  issueSection: {
    marginBottom: 12,
  },
  issueList: {
    gap: 6,
  },
  issuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
  },
  issueIcon: {
    fontSize: 12,
  },
  issueText: {
    fontSize: 11.5,
    fontWeight: '600',
    flex: 1,
  },
  moreIssuesText: {
    fontSize: 10.5,
    color: COLORS.textDim,
    textAlign: 'right',
  },
  healthyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.healthyBg,
    borderColor: COLORS.healthyBorder,
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 6,
  },
  healthyIcon: {
    color: COLORS.healthy,
    fontSize: 12,
    fontWeight: '800',
  },
  healthyText: {
    color: COLORS.healthy,
    fontSize: 11.5,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
  },
  footerActionText: {
    color: COLORS.solarAmberLight,
    fontSize: 12,
    fontWeight: '700',
  },
  footerArrow: {
    color: COLORS.solarAmberLight,
    fontSize: 14,
    fontWeight: '800',
  },
});
