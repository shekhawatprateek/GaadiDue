import type { Asset } from './model';

export async function enableNotifications(): Promise<boolean> { return false; }
export async function notificationsEnabled(): Promise<boolean> { return false; }
export async function reconcileNotifications(_assets: Asset[]): Promise<number> { return 0; }
export async function sendTestNotification(): Promise<void> { throw new Error('Use an Android or iOS device to test notifications.'); }
