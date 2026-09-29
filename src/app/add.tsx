import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import type { Asset, AssetKind } from '../model';
import { DOCUMENT_LABELS } from '../model';
import { fetchDemoAsset } from '../demoProvider';
import { loadAssets, upsertAsset } from '../storage';
import { reconcileNotifications } from '../notifications';
import { parseLocalDate } from '../reminders';
import { colors, styles } from '../ui';
import { VehicleIllustration } from '../VehicleIllustration';

export default function AddScreen() {
  const [kind, setKind] = useState<AssetKind>('vehicle');
  const [vehicleType, setVehicleType] = useState<'Bike' | 'Car'>('Car');
  const [identifier, setIdentifier] = useState('');
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [samplePreview, setSamplePreview] = useState<Asset | null>(null);
  const normalized = identifier.toUpperCase().replace(/[\s-]/g, '');
  const validIdentifier = /^[A-Z0-9]{7,20}$/.test(normalized);
  const currentPreview = samplePreview?.kind === kind && samplePreview.identifier === normalized && samplePreview.vehicleType === (kind === 'vehicle' ? vehicleType : undefined) ? samplePreview : null;

  async function loadSample() {
    const sampleNumber = kind === 'licence' ? 'DEMODL001' : vehicleType === 'Bike' ? 'DEMOBIKE01' : 'DEMOCAR001';
    setBusy(true);
    setError('');
    try {
      const sample = await fetchDemoAsset({
        id: 'preview',
        kind,
        identifier: sampleNumber,
        label: kind === 'vehicle' ? `${vehicleType} sample` : 'DL sample',
        vehicleType: kind === 'vehicle' ? vehicleType : undefined,
      });
      setIdentifier(sampleNumber);
      setSamplePreview(sample);
    } catch {
      setError('Could not load sample data. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function addAsset() {
    if (!validIdentifier) {
      setError(`Enter a valid ${kind === 'vehicle' ? 'registration' : 'DL'} number.`);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const existing = await loadAssets();
      if (existing.some((asset) => asset.kind === kind && asset.identifier === normalized)) {
        setError('This number is already in your garage.');
        return;
      }
      const asset: Asset = {
        ...(currentPreview ?? {
          kind,
          identifier: normalized,
          vehicleType: kind === 'vehicle' ? vehicleType : undefined,
          records: [],
          checkedAt: '',
          source: 'pending' as const,
        }),
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: label.trim() || (kind === 'vehicle' ? `${vehicleType} ${normalized}` : `DL ${normalized}`),
      };
      const updated = await upsertAsset(asset);
      await reconcileNotifications(updated);
      router.replace({ pathname: '/asset/[id]', params: { id: asset.id } });
    } catch {
      setError('Could not save this record. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>Step 1</Text>
      <Text style={styles.title}>Add a record</Text>
      <Text style={styles.subtitle}>Save a number now. Automatic expiry lookup will be available when a live data provider is connected.</Text>

      <Text style={styles.label}>What are you adding?</Text>
      <View style={[styles.row, { gap: 10, marginTop: 8 }]}>
        {(['vehicle', 'licence'] as const).map((option) => (
          <Pressable key={option} onPress={() => { setKind(option); setSamplePreview(null); setError(''); }} style={[styles.card, { flex: 1, marginBottom: 0, borderColor: kind === option ? colors.green : colors.border, backgroundColor: kind === option ? colors.paleGreen : colors.card }]}>
            <Text style={[styles.body, { fontWeight: '800', color: kind === option ? colors.green : colors.ink }]}>{option === 'vehicle' ? 'Vehicle' : 'Driving licence'}</Text>
          </Pressable>
        ))}
      </View>

      {kind === 'vehicle' ? (
        <><Text style={styles.label}>Vehicle type</Text><View style={[styles.row, { gap: 10, marginTop: 8 }]}>
          {(['Bike', 'Car'] as const).map((option) => (
            <Pressable key={option} onPress={() => { setVehicleType(option); setSamplePreview(null); }} style={[styles.card, { flex: 1, marginBottom: 0, borderColor: vehicleType === option ? colors.green : colors.border }]}>
              <Text style={styles.body}>{option}</Text>
            </Pressable>
          ))}
        </View></>
      ) : null}

      <Text style={styles.label}>{kind === 'vehicle' ? 'Registration number' : 'Driving licence number'}</Text>
      <TextInput style={styles.input} value={identifier} onChangeText={(value) => { setIdentifier(value); setSamplePreview(null); setError(''); }} autoCapitalize="characters" autoCorrect={false} placeholder={kind === 'vehicle' ? 'e.g. DL01AB1234' : 'Enter DL number'} placeholderTextColor={colors.muted} />

      {validIdentifier && !currentPreview ? <Text style={[styles.muted, { marginTop: 12 }]}>No vehicle or expiry details have been fetched for this number. It can be saved, but no expiry reminders will be scheduled yet.</Text> : null}
      {currentPreview ? (
        <View style={[styles.card, { marginTop: 20, borderColor: colors.green }]}>
          <Text style={[styles.eyebrow, { color: colors.amber }]}>Demo preview</Text>
          <Text style={[styles.assetLabel, { marginTop: 8 }]}>{currentPreview.identifier}</Text>
          <Text style={[styles.muted, { marginTop: 5 }]}>This number has not been checked against government records. The dates below are examples.</Text>
          {kind === 'vehicle' ? (
            <>
              <View style={{ marginTop: 14 }}><VehicleIllustration vehicleType={vehicleType} /></View>
              <Text style={[styles.body, { marginTop: 14 }]}>Vehicle type: {vehicleType} (selected by you)</Text>
              <Text style={[styles.muted, { marginTop: 4 }]}>Make and model: unavailable until a live data provider is connected</Text>
            </>
          ) : null}
          <Text style={[styles.body, { fontWeight: '800', marginTop: 18, marginBottom: 5 }]}>Sample validity dates</Text>
          {currentPreview.records.map((record) => {
            const date = record.validUntil ? parseLocalDate(record.validUntil) : null;
            return (
              <View key={record.kind} style={[styles.row, { paddingVertical: 8, gap: 12, borderTopColor: colors.border, borderTopWidth: 1 }]}>
                <Text style={[styles.body, { flex: 1 }]}>{DOCUMENT_LABELS[record.kind]}</Text>
                <Text style={[styles.muted, { textAlign: 'right', flex: 1 }]}>{date ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : record.note || 'Unavailable'}</Text>
              </View>
            );
          })}
        </View>
      ) : null}

      <Pressable disabled={busy} style={[styles.secondaryButton, { marginTop: 16 }]} onPress={() => { void loadSample(); }}>
        <Text style={styles.secondaryButtonText}>Try a sample {kind === 'vehicle' ? vehicleType.toLowerCase() : 'licence'} instead</Text>
      </Pressable>

      <Text style={styles.label}>Nickname (optional)</Text>
      <TextInput style={styles.input} value={label} onChangeText={setLabel} placeholder={kind === 'vehicle' ? 'e.g. Family car' : 'e.g. My licence'} placeholderTextColor={colors.muted} />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable disabled={busy || !validIdentifier} style={[styles.button, { marginTop: 24, opacity: busy || !validIdentifier ? 0.6 : 1 }]} onPress={addAsset}>
        {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Add to garage</Text>}
      </Pressable>
      <Text style={[styles.muted, { marginTop: 14 }]}>Only the sample option creates test dates. Real lookups require an approved provider connection.</Text>
    </ScrollView>
  );
}
