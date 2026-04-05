import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Animated, AppState } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { formatDuration } from '@/utils/helpers';
import FlightMap from '@/components/FlightMap';

export default function FlightScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeFlight, completeFlight, cancelFlight } = useApp();
  const [now, setNow] = useState(Date.now());
  const [halfwayShown, setHalfwayShown] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setNow(Date.now());
      }
    });
    return () => sub.remove();
  }, []);

  const { progress, elapsed, remaining, isComplete } = useMemo(() => {
    if (!activeFlight) return { progress: 0, elapsed: 0, remaining: 0, isComplete: false };
    const startMs = new Date(activeFlight.startedAt).getTime();
    const totalMs = activeFlight.durationMinutes * 60000;
    const elapsedMs = now - startMs;
    const prog = Math.min(elapsedMs / totalMs, 1);
    return {
      progress: prog,
      elapsed: Math.floor(elapsedMs / 60000),
      remaining: Math.max(0, Math.ceil((totalMs - elapsedMs) / 60000)),
      isComplete: prog >= 1,
    };
  }, [activeFlight, now]);

  useEffect(() => {
    Animated.timing(progressBarAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress, progressBarAnim]);

  useEffect(() => {
    if (progress >= 0.5 && !halfwayShown && !isComplete) {
      setHalfwayShown(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [progress, halfwayShown, isComplete]);

  useEffect(() => {
    if (isComplete && activeFlight) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      completeFlight({
        id: activeFlight.id,
        departureCity: activeFlight.fromCity.code,
        arrivalCity: activeFlight.toCity.code,
        durationMinutes: activeFlight.durationMinutes,
        startedAt: activeFlight.startedAt,
        completedAt: new Date().toISOString(),
        completed: true,
        stampEarned: true,
      });
      const timer = setTimeout(() => {
        router.replace({
          pathname: '/landing',
          params: {
            from: activeFlight.fromCity.code,
            to: activeFlight.toCity.code,
            duration: String(activeFlight.durationMinutes),
          },
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, activeFlight, completeFlight, router]);

  const handleEmergencyLanding = useCallback(() => {
    Alert.alert(
      '🚨 Emergency Landing',
      'Your flight is still in the air! Leaving now will cancel your flight and you won\'t earn your stamp. Are you sure?',
      [
        { text: 'Stay on Flight', style: 'cancel' },
        {
          text: 'Emergency Landing',
          style: 'destructive',
          onPress: () => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            cancelFlight();
            router.replace('/');
          },
        },
      ]
    );
  }, [cancelFlight, router]);

  if (!activeFlight) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.noFlightContainer}>
          <Text style={styles.noFlightText}>No active flight</Text>
          <Pressable onPress={() => router.replace('/')} style={styles.goBackBtn}>
            <Text style={styles.goBackText}>Return to Terminal</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const altitude = isComplete ? '0' : '35,000';
  const speed = isComplete ? '0' : '550';
  const percentText = `${Math.floor(progress * 100)}%`;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.routeLabel}>
          <Text style={styles.routeText}>
            {activeFlight.fromCity.code} → {activeFlight.toCity.code}
          </Text>
        </View>
        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>ELAPSED</Text>
            <Text style={styles.timeValue}>{formatDuration(elapsed)}</Text>
          </View>
          <View style={styles.timeDot} />
          <View style={[styles.timeBlock, styles.timeBlockRight]}>
            <Text style={styles.timeLabel}>REMAINING</Text>
            <Text style={styles.timeValue}>{formatDuration(remaining)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <FlightMap
          fromCity={activeFlight.fromCity}
          toCity={activeFlight.toCity}
          progress={progress}
        />

        {halfwayShown && progress < 0.6 && (
          <View style={styles.halfwayBanner}>
            <Text style={styles.halfwayText}>🎉 Halfway there!</Text>
          </View>
        )}
      </View>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.flightStats}>
          <View style={styles.flightStat}>
            <Text style={styles.statLabel}>ALT</Text>
            <Text style={styles.statValue}>{altitude} ft</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.flightStat}>
            <Text style={styles.statLabel}>SPEED</Text>
            <Text style={styles.statValue}>{speed} mph</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.flightStat}>
            <Text style={styles.statLabel}>PROGRESS</Text>
            <Text style={styles.statValue}>{percentText}</Text>
          </View>
        </View>

        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressBarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <Pressable
          style={styles.emergencyBtn}
          onPress={handleEmergencyLanding}
          testID="emergency-btn"
        >
          <Text style={styles.emergencyText}>🚨 Emergency Landing</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  noFlightContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noFlightText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  goBackBtn: {
    backgroundColor: Colors.skyBlue,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  goBackText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.navy,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(13,27,42,0.95)',
  },
  routeLabel: {
    alignItems: 'center',
    marginBottom: 10,
  },
  routeText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBlock: {
    flex: 1,
    alignItems: 'center',
  },
  timeBlockRight: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 1.5,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.skyBlue,
    marginTop: 2,
  },
  timeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    marginHorizontal: 16,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
  },
  halfwayBanner: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(79,195,247,0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.skyBlue,
  },
  halfwayText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.skyBlue,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(13,27,42,0.95)',
  },
  flightStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  flightStat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 1.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.whiteAlpha,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.whiteAlpha,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.skyBlue,
    borderRadius: 3,
  },
  emergencyBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  emergencyText: {
    fontSize: 13,
    color: Colors.coral,
    fontWeight: '600' as const,
  },
});
