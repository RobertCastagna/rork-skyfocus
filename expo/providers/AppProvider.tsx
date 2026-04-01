import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, FlightLog, ActiveFlight } from '@/types';
import { getRankForMinutes } from '@/utils/helpers';

const DEFAULT_PROFILE: UserProfile = {
  pilotName: 'Pilot',
  rank: 'Cadet',
  totalFocusMinutes: 0,
  flightsCompleted: 0,
  citiesVisited: [],
  parentPIN: '',
};

const STORAGE_KEYS = {
  profile: 'skyfocus_profile',
  flightLog: 'skyfocus_flight_log',
  activeFlight: 'skyfocus_active_flight',
};

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [flightLog, setFlightLog] = useState<FlightLog[]>([]);
  const [activeFlight, setActiveFlight] = useState<ActiveFlight | null>(null);

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.profile);
      return stored ? (JSON.parse(stored) as UserProfile) : DEFAULT_PROFILE;
    },
  });

  const flightLogQuery = useQuery({
    queryKey: ['flightLog'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.flightLog);
      return stored ? (JSON.parse(stored) as FlightLog[]) : [];
    },
  });

  const activeFlightQuery = useQuery({
    queryKey: ['activeFlight'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.activeFlight);
      return stored ? (JSON.parse(stored) as ActiveFlight) : null;
    },
  });

  useEffect(() => {
    if (profileQuery.data) setProfile(profileQuery.data);
  }, [profileQuery.data]);

  useEffect(() => {
    if (flightLogQuery.data) setFlightLog(flightLogQuery.data);
  }, [flightLogQuery.data]);

  useEffect(() => {
    if (activeFlightQuery.data !== undefined) setActiveFlight(activeFlightQuery.data);
  }, [activeFlightQuery.data]);

  const saveProfileMutation = useMutation({
    mutationFn: async (newProfile: UserProfile) => {
      await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(newProfile));
      return newProfile;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  const saveFlightLogMutation = useMutation({
    mutationFn: async (newLog: FlightLog[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.flightLog, JSON.stringify(newLog));
      return newLog;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flightLog'] }),
  });

  const saveActiveFlightMutation = useMutation({
    mutationFn: async (flight: ActiveFlight | null) => {
      if (flight) {
        await AsyncStorage.setItem(STORAGE_KEYS.activeFlight, JSON.stringify(flight));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.activeFlight);
      }
      return flight;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activeFlight'] }),
  });

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...updates };
      updated.rank = getRankForMinutes(updated.totalFocusMinutes);
      saveProfileMutation.mutate(updated);
      return updated;
    });
  }, [saveProfileMutation]);

  const startFlight = useCallback((flight: ActiveFlight) => {
    setActiveFlight(flight);
    saveActiveFlightMutation.mutate(flight);
  }, [saveActiveFlightMutation]);

  const completeFlight = useCallback((flightEntry: FlightLog) => {
    setFlightLog(prev => {
      const newLog = [flightEntry, ...prev];
      saveFlightLogMutation.mutate(newLog);
      return newLog;
    });

    setProfile(prev => {
      const newCities = [...new Set([...prev.citiesVisited, flightEntry.arrivalCity, flightEntry.departureCity])];
      const updated: UserProfile = {
        ...prev,
        totalFocusMinutes: prev.totalFocusMinutes + flightEntry.durationMinutes,
        flightsCompleted: prev.flightsCompleted + 1,
        citiesVisited: newCities,
        rank: getRankForMinutes(prev.totalFocusMinutes + flightEntry.durationMinutes),
      };
      saveProfileMutation.mutate(updated);
      return updated;
    });

    setActiveFlight(null);
    saveActiveFlightMutation.mutate(null);
  }, [saveProfileMutation, saveFlightLogMutation, saveActiveFlightMutation]);

  const cancelFlight = useCallback(() => {
    setActiveFlight(current => {
      if (current) {
        const entry: FlightLog = {
          id: current.id,
          departureCity: current.fromCity.code,
          arrivalCity: current.toCity.code,
          durationMinutes: current.durationMinutes,
          startedAt: current.startedAt,
          completedAt: null,
          completed: false,
          stampEarned: false,
        };
        setFlightLog(prev => {
          const newLog = [entry, ...prev];
          saveFlightLogMutation.mutate(newLog);
          return newLog;
        });
      }
      saveActiveFlightMutation.mutate(null);
      return null;
    });
  }, [saveFlightLogMutation, saveActiveFlightMutation]);

  const isLoading = profileQuery.isLoading || flightLogQuery.isLoading || activeFlightQuery.isLoading;

  return useMemo(() => ({
    profile,
    flightLog,
    activeFlight,
    isLoading,
    updateProfile,
    startFlight,
    completeFlight,
    cancelFlight,
  }), [profile, flightLog, activeFlight, isLoading, updateProfile, startFlight, completeFlight, cancelFlight]);
});
