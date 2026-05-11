import { Stack } from 'expo-router';
import NotificationsScreen from '@/screens/NotificationsScreen';

export default function NotificationsPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <NotificationsScreen />
    </>
  );
}
