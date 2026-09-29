import type { Asset, AssetKind, DocumentKind, ExpiryRecord } from './model';

function dateFromToday(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function initialRecords(kind: AssetKind, identifier: string): ExpiryRecord[] {
  if (kind === 'licence') return [{ kind: 'dl', validUntil: dateFromToday(180) }];

  const hasTaxDate = identifier.charCodeAt(identifier.length - 1) % 2 === 0;
  return [
    { kind: 'registration', validUntil: dateFromToday(280) },
    { kind: 'insurance', validUntil: dateFromToday(45) },
    { kind: 'puc', validUntil: dateFromToday(12) },
    hasTaxDate
      ? { kind: 'tax', validUntil: dateFromToday(100) }
      : { kind: 'tax', validUntil: null, note: 'Lifetime tax shown in demo data' },
  ];
}

/** Simulates a provider response; replace only this boundary when an API is approved. */
export async function fetchDemoAsset(
  asset: Pick<Asset, 'id' | 'kind' | 'identifier' | 'label' | 'vehicleType'> & Partial<Pick<Asset, 'records'>>,
  renewedKind?: DocumentKind,
): Promise<Asset> {
  const records = asset.records?.length ? asset.records.map((record) => ({ ...record })) : initialRecords(asset.kind, asset.identifier);
  if (renewedKind) {
    const record = records.find((item) => item.kind === renewedKind);
    if (record?.validUntil) record.validUntil = dateFromToday(365);
  }

  return {
    id: asset.id,
    kind: asset.kind,
    identifier: asset.identifier,
    label: asset.label,
    vehicleType: asset.vehicleType,
    records,
    checkedAt: new Date().toISOString(),
    source: 'demo',
  };
}
