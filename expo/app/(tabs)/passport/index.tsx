import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { cities } from '@/data/cities';
import { getRankEmoji, formatDuration } from '@/utils/helpers';

export default function PassportScreen() {
  const insets = useSafeAreaInsets();
  const { profile, flightLog } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const visitedCities = useMemo(() => {
    return cities.filter(c => profile.citiesVisited.includes(c.code));
  }, [profile.citiesVisited]);

  const unvisitedCities = useMemo(() => {
    return cities.filter(c => !profile.citiesVisited.includes(c.code));
  }, [profile.citiesVisited]);

  const completedFlights = useMemo(() => {
    return flightLog.filter(f => f.completed);
  }, [flightLog]);

  const totalHours = Math.floor(profile.totalFocusMinutes / 60);
  const totalMin = profile.totalFocusMinutes % 60;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.passportCover}>
            <Text style={styles.passportEmoji}>📘</Text>
            <Text style={styles.passportTitle}>PILOT PASSPORT</Text>
            <View style={styles.passportDivider} />
            <Text style={styles.passportName}>Captain {profile.pilotName}</Text>
            <View style={styles.rankRow}>
              <Text style={styles.rankEmoji}>{getRankEmoji(profile.rank)}</Text>
              <Text style={styles.rankLabel}>{profile.rank}</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile.flightsCompleted}</Text>
              <Text style={styles.statDesc}>Flights Completed</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {totalHours > 0 ? `${totalHours}h ${totalMin}m` : `${totalMin}m`}
              </Text>
              <Text style={styles.statDesc}>Total Focus Time</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{visitedCities.length}</Text>
              <Text style={styles.statDesc}>Cities Visited</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{cities.length - visitedCities.length}</Text>
              <Text style={styles.statDesc}>Cities Remaining</Text>
            </View>
          </View>

          {visitedCities.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIndicator} />
                <Text style={styles.sectionTitle}>COLLECTED STAMPS</Text>
              </View>
              <View style={styles.stampsGrid}>
                {visitedCities.map(city => {
                  const flight = completedFlights.find(
                    f => f.arrivalCity === city.code || f.departureCity === city.code
                  );
                  return (
                    <View key={city.code} style={styles.stamp}>
                      <View style={styles.stampInner}>
                        <Text style={styles.stampIcon}>{city.icon}</Text>
                        <Text style={styles.stampCode}>{city.code}</Text>
                        <Text style={styles.stampName}>{city.name}</Text>
                        <Text style={styles.stampFlag}>{city.flagEmoji}</Text>
                        {flight && (
                          <Text style={styles.stampDuration}>
                            {formatDuration(flight.durationMinutes)}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {unvisitedCities.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIndicator, { backgroundColor: Colors.textMuted }]} />
                <Text style={styles.sectionTitle}>UNDISCOVERED</Text>
              </View>
              <View style={styles.stampsGrid}>
                {unvisitedCities.map(city => (
                  <View key={city.code} style={[styles.stamp, styles.stampLocked]}>
                    <View style={[styles.stampInner, styles.stampInnerLocked]}>
                      <Text style={[styles.stampIcon, { opacity: 0.3 }]}>❓</Text>
                      <Text style={[styles.stampCode, { color: Colors.textMuted }]}>{city.code}</Text>
                      <Text style={[styles.stampName, { color: Colors.textMuted }]}>{city.name}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {visitedCities.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>✈️</Text>
              <Text style={styles.emptyTitle}>No stamps yet!</Text>
              <Text style={styles.emptyText}>
                Complete your first flight to earn a passport stamp
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
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
  content: {
    paddingHorizontal: 20,
  },
  passportCover: {
    backgroundColor: '#1A3A5C',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#2A5A8C',
  },
  passportEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  passportTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.yellow,
    letterSpacing: 3,
  },
  passportDivider: {
    width: 60,
    height: 2,
    backgroundColor: Colors.yellow,
    marginVertical: 12,
    borderRadius: 1,
  },
  passportName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rankEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  rankLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.yellow,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statBox: {
    width: '48%' as unknown as number,
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.skyBlue,
  },
  statDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionIndicator: {
    width: 4,
    height: 18,
    backgroundColor: Colors.green,
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 2,
  },
  stampsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stamp: {
    width: '30%' as unknown as number,
    flexGrow: 1,
    flexBasis: '30%',
    maxWidth: '32%' as unknown as number,
  },
  stampLocked: {
    opacity: 0.5,
  },
  stampInner: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.green,
    minHeight: 110,
    justifyContent: 'center',
  },
  stampInnerLocked: {
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  stampIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  stampCode: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 1,
  },
  stampName: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  stampFlag: {
    fontSize: 12,
    marginTop: 2,
  },
  stampDuration: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
