import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, ScrollText, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { getRandomRoutes } from '@/data/routes';
import { getCityByCode } from '@/data/cities';
import { formatDuration, getRankEmoji } from '@/utils/helpers';
import FlightCard from '@/components/FlightCard';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, flightLog } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const suggestedRoutes = useMemo(() => getRandomRoutes(4), []);

  const handleFlightPress = useCallback((route: typeof suggestedRoutes[0]) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/boarding',
      params: { from: route.from, to: route.to },
    });
  }, [router]);

  const totalHours = Math.floor(profile.totalFocusMinutes / 60);
  const totalMin = profile.totalFocusMinutes % 60;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Welcome aboard,</Text>
              <Text style={styles.pilotName}>Captain {profile.pilotName}</Text>
              <View style={styles.rankBadge}>
                <Text style={styles.rankEmoji}>{getRankEmoji(profile.rank)}</Text>
                <Text style={styles.rankText}>{profile.rank}</Text>
              </View>
            </View>
            <Pressable
              style={styles.passportBtn}
              onPress={() => router.push('/(tabs)/passport')}
              testID="passport-btn"
            >
              <BookOpen size={22} color={Colors.yellow} />
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{profile.flightsCompleted}</Text>
              <Text style={styles.statLabel}>Flights</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {totalHours > 0 ? `${totalHours}h` : `${totalMin}m`}
              </Text>
              <Text style={styles.statLabel}>Focus Time</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{profile.citiesVisited.length}</Text>
              <Text style={styles.statLabel}>Cities</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.boardTitleRow}>
              <View style={styles.boardIndicator} />
              <Text style={styles.sectionTitle}>DEPARTURES</Text>
            </View>
            <Text style={styles.sectionSub}>Suggested flights</Text>
          </View>

          {suggestedRoutes.map((route, i) => (
            <FlightCard
              key={`${route.from}-${route.to}-${i}`}
              route={route}
              onPress={() => handleFlightPress(route)}
            />
          ))}

          <Pressable
            style={({ pressed }) => [styles.bookBtn, pressed && styles.bookBtnPressed]}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(tabs)/book');
            }}
            testID="book-flight-btn"
          >
            <Text style={styles.bookBtnText}>Book a Custom Flight</Text>
            <ChevronRight size={20} color={Colors.navy} />
          </Pressable>

          {flightLog.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.boardTitleRow}>
                  <ScrollText size={16} color={Colors.textSecondary} />
                  <Text style={[styles.sectionTitle, { fontSize: 14, marginLeft: 8 }]}>RECENT FLIGHTS</Text>
                </View>
              </View>
              {flightLog.slice(0, 3).map((flight) => {
                const from = getCityByCode(flight.departureCity);
                const to = getCityByCode(flight.arrivalCity);
                return (
                  <View key={flight.id} style={styles.recentCard}>
                    <View style={styles.recentLeft}>
                      <Text style={styles.recentRoute}>
                        {from?.icon} {flight.departureCity} → {flight.arrivalCity} {to?.icon}
                      </Text>
                      <Text style={styles.recentTime}>{formatDuration(flight.durationMinutes)}</Text>
                    </View>
                    <View style={[styles.recentStatus, flight.completed ? styles.statusDone : styles.statusFail]}>
                      <Text style={styles.recentStatusText}>
                        {flight.completed ? '✓ Landed' : '✗ Cancelled'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
          <View style={{ height: 30 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  pilotName: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.white,
    marginTop: 4,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.whiteAlpha,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  rankEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  rankText: {
    fontSize: 13,
    color: Colors.yellow,
    fontWeight: '700' as const,
  },
  passportBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.whiteAlpha,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.skyBlue,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  boardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boardIndicator: {
    width: 4,
    height: 18,
    backgroundColor: Colors.yellow,
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 2,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    marginLeft: 14,
  },
  bookBtn: {
    backgroundColor: Colors.yellow,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  bookBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  bookBtnText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.navy,
    marginRight: 8,
  },
  recentSection: {
    marginTop: 28,
  },
  recentCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recentLeft: {
    flex: 1,
  },
  recentRoute: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  recentTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recentStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDone: {
    backgroundColor: 'rgba(102,187,106,0.15)',
  },
  statusFail: {
    backgroundColor: 'rgba(255,138,101,0.15)',
  },
  recentStatusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});
