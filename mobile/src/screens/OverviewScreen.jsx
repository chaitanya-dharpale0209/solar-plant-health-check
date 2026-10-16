import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../theme/colors';
import KpiCard from '../components/KpiCard';
import PlantCard from '../components/PlantCard';

export default function OverviewScreen({
  fleetData,
  loading,
  error,
  isRefreshing,
  onRefresh,
  onSelectPlant,
  onOpenAudit,
}) {
  if (loading && !fleetData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.solarAmber} />
        <Text style={styles.loadingText}>
          Loading solar fleet telemetry &amp; calculating performance ratios...
        </Text>
      </View>
    );
  }

  if (error && !fleetData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Telemetry Service Offline</Text>
        <Text style={styles.errorDesc}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={onRefresh} activeOpacity={0.7}>
          <Text style={styles.retryBtnText}>Retry Connection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    plants = [],
    total_fleet_capacity_kw = 0,
    total_fleet_generation_kwh = 0,
    fleet_health_summary = {},
    total_outage_events = 0,
    data_quality_issues_count = 0,
  } = fleetData || {};

  const healthyCount = fleet_health_summary['Healthy'] || 0;
  const attentionCount = fleet_health_summary['Needs attention'] || 0;
  const underperformingCount = fleet_health_summary['Underperforming'] || 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.solarAmber}
          colors={[COLORS.solarAmber]}
        />
      }
    >
      {/* Fleet Executive Summary KPIs (2x2 Grid) */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCol}>
          <KpiCard
            title="Fleet Capacity"
            value={total_fleet_capacity_kw}
            unit="kW"
            subtext="5 Solar Installations"
            accentColor={COLORS.solarAmber}
          />
        </View>

        <View style={styles.kpiCol}>
          <KpiCard
            title="90-Day Energy"
            value={(total_fleet_generation_kwh / 1000).toFixed(1)}
            unit="MWh"
            subtext={`${Math.round(total_fleet_generation_kwh).toLocaleString()} kWh`}
            accentColor={COLORS.solarSky}
          />
        </View>

        <View style={styles.kpiCol}>
          <KpiCard
            title="Fleet Health"
            customContent={
              <View style={styles.healthRow}>
                <Text style={styles.healthHealthy}>{healthyCount} Good</Text>
                <Text style={styles.healthDivider}>/</Text>
                <Text style={styles.healthAttn}>{attentionCount} Attn</Text>
                <Text style={styles.healthDivider}>/</Text>
                <Text style={styles.healthUnder}>{underperformingCount} Under</Text>
              </View>
            }
            subtext="Based on 7-day rolling PR"
            accentColor={COLORS.healthy}
          />
        </View>

        <View style={styles.kpiCol}>
          <KpiCard
            title="Outage Events"
            value={total_outage_events}
            unit="days"
            subtext="0 kWh during usable sunlight"
            accentColor={total_outage_events > 0 ? COLORS.outage : COLORS.healthy}
          />
        </View>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Solar Plant Fleet Status</Text>
          <Text style={styles.sectionSubtitle}>
            Evaluated using 7-day rolling Performance Ratio (PR)
          </Text>
        </View>

        <TouchableOpacity
          style={styles.auditTriggerBtn}
          onPress={onOpenAudit}
          activeOpacity={0.7}
        >
          <Text style={styles.auditTriggerIcon}>🛡️</Text>
          <Text style={styles.auditTriggerText}>
            Audit ({data_quality_issues_count})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 5 Plant Cards */}
      {plants.map((plant) => (
        <PlantCard
          key={plant.site_id}
          plant={plant}
          onPress={() => onSelectPlant(plant.site_id)}
        />
      ))}

      {/* Physics & Domain Context Information Card */}
      <View style={styles.notesCard}>
        <Text style={styles.notesHeading}>☀️ Performance Ratio (PR) Physics</Text>
        <Text style={styles.notesBody}>
          PR isolates hardware health from cloudy weather:{'\n'}
          <Text style={styles.mono}>PR = generation_kwh ÷ [capacity_kw × irradiance]</Text>
          {'\n\n'}
          Notice <Text style={{ color: COLORS.solarSky, fontWeight: '700' }}>Plant S5</Text>: Low generation due to cloud cover, but its PR remains robust (~0.76), proving the plant is physically healthy.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  errorDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 18,
  },
  retryBtn: {
    backgroundColor: COLORS.solarAmber,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: COLORS.radiusMd,
  },
  retryBtnText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 13,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCol: {
    width: '48.5%',
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 3,
  },
  healthHealthy: {
    color: COLORS.healthy,
    fontWeight: '800',
    fontSize: 13,
  },
  healthAttn: {
    color: COLORS.attention,
    fontWeight: '700',
    fontSize: 12,
  },
  healthUnder: {
    color: COLORS.underperforming,
    fontWeight: '700',
    fontSize: 12,
  },
  healthDivider: {
    color: COLORS.textDim,
    fontSize: 11,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  auditTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: COLORS.radiusSm,
    gap: 4,
  },
  auditTriggerIcon: {
    fontSize: 11,
  },
  auditTriggerText: {
    color: COLORS.healthy,
    fontSize: 11,
    fontWeight: '700',
  },
  notesCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: COLORS.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 16,
    marginTop: 6,
  },
  notesHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  notesBody: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  mono: {
    fontFamily: 'monospace',
    color: COLORS.solarAmberLight,
  },
});
