import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { getCityByCode } from '@/data/cities';
import { formatDuration, getRankEmoji } from '@/utils/helpers';
import { useApp } from '@/providers/AppProvider';

export default function LandingScreen() {
  const { from, to, duration } = useLocalSearchParams<{ from: string; to: string; duration: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useApp();

  const confettiAnim = useRef(new Animated.Value(0)).current;
  const stampScale = useRef(new Animated.Value(0)).current;
  const stampRotate = useRef(new Animated.Value(-0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const planeY = useRef(new Animated.Value(-100)).current;

  const fromCity = getCityByCode(from ?? '');
  const toCity = getCityByCode(to ?? '');
  const durationMin = parseInt(duration ?? '0', 10);

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(planeY, { toValue: 0, tension: 30, friction: 6, useNativeDriver: true }),
      ]),
      Animated.delay(400),
      Animated.parallel([
        Animated.spring(stampScale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
        Animated.spring(stampRotate, { toValue: 0, tension: 200, friction: 8, useNativeDriver: true }),
      ]),
      Animated.timing(confettiAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    });
  }, [confettiAnim, stampScale, stampRotate, fadeAnim, planeY]);

  const confettiPieces = useRef(
    Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      delay: Math.random() * 500,
      color: [Colors.yellow, Colors.skyBlue, Colors.coral, Colors.green, '#FF6B9D', '#C084FC'][
        Math.floor(Math.random() * 6)
      ],
      size: 6 + Math.random() * 8,
    }))
  ).current;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {confettiPieces.map((piece, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confetti,
              {
                left: `${piece.left}%` as unknown as number,
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: piece.size / 2,
                opacity: confettiAnim,
                transform: [
                  {
                    translateY: confettiAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 200 + Math.random() * 300],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}

        <Animated.View style={[styles.planeContainer, { transform: [{ translateY: planeY }] }]}>
          <Text style={styles.planeEmoji}>🛬</Text>
        </Animated.View>

        <Text style={styles.title}>You've Arrived!</Text>
        <Text style={styles.subtitle}>
          Welcome to {toCity?.name ?? 'your destination'} {toCity?.icon}
        </Text>

        <Animated.View
          style={[
            styles.stampContainer,
            {
              transform: [
                { scale: stampScale },
                {
                  rotate: stampRotate.interpolate({
                    inputRange: [-0.3, 0],
                    outputRange: ['-15deg', '0deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.stamp}>
            <Text style={styles.stampIcon}>{toCity?.icon ?? '✈️'}</Text>
            <Text style={styles.stampCode}>{toCity?.code ?? '???'}</Text>
            <Text style={styles.stampCity}>{toCity?.name ?? 'Unknown'}</Text>
            <Text style={styles.stampFlag}>{toCity?.flagEmoji}</Text>
            <View style={styles.stampDivider} />
            <Text style={styles.stampDate}>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
            <Text style={styles.stampDuration}>{formatDuration(durationMin)} focus</Text>
          </View>
        </Animated.View>

        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>{formatDuration(durationMin)}</Text>
              <Text style={styles.statsLabel}>Focus Time</Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>{profile.flightsCompleted}</Text>
              <Text style={styles.statsLabel}>Total Flights</Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>{getRankEmoji(profile.rank)}</Text>
              <Text style={styles.statsLabel}>{profile.rank}</Text>
            </View>
          </View>
        </View>

        <View style={styles.routeSummary}>
          <Text style={styles.routeText}>
            {fromCity?.icon} {fromCity?.code} → {toCity?.code} {toCity?.icon}
          </Text>
        </View>
      </Animated.View>

      <View style={[styles.buttonRow, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable
          style={({ pressed }) => [styles.passportBtn, pressed && styles.btnPressed]}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.replace('/(tabs)/passport');
          }}
          testID="view-passport-btn"
        >
          <Text style={styles.passportBtnText}>📘 View Passport</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.terminalBtn, pressed && styles.btnPressed]}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.replace('/');
          }}
          testID="back-to-terminal-btn"
        >
          <Text style={styles.terminalBtnText}>Back to Terminal</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  confetti: {
    position: 'absolute',
    top: 0,
  },
  planeContainer: {
    marginBottom: 16,
  },
  planeEmoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.yellow,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  stampContainer: {
    marginBottom: 24,
  },
  stamp: {
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: Colors.coral,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    minWidth: 160,
    borderStyle: 'dashed',
  },
  stampIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  stampCode: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: Colors.coral,
    letterSpacing: 2,
  },
  stampCity: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: '600' as const,
  },
  stampFlag: {
    fontSize: 16,
    marginTop: 2,
  },
  stampDivider: {
    width: 40,
    height: 1,
    backgroundColor: Colors.coral,
    marginVertical: 8,
    opacity: 0.4,
  },
  stampDate: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  stampDuration: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statsCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 18,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.whiteAlpha,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.skyBlue,
  },
  statsLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  routeSummary: {
    backgroundColor: Colors.whiteAlpha,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  buttonRow: {
    paddingHorizontal: 24,
    gap: 10,
  },
  passportBtn: {
    backgroundColor: Colors.yellow,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  passportBtnText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.navy,
  },
  terminalBtn: {
    backgroundColor: Colors.whiteAlpha,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  terminalBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
});
