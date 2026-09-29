import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import type { Asset } from '../model';
import { loadAssets } from '../storage';
import { daysUntil } from '../reminders';
import { enableNotifications, notificationsEnabled, reconcileNotifications, sendTestNotification } from '../notifications';
import { colors, styles } from '../ui';

function nextExpiry(asset: Asset): string {
  if (asset.source === 'pending') return 'Dates unavailable';
  const dates = asset.records
    .filter((record) => record.validUntil)
    .map((record) => ({ record, days: daysUntil(record.validUntil!) }))
    .filter((item) => item.days !== null)
    .sort((a, b) => a.days! - b.days!);
  if (!dates.length) return 'No dated record';
  const next = dates[0];
  if (next.days! < 0) return `${next.record.kind.toUpperCase()} expired`;
  if (next.days === 0) return `${next.record.kind.toUpperCase()} expires today`;
  return `${next.record.kind.toUpperCase()} in ${next.days} days`;
}

export default function HomeScreen() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    Promise.all([loadAssets(), notificationsEnabled()])
      .then(([saved, permission]) => {
        if (!active) return;
        setAssets(saved);
        setEnabled(permission);
        setError('');
        if (permission) void reconcileNotifications(saved).catch(() => setError('Could not refresh reminders. Try reopening the app.'));
      })
      .catch(() => { if (active) setError('Could not load saved records.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  async function turnOnReminders() {
    setBusy(true);
    setError('');
    try {
      const allowed = await enableNotifications();
      setEnabled(allowed);
      if (!allowed) {
        setError(Platform.OS === 'web' ? 'Open the app on Android to test local notifications.' : 'Notifications are off. Allow them in device settings to receive reminders.');
        return;
      }
      const count = await reconcileNotifications(assets);
      setNotice(`${count} upcoming demo reminders scheduled on this device.`);
    } catch {
      setError('Could not enable reminders on this device.');
    } finally {
      setBusy(false);
    }
  }

  async function testReminder() {
    setBusy(true);
    setError('');
    try {
      await sendTestNotification();
      setNotice('A test reminder is scheduled for 5 seconds from now.');
    } catch {
      setError('Could not schedule the test reminder.');
    } finally {
      setBusy(false);
    }
  }

  const vehicles = assets.filter((asset) => asset.kind === 'vehicle');
  const licences = assets.filter((asset) => asset.kind === 'licence');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Your garage</Text>
      <Text style={styles.title}>GaadiDue</Text>
      <Text style={styles.subtitle}>Know what needs renewal before it expires.</Text>

      <View style={[styles.card, { backgroundColor: colors.paleAmber, borderColor: colors.paleAmber, marginTop: 22 }]}>
        <Text style={[styles.body, { fontWeight: '800', color: colors.amber }]}>Live lookup is not connected</Text>
        <Text style={[styles.muted, { marginTop: 5 }]}>Saved numbers have no fetched dates or expiry reminders. Sample records are for testing only and do not come from VAHAN, SARATHI, or DigiLocker.</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {notice ? <Text style={[styles.muted, { marginBottom: 12 }]}>{notice}</Text> : null}

      <Pressable style={styles.button} onPress={() => router.push('/add')}>
        <Text style={styles.buttonText}>+ Add vehicle or licence</Text>
      </Pressable>

      {loading ? <ActivityIndicator color={colors.green} style={{ marginTop: 30 }} /> : (
        <>
          <Text style={styles.sectionTitle}>Vehicles · {vehicles.length}</Text>
          {vehicles.length === 0 ? (
            <View style={styles.card}><Text style={styles.body}>No vehicles yet</Text><Text style={[styles.muted, { marginTop: 5 }]}>Save a registration number, or try a clearly marked sample.</Text></View>
          ) : vehicles.map((asset) => (
            <Pressable key={asset.id} style={styles.card} onPress={() => router.push({ pathname: '/asset/[id]', params: { id: asset.id } })}>
              <View style={styles.row}><Text style={styles.assetLabel}>{asset.label}</Text><Text style={styles.muted}>›</Text></View>
              <Text style={[styles.muted, { marginTop: 4 }]}>{asset.identifier} · {asset.vehicleType}{asset.source === 'demo' ? ' · Sample data' : ''}</Text>
              <View style={styles.pill}><Text style={styles.pillText}>{nextExpiry(asset)}</Text></View>
            </Pressable>
          ))}

          <Text style={styles.sectionTitle}>Driving licences · {licences.length}</Text>
          {licences.length === 0 ? (
            <View style={styles.card}><Text style={styles.muted}>Add a licence holder to track their DL separately from the vehicles.</Text></View>
          ) : licences.map((asset) => (
            <Pressable key={asset.id} style={styles.card} onPress={() => router.push({ pathname: '/asset/[id]', params: { id: asset.id } })}>
              <View style={styles.row}><Text style={styles.assetLabel}>{asset.label}</Text><Text style={styles.muted}>›</Text></View>
              <Text style={[styles.muted, { marginTop: 4 }]}>{asset.identifier}{asset.source === 'demo' ? ' · Sample data' : ''}</Text>
              <View style={styles.pill}><Text style={styles.pillText}>{nextExpiry(asset)}</Text></View>
            </Pressable>
          ))}
        </>
      )}

      <Text style={styles.sectionTitle}>Reminders</Text>
      <View style={styles.card}>
        <Text style={styles.body}>{enabled ? 'Enabled on this device' : 'Notifications are off'}</Text>
        <Text style={[styles.muted, { marginTop: 5, marginBottom: 14 }]}>Sample records can schedule test reminders 30, 14, 7 and 1 day before expiry, and on the expiry date at about 9:00 am. Saved numbers without fetched dates schedule none.</Text>
        {enabled ? (
          <Pressable disabled={busy} style={styles.secondaryButton} onPress={testReminder}><Text style={styles.secondaryButtonText}>Send test in 5 seconds</Text></Pressable>
        ) : (
          <Pressable disabled={busy} style={styles.secondaryButton} onPress={turnOnReminders}><Text style={styles.secondaryButtonText}>Enable reminders</Text></Pressable>
        )}
      </View>
    </ScrollView>
  );
}
