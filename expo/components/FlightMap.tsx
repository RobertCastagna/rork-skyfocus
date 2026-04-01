import React, { useMemo } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop, G, Rect, Text as SvgText } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { City } from '@/types';
import { interpolateCoords } from '@/utils/helpers';

interface FlightMapProps {
  fromCity: City;
  toCity: City;
  progress: number;
}

const NUM_ROUTE_POINTS = 80;

let MapView: any;
let MapPolyline: any;
let MapMarker: any;
let PROVIDER_GOOGLE: any;
if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    MapPolyline = maps.Polyline;
    MapMarker = maps.Marker;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  } catch {
    console.log('react-native-maps not available');
  }
}

function SvgFlightMap({ fromCity, toCity, progress }: FlightMapProps) {
  const SVG_W = 400;
  const SVG_H = 300;

  const { routePath, traveledPath, planePos, fromPos, toPos, planeBearing } = useMemo(() => {
    const minLat = Math.min(fromCity.latitude, toCity.latitude);
    const maxLat = Math.max(fromCity.latitude, toCity.latitude);
    const minLon = Math.min(fromCity.longitude, toCity.longitude);
    const maxLon = Math.max(fromCity.longitude, toCity.longitude);

    const padLat = Math.max((maxLat - minLat) * 0.35, 5);
    const padLon = Math.max((maxLon - minLon) * 0.35, 8);

    const viewMinLat = minLat - padLat;
    const viewMaxLat = maxLat + padLat;
    const viewMinLon = minLon - padLon;
    const viewMaxLon = maxLon + padLon;

    const latRange = viewMaxLat - viewMinLat;
    const lonRange = viewMaxLon - viewMinLon;

    const scaleX = SVG_W / lonRange;
    const scaleY = SVG_H / latRange;
    const sc = Math.min(scaleX, scaleY);

    const projX = (lon: number) => (lon - viewMinLon) * sc + (SVG_W - lonRange * sc) / 2;
    const projY = (lat: number) => (viewMaxLat - lat) * sc + (SVG_H - latRange * sc) / 2;

    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= NUM_ROUTE_POINTS; i++) {
      const t = i / NUM_ROUTE_POINTS;
      const coord = interpolateCoords(
        fromCity.latitude, fromCity.longitude,
        toCity.latitude, toCity.longitude,
        t
      );
      points.push({ x: projX(coord.lon), y: projY(coord.lat) });
    }

    const toPathStr = (pts: { x: number; y: number }[]) => {
      if (pts.length === 0) return '';
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        d += ` L ${pts[i].x} ${pts[i].y}`;
      }
      return d;
    };

    const stopIndex = Math.floor(progress * NUM_ROUTE_POINTS);
    const traveled = points.slice(0, stopIndex + 1);

    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    const planeCoord = interpolateCoords(
      fromCity.latitude, fromCity.longitude,
      toCity.latitude, toCity.longitude,
      clampedProgress
    );
    const planeXY = { x: projX(planeCoord.lon), y: projY(planeCoord.lat) };

    const nextT = Math.min(clampedProgress + 0.02, 1);
    const nextCoord = interpolateCoords(
      fromCity.latitude, fromCity.longitude,
      toCity.latitude, toCity.longitude,
      nextT
    );
    const nextXY = { x: projX(nextCoord.lon), y: projY(nextCoord.lat) };
    const bearing = Math.atan2(nextXY.y - planeXY.y, nextXY.x - planeXY.x) * (180 / Math.PI);

    return {
      routePath: toPathStr(points),
      traveledPath: toPathStr(traveled),
      planePos: planeXY,
      fromPos: { x: projX(fromCity.longitude), y: projY(fromCity.latitude) },
      toPos: { x: projX(toCity.longitude), y: projY(toCity.latitude) },
      planeBearing: bearing,
    };
  }, [fromCity, toCity, progress]);

  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; horizontal: boolean }[] = [];
    for (let i = 1; i < 6; i++) {
      const y = (SVG_H / 6) * i;
      lines.push({ x1: 0, y1: y, x2: SVG_W, y2: y, horizontal: true });
    }
    for (let i = 1; i < 8; i++) {
      const x = (SVG_W / 8) * i;
      lines.push({ x1: x, y1: 0, x2: x, y2: SVG_H, horizontal: false });
    }
    return lines;
  }, []);

  return (
    <View style={svgStyles.container}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#0a1628" />
            <Stop offset="100%" stopColor="#112240" />
          </LinearGradient>
          <LinearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={Colors.skyBlue} stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#81D4FA" stopOpacity="0.9" />
          </LinearGradient>
        </Defs>

        <Rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#bgGrad)" />

        {gridLines.map((line, i) => (
          <Line
            key={i}
            x1={line.x1} y1={line.y1}
            x2={line.x2} y2={line.y2}
            stroke="rgba(79,195,247,0.06)"
            strokeWidth="0.5"
          />
        ))}

        <Path
          d={routePath}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="2"
          strokeDasharray="6,6"
          fill="none"
        />

        {traveledPath.length > 0 && (
          <Path
            d={traveledPath}
            stroke="url(#routeGlow)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        )}

        <G>
          <Circle cx={fromPos.x} cy={fromPos.y} r="14" fill="rgba(79,195,247,0.12)" />
          <Circle cx={fromPos.x} cy={fromPos.y} r="8" fill="rgba(79,195,247,0.25)" />
          <Circle cx={fromPos.x} cy={fromPos.y} r="4" fill={Colors.skyBlue} />
          <SvgText
            x={fromPos.x}
            y={fromPos.y - 20}
            fill={Colors.skyBlue}
            fontSize="11"
            fontWeight="800"
            textAnchor="middle"
            letterSpacing={1}
          >
            {fromCity.code}
          </SvgText>
        </G>

        <G>
          <Circle cx={toPos.x} cy={toPos.y} r="14" fill="rgba(255,213,79,0.12)" />
          <Circle cx={toPos.x} cy={toPos.y} r="8" fill="rgba(255,213,79,0.25)" />
          <Circle cx={toPos.x} cy={toPos.y} r="4" fill={Colors.yellow} />
          <SvgText
            x={toPos.x}
            y={toPos.y - 20}
            fill={Colors.yellow}
            fontSize="11"
            fontWeight="800"
            textAnchor="middle"
            letterSpacing={1}
          >
            {toCity.code}
          </SvgText>
        </G>

        <G transform={`translate(${planePos.x}, ${planePos.y}) rotate(${planeBearing - 90})`}>
          <Circle cx="0" cy="0" r="10" fill="rgba(255,255,255,0.1)" />
          <Path
            d="M 0 -7 L 3 2 L 6 3 L 0 1 L -6 3 L -3 2 Z"
            fill={Colors.white}
          />
          <Path
            d="M -3 2 L 0 4 L 3 2 L 0 1 Z"
            fill="rgba(255,255,255,0.6)"
          />
        </G>
      </Svg>
    </View>
  );
}

function NativeFlightMap({ fromCity, toCity, progress }: FlightMapProps) {
  const routeCoords = useMemo(() => {
    const points: { latitude: number; longitude: number }[] = [];
    for (let i = 0; i <= NUM_ROUTE_POINTS; i++) {
      const t = i / NUM_ROUTE_POINTS;
      const coord = interpolateCoords(
        fromCity.latitude, fromCity.longitude,
        toCity.latitude, toCity.longitude,
        t
      );
      points.push({ latitude: coord.lat, longitude: coord.lon });
    }
    return points;
  }, [fromCity, toCity]);

  const traveledCoords = useMemo(() => {
    const stopIndex = Math.floor(progress * NUM_ROUTE_POINTS);
    return routeCoords.slice(0, stopIndex + 1);
  }, [routeCoords, progress]);

  const planePosition = useMemo(() => {
    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    const coord = interpolateCoords(
      fromCity.latitude, fromCity.longitude,
      toCity.latitude, toCity.longitude,
      clampedProgress
    );
    return { latitude: coord.lat, longitude: coord.lon };
  }, [fromCity, toCity, progress]);

  const region = useMemo(() => {
    const minLat = Math.min(fromCity.latitude, toCity.latitude);
    const maxLat = Math.max(fromCity.latitude, toCity.latitude);
    const minLon = Math.min(fromCity.longitude, toCity.longitude);
    const maxLon = Math.max(fromCity.longitude, toCity.longitude);

    const latDelta = Math.max((maxLat - minLat) * 1.6, 10);
    const lonDelta = Math.max((maxLon - minLon) * 1.6, 10);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lonDelta,
    };
  }, [fromCity, toCity]);

  if (!MapView) {
    return <SvgFlightMap fromCity={fromCity} toCity={toCity} progress={progress} />;
  }

  return (
    <View style={nativeStyles.container}>
      <MapView
        style={nativeStyles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsTraffic={false}
        showsBuildings={false}
        showsIndoors={false}
        showsPointsOfInterest={false}
        mapType="standard"
        userInterfaceStyle="dark"
        customMapStyle={darkMapStyle}
      >
        <MapPolyline
          coordinates={routeCoords}
          strokeColor="rgba(255,255,255,0.2)"
          strokeWidth={2}
          lineDashPattern={[10, 8]}
        />

        {traveledCoords.length > 1 && (
          <MapPolyline
            coordinates={traveledCoords}
            strokeColor={Colors.skyBlue}
            strokeWidth={4}
          />
        )}

        <MapMarker
          coordinate={{ latitude: fromCity.latitude, longitude: fromCity.longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <View style={nativeStyles.cityMarker}>
            <View style={[nativeStyles.cityDot, { backgroundColor: Colors.skyBlue }]} />
            <Text style={nativeStyles.cityLabel}>{fromCity.code}</Text>
          </View>
        </MapMarker>

        <MapMarker
          coordinate={{ latitude: toCity.latitude, longitude: toCity.longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <View style={nativeStyles.cityMarker}>
            <View style={[nativeStyles.cityDot, { backgroundColor: Colors.yellow }]} />
            <Text style={nativeStyles.cityLabel}>{toCity.code}</Text>
          </View>
        </MapMarker>

        <MapMarker
          coordinate={planePosition}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={true}
        >
          <View style={nativeStyles.planeContainer}>
            <Text style={nativeStyles.planeEmoji}>✈️</Text>
          </View>
        </MapMarker>
      </MapView>
    </View>
  );
}

export default React.memo(function FlightMap({ fromCity, toCity, progress }: FlightMapProps) {
  if (Platform.OS === 'web') {
    return <SvgFlightMap fromCity={fromCity} toCity={toCity} progress={progress} />;
  }
  return <NativeFlightMap fromCity={fromCity} toCity={toCity} progress={progress} />;
});

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#162230' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#1a2d42' }] },
  { featureType: 'road', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#243447' }, { weight: 0.5 }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#2a3f55' }] },
];

const svgStyles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#0a1628',
  },
});

const nativeStyles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  map: {
    flex: 1,
  },
  cityMarker: {
    alignItems: 'center',
  },
  cityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  cityLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '800' as const,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  planeContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planeEmoji: {
    fontSize: 22,
  },
});
