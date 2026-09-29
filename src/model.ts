export type AssetKind = 'vehicle' | 'licence';
export type DocumentKind = 'registration' | 'insurance' | 'puc' | 'tax' | 'dl';

export type ExpiryRecord = {
  kind: DocumentKind;
  validUntil: string | null;
  note?: string;
};

export type Asset = {
  id: string;
  kind: AssetKind;
  identifier: string;
  label: string;
  vehicleType?: 'Bike' | 'Car';
  records: ExpiryRecord[];
  checkedAt: string;
  source: 'demo' | 'pending';
};

export const DOCUMENT_LABELS: Record<DocumentKind, string> = {
  registration: 'Registration (RC)',
  insurance: 'Insurance',
  puc: 'PUCC',
  tax: 'Road tax',
  dl: 'Driving licence',
};
