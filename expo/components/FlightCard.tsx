import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Plane } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Route } from '@/types';
import { getCityByCode } from '@/data/cities';
import { formatDuration } from '@/utils/helpers';

interface FlightCardProps {
  route: Route;
  onPress: () => void;
}

export default React.memo(function FlightCard({ route, onPress }: FlightCardProps) {
  const fromCity = getCityByCode(route.from);
  const toCity = getCityByCode(route.to);

  if (!fromCity || !toCity) return null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      testID="flight-card"
    >
      <View style={styles.routeRow}>
        <View style={styles.cityBlock}>
          <Text style={styles.cityCode}>{route.from}</Text>
          <Text style={styles.cityName}>{fromCity.name}</Text>
        </View>
        <View style={styles.lineContainer}>
          <View style={styles.dot} />
          <View style={styles.line} />
          <Plane size={18} color={Colors.yellow} style={{ transform: [{ rotate: '0deg' }] }} />
          <View style={styles.line} />
          <View style={styles.dot} />
        </View>
        <View style={[styles.cityBlock, styles.cityBlockRight]}>
          <Text style={styles.cityCode}>{route.to}</Text>
          <Text style={styles.cityName}>{toCity.name}</Text>
        </View>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detail}>{formatDuration(route.durationMinutes)}</Text>
        <Text style={styles.detailDivider}>•</Text>
        <Text style={styles.detail}>{route.distanceMiles.toLocaleString()} mi</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cityBlock: {
    width: 70,
  },
  cityBlockRight: {
    alignItems: 'flex-end',
  },
  cityCode: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.white,
    letterSpacing: 1,
  },
  cityName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  lineContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.skyBlue,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.whiteAlpha,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    justifyContent: 'center',
  },
  detail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailDivider: {
    color: Colors.textMuted,
    marginHorizontal: 8,
  },
});
