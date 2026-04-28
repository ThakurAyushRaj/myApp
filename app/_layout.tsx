import { DarkTheme, DefaultTheme, ThemeProvider as NavigationProvider } from '@react-navigation/native';
import { 
  useFonts, 
  Nunito_400Regular, 
  Nunito_700Bold, 
  Nunito_800ExtraBold, 
  Nunito_900Black 
} from '@expo-google-fonts/nunito';
import { 
  LeagueSpartan_400Regular,
  LeagueSpartan_700Bold,
  LeagueSpartan_900Black 
} from '@expo-google-fonts/league-spartan';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ThemeProvider, useAppTheme } from '@/context/ThemeContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { TaskProvider } from '@/context/TaskContext';

function RootLayoutNav() {
  const { theme, isDark } = useAppTheme();
  const [loaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    LeagueSpartan_400Regular,
    LeagueSpartan_700Bold,
    LeagueSpartan_900Black,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <NavigationProvider value={isDark ? DarkTheme : DefaultTheme}>
      <TaskProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </TaskProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationProvider>
  );
}


export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}


