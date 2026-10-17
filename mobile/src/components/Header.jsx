import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { COLORS } from '../theme/colors';

export default function Header({
  isDetailView = false,
  plantId = null,
  onBack,
  onOpenAudit,
  onRefresh,
  isRefreshing = false,
  isFallback = false,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {isDetailView ? (
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>All Plants</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.brandRow}>
            <Image
              source={require('../../assets/oorjan_dark_logo.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          </View>
        )}

        <View style={styles.actionRow}>
          {/* Audit Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onOpenAudit}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🛡️</Text>
            <Text style={styles.actionBtnText}>Audit</Text>
          </TouchableOpacity>

          {/* Refresh Button */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.refreshBtn]}
            onPress={onRefresh}
            activeOpacity={0.7}
            disabled={isRefreshing}
          >
            <Text style={styles.refreshIcon}>{isRefreshing ? '⏳' : '🔄'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Connection Mode Pill */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.modePill,
            {
              backgroundColor: isFallback ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              borderColor: isFallback ? 'rgba(56, 189, 248, 0.3)' : 'rgba(16, 185, 129, 0.3)',
            },
          ]}
        >
          <View
            style={[
              styles.modeDot,
              { backgroundColor: isFallback ? COLORS.solarSky : COLORS.healthy },
            ]}
          />
          <Text
            style={[
              styles.modeText,
              { color: isFallback ? COLORS.solarSky : COLORS.healthy },
            ]}
          >
            {isFallback ? 'Offline Mode (Local Telemetry)' : 'Live API Connected'}
          </Text>
        </View>

        {isDetailView && plantId ? (
          <View style={styles.plantIdTag}>
            <Text style={styles.plantIdText}>{plantId}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 125,
    height: 36,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: COLORS.radiusMd,
    gap: 6,
  },
  backArrow: {
    color: COLORS.solarAmber,
    fontSize: 16,
    fontWeight: '700',
  },
  backText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: COLORS.radiusMd,
    gap: 5,
  },
  actionIcon: {
    fontSize: 13,
  },
  actionBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  refreshBtn: {
    paddingHorizontal: 8,
  },
  refreshIcon: {
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  modeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modeText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  plantIdTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  plantIdText: {
    color: COLORS.solarAmber,
    fontSize: 11,
    fontWeight: '800',
  },
});
