import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, getStatusColor, getStatusBg, getStatusBorder } from '../theme/colors';

export default function StatusBadge({ status, size = 'md' }) {
  const color = getStatusColor(status);
  const bg = getStatusBg(status);
  const border = getStatusBorder(status);

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 8 : 12,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        style={[
          styles.text,
          {
            color: color,
            fontSize: isSmall ? 11 : 12,
          },
        ]}
      >
        {status || 'Unknown'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
