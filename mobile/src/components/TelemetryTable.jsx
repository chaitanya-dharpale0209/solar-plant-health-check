import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, getStatusColor } from '../theme/colors';

export default function TelemetryTable({ readings = [] }) {
  const [page, setPage] = useState(1);
  const pageSize = 15;

  if (!readings || readings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No telemetry records match the current filter.</Text>
      </View>
    );
  }

  const totalPages = Math.ceil(readings.length / pageSize);
  const paginatedReadings = readings.slice((page - 1) * pageSize, page * pageSize);

  return (
    <View style={styles.container}>
      {/* Scrollable Data Table Container */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.cellDate]}>Date</Text>
            <Text style={[styles.headerCell, styles.cellGen]}>Energy (kWh)</Text>
            <Text style={[styles.headerCell, styles.cellIrr]}>Irr (kWh/m²)</Text>
            <Text style={[styles.headerCell, styles.cellIdeal]}>Ideal (kWh)</Text>
            <Text style={[styles.headerCell, styles.cellPr]}>Daily PR</Text>
            <Text style={[styles.headerCell, styles.cellRolling]}>7-Day PR</Text>
            <Text style={[styles.headerCell, styles.cellCloud]}>Cloud</Text>
            <Text style={[styles.headerCell, styles.cellTemp]}>Temp</Text>
            <Text style={[styles.headerCell, styles.cellStatus]}>Status</Text>
          </View>

          {/* Data Rows */}
          {paginatedReadings.map((r, i) => {
            const isOutage = r.is_outage;
            const statusColor = r.status ? getStatusColor(r.status) : COLORS.textMuted;

            return (
              <View
                key={i}
                style={[
                  styles.dataRow,
                  i % 2 === 1 && styles.dataRowEven,
                  isOutage && styles.dataRowOutage,
                ]}
              >
                <Text
                  style={[
                    styles.cell,
                    styles.cellDate,
                    styles.mono,
                    isOutage && styles.textOutage,
                  ]}
                >
                  {r.date}
                </Text>

                <Text style={[styles.cell, styles.cellGen, { color: isOutage ? COLORS.outage : COLORS.solarAmber }]}>
                  {r.generation_kwh !== null ? Number(r.generation_kwh).toFixed(1) : '—'}
                </Text>

                <Text style={[styles.cell, styles.cellIrr, { color: COLORS.solarSky }]}>
                  {r.irradiance !== null ? Number(r.irradiance).toFixed(2) : '—'}
                </Text>

                <Text style={[styles.cell, styles.cellIdeal, { color: COLORS.textMuted }]}>
                  {r.ideal_generation_kwh ? Number(r.ideal_generation_kwh).toFixed(1) : '—'}
                </Text>

                <Text style={[styles.cell, styles.cellPr, styles.mono, { color: COLORS.prTrendLight }]}>
                  {r.pr !== null ? Number(r.pr).toFixed(3) : isOutage ? '0.000' : '—'}
                </Text>

                <Text
                  style={[
                    styles.cell,
                    styles.cellRolling,
                    styles.mono,
                    {
                      fontWeight: '700',
                      color:
                        r.rolling_pr_7d >= 0.7
                          ? COLORS.healthy
                          : r.rolling_pr_7d >= 0.6
                          ? COLORS.attention
                          : COLORS.underperforming,
                    },
                  ]}
                >
                  {r.rolling_pr_7d !== null ? Number(r.rolling_pr_7d).toFixed(3) : '—'}
                </Text>

                <Text style={[styles.cell, styles.cellCloud]}>
                  {r.cloud_cover !== null ? `${Number(r.cloud_cover).toFixed(0)}%` : '—'}
                </Text>

                <Text style={[styles.cell, styles.cellTemp]}>
                  {r.temperature !== null ? `${Number(r.temperature).toFixed(1)}°` : '—'}
                </Text>

                <View style={[styles.cell, styles.cellStatus]}>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isOutage
                          ? COLORS.outageBg
                          : `${statusColor}20`,
                        borderColor: isOutage ? COLORS.outage : statusColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: isOutage ? COLORS.outage : statusColor },
                      ]}
                    >
                      {isOutage ? 'Outage' : r.status || '—'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Pagination Controls */}
      <View style={styles.paginationRow}>
        <Text style={styles.pageInfoText}>
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, readings.length)} of {readings.length} days
        </Text>

        <View style={styles.pageBtnGroup}>
          <TouchableOpacity
            style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
            disabled={page <= 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
          >
            <Text style={[styles.pageBtnText, page <= 1 && styles.pageBtnTextDisabled]}>
              Prev
            </Text>
          </TouchableOpacity>

          <Text style={styles.pageNumber}>
            {page} / {totalPages || 1}
          </Text>

          <TouchableOpacity
            style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
            disabled={page >= totalPages}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <Text style={[styles.pageBtnText, page >= totalPages && styles.pageBtnTextDisabled]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: COLORS.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    overflow: 'hidden',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  headerCell: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  dataRowEven: {
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
  },
  dataRowOutage: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.outage,
  },
  cell: {
    fontSize: 11,
    color: '#ffffff',
  },
  cellDate: { width: 95 },
  cellGen: { width: 85, fontWeight: '700' },
  cellIrr: { width: 85 },
  cellIdeal: { width: 80 },
  cellPr: { width: 75 },
  cellRolling: { width: 75 },
  cellCloud: { width: 55 },
  cellTemp: { width: 55 },
  cellStatus: { width: 95 },
  mono: { fontFamily: 'monospace' },
  textOutage: { color: COLORS.outage, fontWeight: '700' },
  statusPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusPillText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  pageInfoText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  pageBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageBtn: {
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  pageBtnTextDisabled: {
    color: COLORS.textDim,
  },
  pageNumber: {
    fontSize: 11,
    color: COLORS.solarAmber,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
