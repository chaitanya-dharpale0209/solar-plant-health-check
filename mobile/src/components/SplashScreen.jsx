import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
} from 'react-native';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');

const TELEMETRY_STEPS = [
  'Initializing telemetry engine...',
  'Connecting to inverter dataloggers...',
  'Evaluating Performance Ratios (PR)...',
  'Solar fleet diagnostics ready!',
];

export default function SplashScreen({ onFinish, isReady = false }) {
  const [stepIndex, setStepIndex] = useState(0);

  // Animations
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const auraScale = useRef(new Animated.Value(0.9)).current;
  const auraOpacity = useRef(new Animated.Value(0.35)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Continuous solar aura pulse
    const auraPulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(auraScale, {
            toValue: 1.25,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(auraOpacity, {
            toValue: 0.7,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(auraScale, {
            toValue: 0.9,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(auraOpacity, {
            toValue: 0.35,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    auraPulse.start();

    // 3. Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // 4. Stepped status updates
    const t1 = setTimeout(() => setStepIndex(1), 600);
    const t2 = setTimeout(() => setStepIndex(2), 1200);
    const t3 = setTimeout(() => setStepIndex(3), 1800);

    // 5. Completion handling
    const minTimePromise = new Promise((resolve) => setTimeout(resolve, 2400));
    const safetyTimeout = setTimeout(() => {
      triggerExit();
    }, 4000);

    minTimePromise.then(() => {
      triggerExit();
    });

    function triggerExit() {
      clearTimeout(safetyTimeout);
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 450,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(safetyTimeout);
      auraPulse.stop();
    };
  }, [onFinish]);

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: exitOpacity }]}>
      {/* Background Solar Aura Glow */}
      <Animated.View
        style={[
          styles.solarAura,
          {
            transform: [{ scale: auraScale }],
            opacity: auraOpacity,
          },
        ]}
      />

      {/* Main Logo & Branding Block */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Image
          source={require('../../assets/oorjan_dark_logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <View style={styles.taglineBox}>
          <Text style={styles.taglineText}>SOLAR PLANT HEALTH & DIAGNOSTICS</Text>
          <Text style={styles.subTaglineText}>
            Clean Energy Telemetry • Performance Intelligence
          </Text>
        </View>
      </Animated.View>

      {/* Bottom Telemetry Loading & Progress Indicator */}
      <View style={styles.bottomSection}>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{TELEMETRY_STEPS[stepIndex]}</Text>
        </View>

        {/* Animated Progress Bar */}
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressBarWidth }]} />
        </View>

        <Text style={styles.footerNote}>
          OORJAN CLEANTECH • TELEMETRY ENGINE
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0b0f19',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  solarAura: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  logoImage: {
    width: width * 0.76,
    height: (width * 0.76) * 0.58,
    maxWidth: 380,
    maxHeight: 220,
  },
  taglineBox: {
    marginTop: 18,
    alignItems: 'center',
  },
  taglineText: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  subTaglineText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 50,
    width: width * 0.82,
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 14,
    gap: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#f59e0b',
  },
  statusText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 2,
  },
  footerNote: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
});
