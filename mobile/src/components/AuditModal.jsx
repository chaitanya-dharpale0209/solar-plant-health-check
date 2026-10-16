import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function AuditModal({ visible, logs = [], onClose }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <View style={styles.shieldIconBox}>
                <Text style={styles.shieldIcon}>🛡️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Data Sanitization Audit Log</Text>
                <Text style={styles.modalSubtitle}>
                  Duplicates discarded, sensor spikes rejected, negatives caught
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body Log List */}
          <ScrollView style={styles.logList} showsVerticalScrollIndicator={true}>
            {logs.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No data anomalies logged.</Text>
              </View>
            ) : (
              logs.map((log, idx) => (
                <View key={idx} style={styles.logItem}>
                  <View style={styles.logTopRow}>
                    <Text style={styles.logDate}>{log.date}</Text>
                    <View style={styles.actionPill}>
                      <Text style={styles.actionPillText}>{log.action_taken}</Text>
                    </View>
                  </View>

                  <View style={styles.logDetailsRow}>
                    <Text style={styles.fieldTag}>Field: {log.field}</Text>
                    {log.raw_value ? (
                      <Text style={styles.rawValueText}>Raw: {log.raw_value}</Text>
                    ) : null}
                  </View>

                  <Text style={styles.logDesc}>{log.description}</Text>
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.logCountText}>Total Audit Entries: {logs.length}</Text>
            <TouchableOpacity style={styles.footerCloseBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.footerCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: COLORS.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    maxHeight: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  shieldIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIcon: {
    fontSize: 15,
  },
  modalTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  closeBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  logList: {
    padding: 16,
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  logItem: {
    backgroundColor: COLORS.bgCard,
    borderRadius: COLORS.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 12,
    marginBottom: 10,
  },
  logTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  logDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  actionPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  actionPillText: {
    color: COLORS.solarSky,
    fontSize: 10,
    fontWeight: '700',
  },
  logDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  fieldTag: {
    fontSize: 10.5,
    color: COLORS.solarAmber,
    fontWeight: '700',
  },
  rawValueText: {
    fontSize: 10.5,
    color: COLORS.underperforming,
    fontFamily: 'monospace',
  },
  logDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  logCountText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  footerCloseBtn: {
    backgroundColor: COLORS.solarAmber,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: COLORS.radiusSm,
  },
  footerCloseText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
});
