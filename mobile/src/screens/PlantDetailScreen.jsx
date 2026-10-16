import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { COLORS, getStatusColor } from '../theme/colors';
import StatusBadge from '../components/StatusBadge';
import GenerationChart from '../components/GenerationChart';
import PerformanceRatioChart from '../components/PerformanceRatioChart';
import IssueCard from '../components/IssueCard';
import DateFilterToolbar from '../components/DateFilterToolbar';
import TelemetryTable from '../components/TelemetryTable';

export default function PlantDetailScreen({
  plantData,
  loading,
  onBack,
  onDateFilterChange,
  filterStartDate,
  filterEndDate,
}) {
  const [activeTab, setActiveTab] = useState('charts'); // 'charts' | 'issues' | 'telemetry' | 'quality'

  if (loading || !plantData || !plantData.plant) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.solarAmber} />
        <Text style={styles.loadingText}>Loading plant analytics &amp; PR metrics...</Text>
      </View>
    );
  }

  const {
    plant = {},
    daily_readings = [],
    issues = [],
    data_quality_log = [],
  } = plantData;

  const statusColor = getStatusColor(plant.current_status);

  const filteredTotalGenKWh = daily_readings.reduce(
    (acc, r) => acc + (r.generation_kwh || 0),
    0
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Plant Banner Header */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerTopRow}>
          <View style={styles.bannerIdentity}>
            <View style={styles.siteIdTag}>
              <Text style={styles.siteIdText}>{plant.site_id}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.plantTitle} numberOfLines={1}>
                {plant.name || `Plant ${plant.site_id}`}
              </Text>
              <Text style={styles.plantSubtitle}>
                Capacity: {plant.capacity_kw} kW &bull; Monitored: {plant.total_days} Days
              </Text>
            </View>
          </View>

          <StatusBadge status={plant.current_status} size="sm" />
        </View>

        {/* Quick KPI Stat Chips */}
        <View style={styles.kpiChipsRow}>
          <View style={styles.kpiChip}>
            <Text style={styles.kpiChipLabel}>Current 7d PR</Text>
            <Text style={[styles.kpiChipValue, { color: statusColor }]}>
              {plant.current_pr_7d !== null && plant.current_pr_7d !== undefined
                ? Number(plant.current_pr_7d).toFixed(3)
                : 'N/A'}
            </Text>
          </View>

          <View style={styles.kpiChip}>
            <Text style={styles.kpiChipLabel}>Lifetime PR</Text>
            <Text style={[styles.kpiChipValue, { color: COLORS.prTrend }]}>
              {plant.lifetime_avg_pr !== null && plant.lifetime_avg_pr !== undefined
                ? Number(plant.lifetime_avg_pr).toFixed(3)
                : 'N/A'}
            </Text>
          </View>

          <View style={styles.kpiChip}>
            <Text style={styles.kpiChipLabel}>Outages</Text>
            <Text
              style={[
                styles.kpiChipValue,
                { color: plant.outage_days_count > 0 ? COLORS.outage : COLORS.textMuted },
              ]}
            >
              {plant.outage_days_count} {plant.outage_days_count === 1 ? 'day' : 'days'}
            </Text>
          </View>

          <View style={styles.kpiChip}>
            <Text style={styles.kpiChipLabel}>Total Gen</Text>
            <Text style={[styles.kpiChipValue, { color: COLORS.solarAmber }]}>
              {(filteredTotalGenKWh / 1000).toFixed(1)} MWh
            </Text>
          </View>
        </View>
      </View>

      {/* Date Filter Toolbar (Presets & Custom Range) */}
      <DateFilterToolbar
        startDate={filterStartDate}
        endDate={filterEndDate}
        onDateChange={onDateFilterChange}
      />

      {/* Segmented Navigation Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'charts' && styles.tabBtnActive]}
          onPress={() => setActiveTab('charts')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === 'charts' && styles.tabBtnTextActive]}>
            📈 Charts &amp; Trends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'issues' && styles.tabBtnActive]}
          onPress={() => setActiveTab('issues')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === 'issues' && styles.tabBtnTextActive]}>
            ⚠️ Issues ({issues.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'telemetry' && styles.tabBtnActive]}
          onPress={() => setActiveTab('telemetry')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === 'telemetry' && styles.tabBtnTextActive]}>
            📋 Telemetry ({daily_readings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'quality' && styles.tabBtnActive]}
          onPress={() => setActiveTab('quality')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === 'quality' && styles.tabBtnTextActive]}>
            🛡️ Sanitization ({data_quality_log.length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Tab 1: Charts */}
      {activeTab === 'charts' && (
        <View>
          <GenerationChart
            readings={daily_readings}
            onSelectDate={() => setActiveTab('telemetry')}
          />

          <PerformanceRatioChart
            readings={daily_readings}
            issues={issues}
          />
        </View>
      )}

      {/* Tab 2: Detected Issues */}
      {activeTab === 'issues' && (
        <View style={styles.sectionWrap}>
          <Text style={styles.tabSectionTitle}>
            Operational Faults &amp; Rule-Based Diagnostics
          </Text>
          <Text style={styles.tabSectionDesc}>
            Automated detection for Outages, Sudden Drops (&gt;20%), and Gradual Decline (&gt;10%).
          </Text>

          {issues.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateIcon}>✓</Text>
              <Text style={styles.emptyStateTitle}>Zero Faults Detected</Text>
              <Text style={styles.emptyStateText}>
                Plant {plant.site_id} is operating nominally within target PR thresholds.
              </Text>
            </View>
          ) : (
            issues.map((iss, idx) => <IssueCard key={idx} issue={iss} />)
          )}
        </View>
      )}

      {/* Tab 3: Daily Telemetry Data */}
      {activeTab === 'telemetry' && (
        <View>
          <Text style={styles.tabSectionTitle}>Daily Reading Telemetry Archive</Text>
          <Text style={styles.tabSectionDesc}>
            All timeseries rows with solar irradiance, raw kWh, daily PR, and 7-day rolling PR.
          </Text>
          <TelemetryTable readings={daily_readings} />
        </View>
      )}

      {/* Tab 4: Data Quality Sanitization Log */}
      {activeTab === 'quality' && (
        <View style={styles.sectionWrap}>
          <Text style={styles.tabSectionTitle}>
            Plant {plant.site_id} Data Sanitization Log
          </Text>
          <Text style={styles.tabSectionDesc}>
            Audit trail of invalid readings, duplicate dates, or sensor spikes sanitized for this plant.
          </Text>

          {data_quality_log.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateIcon}>🛡️</Text>
              <Text style={styles.emptyStateTitle}>Clean Telemetry Feed</Text>
              <Text style={styles.emptyStateText}>
                No anomalous or corrupted records detected for plant {plant.site_id}.
              </Text>
            </View>
          ) : (
            data_quality_log.map((log, idx) => (
              <View key={idx} style={styles.logCard}>
                <View style={styles.logCardHeader}>
                  <Text style={styles.logDateText}>{log.date}</Text>
                  <View style={styles.logActionPill}>
                    <Text style={styles.logActionText}>{log.action_taken}</Text>
                  </View>
                </View>
                <Text style={styles.logFieldText}>
                  Field: <Text style={{ color: COLORS.solarAmber }}>{log.field}</Text>
                  {log.raw_value ? ` | Raw: ${log.raw_value}` : ''}
                </Text>
                <Text style={styles.logDescText}>{log.description}</Text>
              </View>
            ))
          )}
        </View>
      )}
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
  },
  bannerCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: COLORS.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 16,
    marginBottom: 16,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  bannerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  siteIdTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 6,
  },
  siteIdText: {
    color: COLORS.solarAmber,
    fontSize: 13,
    fontWeight: '800',
  },
  plantTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  plantSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  kpiChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: COLORS.radiusMd,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  kpiChip: {
    alignItems: 'center',
  },
  kpiChipLabel: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  kpiChipValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabBtn: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  tabBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: COLORS.solarAmber,
  },
  tabBtnText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: COLORS.solarAmberLight,
    fontWeight: '700',
  },
  sectionWrap: {
    marginBottom: 16,
  },
  tabSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 3,
  },
  tabSectionDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  emptyStateCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: COLORS.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 28,
    color: COLORS.healthy,
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  logCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: COLORS.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 12,
    marginBottom: 10,
  },
  logCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  logActionPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  logActionText: {
    color: COLORS.solarSky,
    fontSize: 10,
    fontWeight: '700',
  },
  logFieldText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  logDescText: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
});
