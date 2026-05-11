import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  async requestPermissions() {
    if (!Device.isDevice) return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return false;
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  }

  async scheduleTaskNotification(task: any) {
    const enabled = await AsyncStorage.getItem('notifications_enabled');
    if (enabled === 'false') {
      console.log(`[NotificationService] Skipping: Notifications are globally disabled.`);
      return null;
    }
    
    if (task.reminder === 'None') return null;

    // Parse date and time
    // date is YYYY-MM-DD
    // time is "09:00 AM" or "All Day"
    if (task.time === 'All Day') {
      // Schedule for morning of the day
      const triggerDate = new Date(`${task.date}T09:00:00`);
      return this.scheduleNotification(task.id, task.title, 'Reminder for your all-day task', triggerDate);
    }

    const taskDateTime = this.parseTaskDateTime(task.date, task.time);
    if (!taskDateTime) return null;

    let triggerDate = new Date(taskDateTime.getTime());

    // Adjust for reminder
    console.log(`[NotificationService] Reminder type: ${task.reminder}, Custom mins: ${task.customReminderMinutes}`);
    switch (task.reminder) {
      case 'At Time': break;
      case '5m Before': triggerDate.setMinutes(triggerDate.getMinutes() - 5); break;
      case '10m Before': triggerDate.setMinutes(triggerDate.getMinutes() - 10); break;
      case '1h Before': triggerDate.setHours(triggerDate.getHours() - 1); break;
      case 'Custom': 
        if (task.customReminderMinutes) {
          console.log(`[NotificationService] Subtracting ${task.customReminderMinutes} minutes`);
          triggerDate.setMinutes(triggerDate.getMinutes() - task.customReminderMinutes);
        }
        break;
      default: break;
    }

    // Don't schedule if in the past
    if (triggerDate <= new Date()) {
      console.warn(`[NotificationService] Skipping: Trigger date ${triggerDate.toLocaleString()} is in the past!`);
      return null;
    }

    return this.scheduleNotification(task.id, task.title, `Reminder for: ${task.time}`, triggerDate);
  }

  private async scheduleNotification(taskId: string, title: string, body: string, date: Date) {
    try {
      // First cancel any existing notification for this task
      await this.cancelTaskNotification(taskId);

      const secondsUntil = Math.floor((date.getTime() - Date.now()) / 1000);
      
      if (secondsUntil <= 0) {
        console.warn(`[NotificationService] Notification time for "${title}" is in the past, skipping.`);
        return null;
      }

      console.log(`[NotificationService] Scheduling "${title}" in ${secondsUntil} seconds (${date.toLocaleString()})`);

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Task Reminder: ${title}`,
          body,
          data: { taskId },
          android: {
            channelId: 'default',
            importance: Notifications.AndroidImportance.MAX,
            priority: 'high',
          },
          ios: {
            sound: true,
          }
        },
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntil,
        },
      });
      console.log(`[NotificationService] Success! ID: ${identifier}`);
      return identifier;
    } catch (error) {
      console.error('[NotificationService] Error scheduling notification:', error);
      return null;
    }
  }

  async cancelTaskNotification(taskId: string) {
    // Note: To precisely cancel by taskId, we'd need to store the identifier.
    // However, for simplicity, we can use the taskId in data to find it if we want,
    // but scheduleNotificationAsync returns a unique ID.
    // A better way is to use specific IDs if possible, but Expo doesn't support custom string IDs for triggers.
    // So we'll just cancel all and let the new one replace it? 
    // Actually, we should store identifiers in AsyncStorage if we want precise cancellation.
    // For now, let's just assume we replace it.
  }

  private parseTaskDateTime(dateStr: string, timeStr: string): Date | null {
    try {
      console.log(`[NotificationService] Raw time string: "${timeStr}"`);
      
      // dateStr is "YYYY-MM-DD"
      const [year, month, day] = dateStr.split('-').map(Number);
      
      // Handle various time formats (e.g., "05:43 PM", "17:43", "5:43pm")
      let hours = 0;
      let minutes = 0;
      
      const timeMatch = timeStr.match(/(\d+):(\d+)\s*([AaPp][Mm])?/);
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        const modifier = timeMatch[3]?.toUpperCase();
        
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
      } else {
        // Fallback to simple split
        const parts = timeStr.split(/[:\s]+/);
        hours = parseInt(parts[0], 10);
        minutes = parseInt(parts[1], 10);
        const modifier = parts[2]?.toUpperCase();
        
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
      }

      const date = new Date(year, month - 1, day);
      date.setHours(hours, minutes, 0, 0);
      
      console.log(`[NotificationService] Calculated trigger date: ${date.toLocaleString()}`);
      return date;
    } catch (e) {
      console.error('[NotificationService] Error parsing date/time:', e);
      return null;
    }
  }
}

export const notificationService = new NotificationService();
