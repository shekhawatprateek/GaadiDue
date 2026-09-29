import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Asset } from './model';
import { DOCUMENT_LABELS } from './model';
import { planReminders } from './reminders';

const CHANNEL_ID = 'expiry-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function enableNotifications(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Expiry reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function notificationsEnabled(): Promise<boolean> {
  return (await Notifications.getPermissionsAsync()).granted;
}

export async function reconcileNotifications(assets: Asset[]): Promise<number> {
  if (!(await notificationsEnabled())) return 0;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Expiry reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  const reminders = planReminders(assets);
  for (const reminder of reminders) {
    const document = DOCUMENT_LABELS[reminder.documentKind];
    const timing = reminder.daysBefore === 0 ? 'expires today' : `expires in ${reminder.daysBefore} day${reminder.daysBefore === 1 ? '' : 's'}`;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${document} ${timing}`,
        body: `Sample data for ${reminder.label}. Check the test record in GaadiDue.`,
        data: { assetId: reminder.assetId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.when,
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
    });
  }
  return reminders.length;
}

export async function sendTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title: 'GaadiDue test reminder', body: 'Your reminders are enabled.' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
    },
  });
}
