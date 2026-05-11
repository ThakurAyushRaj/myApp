import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const { theme: currentTheme, isDark } = useAppTheme();
  const theme = Colors[currentTheme];
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#b7c6c2',
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="create"
        options={{
          tabBarLabel: () => null,
          tabBarButton: () => (
            <View style={styles.fabWrapper}>
               <TouchableOpacity 
                style={styles.fab} 
                onPress={() => router.push('/task-entry')}
                activeOpacity={0.9}
               >
                 <Ionicons name="add" size={32} color="white" />
               </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    height: 75,
    paddingBottom: 10,
    paddingTop: 8,
    backgroundColor: '#171e19',
    borderRadius: 32,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0052ff',
    justifyContent: 'center',
    alignItems: 'center',
    top: -20, 
    borderWidth: 4,
    borderColor: '#eeebe3', 
    ...Shadows.blue,
    zIndex: 1000,
  },
});
