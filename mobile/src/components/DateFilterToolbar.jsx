import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function DateFilterToolbar({
  startDate,
  endDate,
  onDateChange,
}) {
  const isFiltered = Boolean(startDate || endDate);

  const handlePreset = (type) => {
    if (type === 'all') {
      onDateChange('', '');
    } else if (type === 'jan') {
      onDateChange('2026-01-01', '2026-01-31');
    } else if (type === 'feb') {
      onDateChange('2026-02-01', '2026-02-28');
    } else if (type === 'mar') {
      onDateChange('2026-03-01', '2026-03-31');
    } else if (type === 'first14') {
      onDateChange('2026-01-01', '2026-01-14');
    } else if (type === 'last14') {
      onDateChange('2026-03-18', '2026-03-31');
    }
  };

  const isPresetActive = (start, end) => {
    return startDate === start && endDate === end;
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.labelRow}>
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={styles.label}>Filter Range:</Text>
          {isFiltered && (
            <Text style={styles.activeRangeText}>
              {startDate || 'Start'} → {endDate || 'End'}
            </Text>
          )}
        </View>

        {isFiltered && (
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => onDateChange('', '')}
            activeOpacity={0.7}
          >
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Preset Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetsRow}
      >
        <TouchableOpacity
          style={[styles.presetPill, !isFiltered && styles.presetPillActive]}
          onPress={() => handlePreset('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.presetText, !isFiltered && styles.presetTextActive]}>
            All 90 Days
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.presetPill,
            isPresetActive('2026-01-01', '2026-01-31') && styles.presetPillActive,
          ]}
          onPress={() => handlePreset('jan')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.presetText,
              isPresetActive('2026-01-01', '2026-01-31') && styles.presetTextActive,
            ]}
          >
            Jan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.presetPill,
            isPresetActive('2026-02-01', '2026-02-28') && styles.presetPillActive,
          ]}
          onPress={() => handlePreset('feb')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.presetText,
              isPresetActive('2026-02-01', '2026-02-28') && styles.presetTextActive,
            ]}
          >
            Feb
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.presetPill,
            isPresetActive('2026-03-01', '2026-03-31') && styles.presetPillActive,
          ]}
          onPress={() => handlePreset('mar')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.presetText,
              isPresetActive('2026-03-01', '2026-03-31') && styles.presetTextActive,
            ]}
          >
            Mar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.presetPill,
            isPresetActive('2026-01-01', '2026-01-14') && styles.presetPillActive,
          ]}
          onPress={() => handlePreset('first14')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.presetText,
              isPresetActive('2026-01-01', '2026-01-14') && styles.presetTextActive,
            ]}
          >
            First 14d
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.presetPill,
            isPresetActive('2026-03-18', '2026-03-31') && styles.presetPillActive,
          ]}
          onPress={() => handlePreset('last14')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.presetText,
              isPresetActive('2026-03-18', '2026-03-31') && styles.presetTextActive,
            ]}
          >
            Last 14d
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Date Inputs */}
      <View style={styles.inputsRow}>
        <TextInput
          style={styles.dateInput}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.textDim}
          value={startDate}
          onChangeText={(val) => onDateChange(val, endDate)}
        />
        <Text style={styles.toText}>to</Text>
        <TextInput
          style={styles.dateInput}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.textDim}
          value={endDate}
          onChangeText={(val) => onDateChange(startDate, val)}
        />
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
    padding: 12,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  calendarIcon: {
    fontSize: 13,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  activeRangeText: {
    fontSize: 11,
    color: COLORS.solarAmber,
    fontFamily: 'monospace',
    marginLeft: 4,
  },
  resetBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  resetText: {
    color: COLORS.underperforming,
    fontSize: 11,
    fontWeight: '700',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  presetPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 20,
  },
  presetPillActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: COLORS.solarAmber,
  },
  presetText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  presetTextActive: {
    color: COLORS.solarAmberLight,
    fontWeight: '700',
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  dateInput: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: COLORS.radiusSm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  toText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
