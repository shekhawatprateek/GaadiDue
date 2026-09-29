import type { Asset, DocumentKind } from './model';

export const REMINDER_DAYS = [30, 14, 7, 1, 0] as const;
const MAX_PENDING_REMINDERS = 50;

export type PlannedReminder = {
  assetId: string;
  documentKind: DocumentKind;
  daysBefore: number;
  when: Date;
  label: string;
};

export function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 9);
  if (date.getFullYear() !== Number(match[1]) || date.getMonth() !== Number(match[2]) - 1 || date.getDate() !== Number(match[3])) return null;
  return date;
}

export function daysUntil(value: string, now = new Date()): number | null {
  const date = parseLocalDate(value);
  if (!date) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9);
  const target = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - start) / 86_400_000);
}

export function planReminders(assets: Asset[], now = new Date()): PlannedReminder[] {
  const planned: PlannedReminder[] = [];
  for (const asset of assets) {
    if (asset.source === 'pending') continue;
    for (const record of asset.records) {
      if (!record.validUntil) continue;
      const expiry = parseLocalDate(record.validUntil);
      if (!expiry) continue;
      for (const daysBefore of REMINDER_DAYS) {
        const when = new Date(expiry);
        when.setDate(when.getDate() - daysBefore);
        if (when <= now) continue;
        planned.push({ assetId: asset.id, documentKind: record.kind, daysBefore, when, label: asset.label });
      }
    }
  }
  return planned.sort((a, b) => a.when.getTime() - b.when.getTime()).slice(0, MAX_PENDING_REMINDERS);
}
