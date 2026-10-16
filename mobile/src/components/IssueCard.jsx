import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function IssueCard({ issue }) {
  if (!issue) return null;

  const isCritical = issue.severity === 'critical';
  const accentColor = isCritical ? COLORS.underperforming : COLORS.attention;
  const bgColor = isCritical ? COLORS.underperformingBg : COLORS.attentionBg;
  const borderColor = isCritical ? COLORS.underperformingBorder : COLORS.attentionBorder;

  const getIcon = () => {
    if (issue.issue_type === 'OUTAGE') return '⚠️';
    if (issue.issue_type === 'SUDDEN_DROP') return '📉';
    return '📊';
  };

  return (
    <View style={[styles.card, { backgroundColor: bgColor, borderColor: borderColor }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{getIcon()}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {issue.title}
          </Text>
        </View>

        <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.25)', borderColor: accentColor }]}>
          <Text style={[styles.badgeText, { color: accentColor }]}>
            {issue.issue_type ? issue.issue_type.replace('_', ' ') : 'ISSUE'}
          </Text>
        </View>
      </View>

      <Text style={styles.reason}>{issue.reason}</Text>

      {issue.date && (
        <View style={styles.dateTag}>
          <Text style={styles.dateText}>Detected Date: {issue.date}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: COLORS.radiusMd,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  icon: {
    fontSize: 16,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  badge: {
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  reason: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  dateTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  dateText: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});
