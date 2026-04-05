import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { getCityByCode } from '@/data/cities';
import { findRoute } from '@/data/routes';
import { useApp } from '@/providers/AppProvider';
import { formatDuration, formatTime, generateGate, generateSeat, generateId } from '@/utils/helpers';
import { ActiveFlight } from '@/types';

export default function BoardingScreen() {
  const { from, to } = useLocalSearchParams<{ from: string; to: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startFlight, profile } = useApp();

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const fromCity = getCityByCode(from ?? '');
  const toCity = getCityByCode(to ?? '');
  const route = from && to ? findRoute(from, to) : undefined;

  const gate = useRef(generateGate()).current;
  const seat = useRef(generateSeat()).current;
  const barcodeLines = useRef(
    Array.from({ length: 30 }).map(() => ({
      width: Math.random() > 0.5 ? 3 : 1.5,
      opacity: 0.3 + Math.random() * 0.7,
    }))
  ).current;
  const now = useRef(new Date()).current;
  const arrivalTime = useRef(route ? new Date(now.getTime() + (route?.durationMinutes ?? 0) * 60000) : now).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [slideAnim, fadeAnim, scaleAnim]);

  const handleTakeOff = useCallback(() => {
    if (!fromCity || !toCity || !route) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const flight: ActiveFlight = {
      id: generateId(),
      route,
      fromCity,
      toCity,
      startedAt: new Date().toISOString(),
      durationMinutes: route.durationMinutes,
      gate,
      seat,
    };

    startFlight(flight);

    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -400, duration: 400, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      router.replace('/flight');
    });
  }, [fromCity, toCity, route, gate, seat, startFlight, router, slideAnim, fadeAnim]);

  if (!fromCity || !toCity || !route) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Route not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View
        style={[
          styles.ticketContainer,
          {
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.ticket}>
          <View style={styles.ticketHeader}>
            <Text style={styles.airline}>✈️ SKYFOCUS AIRLINES</Text>
            <Text style={styles.boardingLabel}>BOARDING PASS</Text>
          </View>

          <View style={styles.ticketDivider} />

          <View style={styles.passengerRow}>
            <View>
              <Text style={styles.fieldLabel}>PASSENGER</Text>
              <Text style={styles.fieldValue}>Captain {profile.pilotName}</Text>
            </View>
          </View>

          <View style={styles.routeSection}>
            <View style={styles.routeCity}>
              <Text style={styles.routeCode}>{fromCity.code}</Text>
              <Text style={styles.routeName}>{fromCity.name}</Text>
              <Text style={styles.routeIcon}>{fromCity.icon}</Text>
            </View>
            <View style={styles.routeArrow}>
              <Text style={styles.routeArrowText}>✈</Text>
              <Text style={styles.routeDuration}>{formatDuration(route.durationMinutes)}</Text>
            </View>
            <View style={[styles.routeCity, styles.routeCityRight]}>
              <Text style={styles.routeCode}>{toCity.code}</Text>
              <Text style={styles.routeName}>{toCity.name}</Text>
              <Text style={styles.routeIcon}>{toCity.icon}</Text>
            </View>
          </View>

          <View style={styles.ticketDivider} />

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.fieldLabel}>GATE</Text>
              <Text style={styles.detailValue}>{gate}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.fieldLabel}>SEAT</Text>
              <Text style={styles.detailValue}>{seat}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.fieldLabel}>DEPARTS</Text>
              <Text style={styles.detailValue}>{formatTime(now)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.fieldLabel}>ARRIVES</Text>
              <Text style={styles.detailValue}>{formatTime(arrivalTime)}</Text>
            </View>
          </View>

          <View style={styles.ticketDivider} />

          <View style={styles.barcodeSection}>
            <View style={styles.barcode}>
              {Array.from({ length: 30 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.barcodeLine,
                    { width: Math.random() > 0.5 ? 3 : 1.5, opacity: 0.3 + Math.random() * 0.7 },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.barcodeId}>SF-{fromCity.code}-{toCity.code}-{Date.now().toString(36).toUpperCase()}</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.takeOffBtn, pressed && styles.takeOffBtnPressed]}
          onPress={handleTakeOff}
          testID="take-off-btn"
        >
          <Text style={styles.takeOffIcon}>🛫</Text>
          <Text style={styles.takeOffText}>TAKE OFF</Text>
        </Pressable>

        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel Flight</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ticketContainer: {
    alignItems: 'center',
  },
  ticket: {
    backgroundColor: '#F5F0E8',
    borderRadius: 20,
    width: '100%',
    overflow: 'hidden',
  },
  ticketHeader: {
    backgroundColor: Colors.navyDark,
    padding: 18,
    alignItems: 'center',
  },
  airline: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.yellow,
    letterSpacing: 2,
  },
  boardingLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 3,
    marginTop: 4,
  },
  ticketDivider: {
    height: 1,
    backgroundColor: '#D4C9B8',
    marginHorizontal: 18,
  },
  passengerRow: {
    padding: 18,
    paddingBottom: 12,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#8B7D6B',
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#2C2416',
  },
  routeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  routeCity: {
    flex: 1,
  },
  routeCityRight: {
    alignItems: 'flex-end',
  },
  routeCode: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: '#2C2416',
    letterSpacing: 1,
  },
  routeName: {
    fontSize: 12,
    color: '#8B7D6B',
    marginTop: 2,
  },
  routeIcon: {
    fontSize: 20,
    marginTop: 4,
  },
  routeArrow: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  routeArrowText: {
    fontSize: 24,
    color: Colors.skyBlueDark,
  },
  routeDuration: {
    fontSize: 11,
    color: '#8B7D6B',
    fontWeight: '600' as const,
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 18,
  },
  detailItem: {
    width: '50%',
    marginBottom: 12,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#2C2416',
  },
  barcodeSection: {
    padding: 18,
    alignItems: 'center',
  },
  barcode: {
    flexDirection: 'row',
    gap: 2,
    height: 40,
    alignItems: 'center',
    marginBottom: 8,
  },
  barcodeLine: {
    height: '100%',
    backgroundColor: '#2C2416',
    borderRadius: 1,
  },
  barcodeId: {
    fontSize: 10,
    color: '#8B7D6B',
    letterSpacing: 1,
    fontWeight: '600' as const,
  },
  takeOffBtn: {
    backgroundColor: Colors.yellow,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    width: '100%',
    gap: 10,
  },
  takeOffBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  takeOffIcon: {
    fontSize: 22,
  },
  takeOffText: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: Colors.navy,
    letterSpacing: 2,
  },
  cancelBtn: {
    marginTop: 16,
    padding: 12,
  },
  cancelText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.coral,
    textAlign: 'center',
    marginBottom: 16,
  },
  backBtn: {
    alignSelf: 'center',
    padding: 12,
  },
  backBtnText: {
    color: Colors.skyBlue,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
