import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, RotateCcw, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { getRankEmoji } from '@/utils/helpers';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, flightLog } = useApp();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.pilotName);

  const handleSaveName = useCallback(() => {
    const trimmed = nameInput.trim();
    if (trimmed.length > 0) {
      updateProfile({ pilotName: trimmed });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setEditingName(false);
  }, [nameInput, updateProfile]);

  const handleResetData = useCallback(() => {
    Alert.alert(
      'Reset All Data',
      'This will erase your pilot profile, flight log, and passport stamps. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            updateProfile({
              pilotName: 'Pilot',
              rank: 'Cadet',
              totalFocusMinutes: 0,
              flightsCompleted: 0,
              citiesVisited: [],
              parentPIN: '',
            });
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  }, [updateProfile]);

  const completedCount = flightLog.filter(f => f.completed).length;
  const cancelledCount = flightLog.filter(f => !f.completed).length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Settings</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{getRankEmoji(profile.rank)}</Text>
          </View>
          <Text style={styles.profileName}>Captain {profile.pilotName}</Text>
          <Text style={styles.profileRank}>{profile.rank}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PILOT NAME</Text>
          {editingName ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Enter pilot name"
                placeholderTextColor={Colors.textMuted}
                autoFocus
                maxLength={20}
                onSubmitEditing={handleSaveName}
              />
              <Pressable style={styles.saveBtn} onPress={handleSaveName}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.settingRow}
              onPress={() => {
                setNameInput(profile.pilotName);
                setEditingName(true);
              }}
            >
              <User size={20} color={Colors.skyBlue} />
              <Text style={styles.settingText}>{profile.pilotName}</Text>
              <Text style={styles.settingAction}>Edit</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FLIGHT STATISTICS</Text>
          <View style={styles.statsList}>
            <View style={styles.statsItem}>
              <Text style={styles.statsLabel}>Total Flights</Text>
              <Text style={styles.statsValue}>{flightLog.length}</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsLabel}>Completed</Text>
              <Text style={[styles.statsValue, { color: Colors.green }]}>{completedCount}</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsLabel}>Cancelled</Text>
              <Text style={[styles.statsValue, { color: Colors.coral }]}>{cancelledCount}</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsLabel}>Cities Visited</Text>
              <Text style={styles.statsValue}>{profile.citiesVisited.length}</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsLabel}>Focus Hours</Text>
              <Text style={styles.statsValue}>
                {(profile.totalFocusMinutes / 60).toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>RANK PROGRESSION</Text>
          <View style={styles.rankList}>
            {(['Cadet', 'Co-Pilot', 'Captain', 'Commander', 'Sky Legend'] as const).map(rank => {
              const isActive = rank === profile.rank;
              const hours = { 'Cadet': 0, 'Co-Pilot': 5, 'Captain': 20, 'Commander': 50, 'Sky Legend': 100 }[rank];
              return (
                <View key={rank} style={[styles.rankItem, isActive && styles.rankItemActive]}>
                  <Text style={styles.rankEmoji}>{getRankEmoji(rank)}</Text>
                  <View style={styles.rankInfo}>
                    <Text style={[styles.rankName, isActive && styles.rankNameActive]}>{rank}</Text>
                    <Text style={styles.rankHours}>{hours}+ hours</Text>
                  </View>
                  {isActive && <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>YOU</Text></View>}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA</Text>
          <Pressable style={styles.dangerRow} onPress={handleResetData}>
            <RotateCcw size={20} color={Colors.coral} />
            <Text style={styles.dangerText}>Reset All Data</Text>
          </Pressable>
        </View>

        <View style={styles.aboutSection}>
          <Info size={14} color={Colors.textMuted} />
          <Text style={styles.aboutText}>SkyFocus v1.0 — Focus through flight</Text>
        </View>

        <View style={{ height: 40 }} />
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
  screenTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.white,
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.whiteAlpha,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  profileRank: {
    fontSize: 14,
    color: Colors.yellow,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
    marginLeft: 12,
  },
  settingAction: {
    fontSize: 14,
    color: Colors.skyBlue,
    fontWeight: '600' as const,
  },
  editRow: {
    flexDirection: 'row',
    gap: 10,
  },
  nameInput: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: Colors.white,
    borderWidth: 2,
    borderColor: Colors.skyBlue,
  },
  saveBtn: {
    backgroundColor: Colors.skyBlue,
    borderRadius: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  saveBtnText: {
    color: Colors.navy,
    fontWeight: '700' as const,
    fontSize: 15,
  },
  statsList: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  statsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.skyBlue,
  },
  rankList: {
    gap: 8,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankItemActive: {
    borderColor: Colors.yellow,
    backgroundColor: Colors.cardBgLight,
  },
  rankEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  rankNameActive: {
    color: Colors.yellow,
  },
  rankHours: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  currentBadge: {
    backgroundColor: Colors.yellow,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.navy,
    letterSpacing: 1,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,138,101,0.08)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,138,101,0.2)',
  },
  dangerText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.coral,
    marginLeft: 12,
  },
  aboutSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  aboutText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
