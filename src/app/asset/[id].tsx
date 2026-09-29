import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import type { Asset, DocumentKind, ExpiryRecord } from '../../model';
import { DOCUMENT_LABELS } from '../../model';
import { fetchDemoAsset } from '../../demoProvider';
import { loadAssets, removeAsset, upsertAsset } from '../../storage';
import { notificationsEnabled, reconcileNotifications } from '../../notifications';
import { daysUntil, parseLocalDate } from '../../reminders';
import { colors, styles } from '../../ui';
import { VehicleIllustration } from '../../VehicleIllustration';

function recordStatus(record: ExpiryRecord): { text: string; color: string; background: string } {
  if (!record.validUntil) return { text: record.note || 'No date available', color: colors.muted, background: colors.background };
  const days = daysUntil(record.validUntil);
  if (days === null) return { text: 'Date unavailable', color: colors.muted, background: colors.background };
  if (days < 0) return { text: `Expired ${Math.abs(days)} days ago`, color: colors.red, background: colors.paleRed };
  if (days === 0) return { text: 'Expires today', color: colors.red, background: colors.paleRed };
  if (days <= 30) return { text: `${days} days left`, color: colors.amber, background: colors.paleAmber };
  return { text: `${days} days left`, color: colors.green, background: colors.paleGreen };
}

export default function AssetDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    loadAssets()
      .then((assets) => { if (active) setAsset(assets.find((item) => item.id === id) ?? null); })
      .catch(() => { if (active) setError('Could not load this record.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]));

  async function refresh(renewedKind?: DocumentKind) {
    if (!asset || asset.source !== 'demo') return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const updated = await fetchDemoAsset(asset, renewedKind);
      const assets = await upsertAsset(updated);
      setAsset(updated);
      const count = await reconcileNotifications(assets);
      const enabled = await notificationsEnabled();
      setNotice(renewedKind
        ? `${DOCUMENT_LABELS[renewedKind]} renewal imported. ${enabled ? `${count} upcoming reminders rescheduled.` : 'Enable notifications on your phone to schedule reminders.'}`
        : `Demo source checked. ${enabled ? `${count} upcoming reminders scheduled.` : 'Enable notifications on your phone to schedule reminders.'}`);
    } catch {
      setError('Could not refresh the demo data.');
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete() {
    if (!asset) return;
    Alert.alert('Remove record?', `Remove ${asset.label} and its reminders from this device?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { void deleteAsset(); } },
    ]);
  }

  async function deleteAsset() {
    if (!asset) return;
    setBusy(true);
    try {
      const remaining = await removeAsset(asset.id);
      await reconcileNotifications(remaining);
      router.replace('/');
    } catch {
      setError('Could not remove this record.');
      setBusy(false);
    }
  }

  if (loading) return <View style={styles.screen}><ActivityIndicator color={colors.green} style={{ marginTop: 40 }} /></View>;
  if (!asset) return <View style={[styles.screen, styles.content]}><Text style={styles.error}>{error || 'Record not found.'}</Text></View>;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.replace('/')} style={{ marginBottom: 12 }}><Text style={{ color: colors.green, fontWeight: '800' }}>‹ Back to garage</Text></Pressable>
      <Text style={styles.eyebrow}>{asset.kind === 'vehicle' ? asset.vehicleType : 'Driving licence'}</Text>
      <Text style={styles.title}>{asset.label}</Text>
      <Text style={styles.subtitle}>{asset.identifier}</Text>

      {asset.kind === 'vehicle' ? <View style={{ marginTop: 20 }}><VehicleIllustration vehicleType={asset.vehicleType} /></View> : null}

      <View style={[styles.card, { backgroundColor: colors.paleAmber, borderColor: colors.paleAmber, marginTop: 20 }]}>
        <Text style={[styles.body, { color: colors.amber, fontWeight: '800' }]}>{asset.source === 'demo' ? 'Sample dates only' : 'Live lookup unavailable'}</Text>
        <Text style={[styles.muted, { marginTop: 4 }]}>{asset.source === 'demo' ? `Sample generated ${new Date(asset.checkedAt).toLocaleString('en-IN')}. These dates do not describe this registered vehicle or licence.` : 'This number is saved, but no details or expiry dates have been fetched. Reminders will begin only when a live provider supplies dates.'}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {notice ? <Text style={[styles.muted, { marginBottom: 12 }]}>{notice}</Text> : null}

      <Text style={styles.sectionTitle}>Expiry dates</Text>
      {asset.records.length === 0 ? <View style={styles.card}><Text style={styles.muted}>Expiry dates unavailable. Automatic lookup has not been connected yet.</Text></View> : null}
      {asset.records.map((record) => {
        const status = recordStatus(record);
        const parsed = record.validUntil ? parseLocalDate(record.validUntil) : null;
        return (
          <View key={record.kind} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.assetLabel}>{DOCUMENT_LABELS[record.kind]}</Text>
              <Text style={[styles.muted, { color: status.color, fontWeight: '800' }]}>{status.text}</Text>
            </View>
            <Text style={[styles.body, { marginTop: 9 }]}>{parsed ? parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No expiry date'}</Text>
            {record.validUntil ? (
              <Pressable disabled={busy} onPress={() => { void refresh(record.kind); }} style={{ marginTop: 13 }}>
                <Text style={{ color: colors.green, fontWeight: '800' }}>Simulate renewal ↗</Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}

      {asset.source === 'demo' ? <Pressable disabled={busy} style={styles.button} onPress={() => { void refresh(); }}>
        {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Check sample source again</Text>}
      </Pressable> : null}
      <Pressable disabled={busy} style={[styles.secondaryButton, { marginTop: 12, borderColor: colors.red }]} onPress={confirmDelete}>
        <Text style={[styles.secondaryButtonText, { color: colors.red }]}>Remove this record</Text>
      </Pressable>
    </ScrollView>
  );
}
