import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight, Shuffle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { cities } from '@/data/cities';
import { findRoute, routes } from '@/data/routes';
import { formatDuration } from '@/utils/helpers';
import { City } from '@/types';

export default function BookFlightScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [fromCity, setFromCity] = useState<City | null>(null);
  const [toCity, setToCity] = useState<City | null>(null);
  const [selectingFor, setSelectingFor] = useState<'from' | 'to'>('from');

  const availableCities = useMemo(() => {
    if (selectingFor === 'to' && fromCity) {
      const connectedCodes = routes
        .filter(r => r.from === fromCity.code || r.to === fromCity.code)
        .map(r => r.from === fromCity.code ? r.to : r.from);
      return cities.filter(c => connectedCodes.includes(c.code));
    }
    if (selectingFor === 'from' && toCity) {
      const connectedCodes = routes
        .filter(r => r.from === toCity.code || r.to === toCity.code)
        .map(r => r.from === toCity.code ? r.to : r.from);
      return cities.filter(c => connectedCodes.includes(c.code));
    }
    return cities;
  }, [selectingFor, fromCity, toCity]);

  const selectedRoute = useMemo(() => {
    if (!fromCity || !toCity) return null;
    return findRoute(fromCity.code, toCity.code);
  }, [fromCity, toCity]);

  const handleCitySelect = useCallback((city: City) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectingFor === 'from') {
      setFromCity(city);
      if (toCity) {
        const route = findRoute(city.code, toCity.code);
        if (!route) setToCity(null);
      }
      setSelectingFor('to');
    } else {
      setToCity(city);
    }
  }, [selectingFor, toCity]);

  const handleShuffle = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const randomRoute = routes[Math.floor(Math.random() * routes.length)];
    setFromCity(cities.find(c => c.code === randomRoute.from) ?? null);
    setToCity(cities.find(c => c.code === randomRoute.to) ?? null);
  }, []);

  const handleBoard = useCallback(() => {
    if (!fromCity || !toCity) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: '/boarding',
      params: { from: fromCity.code, to: toCity.code },
    });
  }, [fromCity, toCity, router]);

  const renderCityItem = useCallback(({ item }: { item: City }) => {
    const isSelected = (selectingFor === 'from' && fromCity?.code === item.code) ||
                       (selectingFor === 'to' && toCity?.code === item.code);
    return (
      <Pressable
        style={[styles.cityItem, isSelected && styles.cityItemSelected]}
        onPress={() => handleCitySelect(item)}
      >
        <Text style={styles.cityIcon}>{item.icon}</Text>
        <View style={styles.cityInfo}>
          <Text style={[styles.cityName, isSelected && styles.cityNameSelected]}>{item.name}</Text>
          <Text style={styles.cityCountry}>{item.flagEmoji} {item.country}</Text>
        </View>
        <Text style={[styles.cityCode, isSelected && styles.cityCodeSelected]}>{item.code}</Text>
      </Pressable>
    );
  }, [selectingFor, fromCity, toCity, handleCitySelect]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Book Your Flight</Text>
        <Pressable style={styles.shuffleBtn} onPress={handleShuffle}>
          <Shuffle size={18} color={Colors.skyBlue} />
        </Pressable>
      </View>

      <View style={styles.selectionRow}>
        <Pressable
          style={[styles.selectionCard, selectingFor === 'from' && styles.selectionCardActive]}
          onPress={() => setSelectingFor('from')}
        >
          <Text style={styles.selectionLabel}>FROM</Text>
          <Text style={styles.selectionValue}>
            {fromCity ? `${fromCity.icon} ${fromCity.code}` : 'Select'}
          </Text>
          {fromCity && <Text style={styles.selectionCity}>{fromCity.name}</Text>}
        </Pressable>

        <View style={styles.arrowContainer}>
          <ArrowRight size={20} color={Colors.yellow} />
        </View>

        <Pressable
          style={[styles.selectionCard, selectingFor === 'to' && styles.selectionCardActive]}
          onPress={() => setSelectingFor('to')}
        >
          <Text style={styles.selectionLabel}>TO</Text>
          <Text style={styles.selectionValue}>
            {toCity ? `${toCity.icon} ${toCity.code}` : 'Select'}
          </Text>
          {toCity && <Text style={styles.selectionCity}>{toCity.name}</Text>}
        </Pressable>
      </View>

      {selectedRoute && (
        <View style={styles.routeInfo}>
          <View style={styles.routeInfoRow}>
            <View style={styles.routeInfoItem}>
              <Text style={styles.routeInfoLabel}>Duration</Text>
              <Text style={styles.routeInfoValue}>{formatDuration(selectedRoute.durationMinutes)}</Text>
            </View>
            <View style={styles.routeInfoDivider} />
            <View style={styles.routeInfoItem}>
              <Text style={styles.routeInfoLabel}>Distance</Text>
              <Text style={styles.routeInfoValue}>{selectedRoute.distanceMiles.toLocaleString()} mi</Text>
            </View>
          </View>
          <Text style={styles.funFact}>💡 {selectedRoute.funFact}</Text>
        </View>
      )}

      <View style={styles.pickerHeader}>
        <Text style={styles.pickerTitle}>
          {selectingFor === 'from' ? 'Select Departure' : 'Select Destination'}
        </Text>
        <Text style={styles.pickerCount}>{availableCities.length} cities</Text>
      </View>

      <FlatList
        data={availableCities}
        renderItem={renderCityItem}
        keyExtractor={(item) => item.code}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {selectedRoute && (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable
            style={({ pressed }) => [styles.boardBtn, pressed && styles.boardBtnPressed]}
            onPress={handleBoard}
            testID="board-flight-btn"
          >
            <Text style={styles.boardBtnText}>Board Flight</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  shuffleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.whiteAlpha,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 16,
    gap: 8,
  },
  selectionCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 80,
  },
  selectionCardActive: {
    borderColor: Colors.skyBlue,
  },
  selectionLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700' as const,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  selectionValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  selectionCity: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.whiteAlpha,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeInfo: {
    marginHorizontal: 20,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  routeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  routeInfoDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.whiteAlpha,
  },
  routeInfoLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  routeInfoValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.skyBlue,
    marginTop: 4,
  },
  funFact: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 12,
    lineHeight: 18,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  pickerCount: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cityItemSelected: {
    borderColor: Colors.skyBlue,
    backgroundColor: Colors.cardBgLight,
  },
  cityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  cityNameSelected: {
    color: Colors.skyBlue,
  },
  cityCountry: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cityCode: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  cityCodeSelected: {
    color: Colors.skyBlue,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.navyDark,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  boardBtn: {
    backgroundColor: Colors.yellow,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  boardBtnText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.navy,
  },
});
