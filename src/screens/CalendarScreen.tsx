import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { useTasks, Task } from '@/context/TaskContext';
import { Colors, Spacing, Typography, Fonts, Shadows } from '@/constants/theme';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { RevealUp } from '@/components/common/reveal-up';
import { useRouter } from 'expo-router';
import { googleCalendarService, GoogleCalendarEvent } from '@/services/GoogleCalendarService';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { Gesture, GestureDetector, Directions } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const theme = Colors[isDark ? 'dark' : 'light'];
  const { tasks } = useTasks();
  const router = useRouter();

  const { googleToken, isGoogleConnected } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { syncWithGoogle } = useTasks();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Calculate days in the current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding for the first week
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, [currentDate]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const prevMonthGesture = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onStart(() => {
      runOnJS(changeMonth)(-1);
    });

  const nextMonthGesture = Gesture.Fling()
    .direction(Directions.LEFT)
    .onStart(() => {
      runOnJS(changeMonth)(1);
    });

  const swipeGesture = Gesture.Race(prevMonthGesture, nextMonthGesture);

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (isGoogleConnected && googleToken) {
      syncWithGoogle();
    }
  }, [isGoogleConnected, googleToken, currentDate, syncWithGoogle]);

  const tasksForSelectedDate = useMemo(() => {
    const dateStr = formatDateString(selectedDate);
    return tasks.filter(t => t.date === dateStr);
  }, [selectedDate, tasks]);

  const hasTasksOnDate = (date: Date) => {
    const dateStr = formatDateString(date);
    return tasks.some(t => t.date === dateStr);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Fixed Header */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16), backgroundColor: theme.background }]}>
        <View style={styles.headerContent}>
          <View style={styles.titleWrapper}>
            <ThemedText style={styles.headerTitleText}>Calendar</ThemedText>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <RevealUp delay={100}>
          <GestureDetector gesture={swipeGesture}>
            <View style={[styles.calendarCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.calendarHeader}>
              <ThemedText style={[styles.monthText, { color: theme.primary }]}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </ThemedText>
              <View style={styles.navButtons}>
                <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(-1)}>
                  <Ionicons name="chevron-back" size={20} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(1)}>
                  <Ionicons name="chevron-forward" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.daysRow}>
              {daysOfWeek.map((day, i) => (
                <ThemedText key={i} style={styles.dayLabel}>{day}</ThemedText>
              ))}
            </View>

            <View style={styles.datesGrid}>
              {calendarData.map((date, index) => {
                if (!date) return <View key={`p-${index}`} style={styles.dateCell} />;
                
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());
                const hasTasks = hasTasksOnDate(date);

                return (
                  <TouchableOpacity 
                    key={date.toString()} 
                    style={[
                      styles.dateCell, 
                      isSelected && { backgroundColor: theme.accent, borderRadius: 12 }
                    ]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <ThemedText style={[
                      styles.dateText,
                      { color: theme.primary },
                      isSelected && { color: 'white', fontFamily: Fonts.black },
                      isToday && !isSelected && { color: theme.accent, fontFamily: Fonts.black }
                    ]}>
                      {date.getDate()}
                    </ThemedText>
                    {hasTasks && (
                      <View style={[
                        styles.taskDot, 
                        { backgroundColor: isSelected ? 'white' : theme.accent }
                      ]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          </GestureDetector>
        </RevealUp>

        <RevealUp delay={300}>
          <View style={styles.upcomingHeader}>
            <ThemedText style={[styles.upcomingTitle, { color: theme.primary }]}>
              {isSameDay(selectedDate, new Date()) ? "Today's Schedule" : `Schedule for ${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}`}
            </ThemedText>
          </View>
          
          {tasksForSelectedDate.length > 0 ? (
            tasksForSelectedDate.map((task: Task, idx) => (
              <TouchableOpacity 
                key={`${task.id}-${idx}`}
                style={[styles.eventCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => !task.isGoogleTask && router.push({ pathname: '/task-entry', params: { taskId: task.id } })}
                disabled={task.isGoogleTask}
              >
                <View style={[styles.eventIndicator, { backgroundColor: task.isGoogleTask ? '#4285F4' : getCategoryColor(task.category, theme) }]} />
                <View style={styles.eventInfo}>
                  <ThemedText style={styles.eventTime}>{task.time}</ThemedText>
                  <ThemedText style={[styles.eventTitle, { color: theme.primary }]}>{task.title}</ThemedText>
                  <View style={styles.row}>
                    <ThemedText style={styles.eventSub}>{task.category}</ThemedText>
                    {task.isGoogleTask && (
                      <Ionicons name="logo-google" size={14} color="#4285F4" style={{ marginLeft: 8 }} />
                    )}
                  </View>
                </View>
                {!task.isGoogleTask && (
                  <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyEvents}>
              <Ionicons name="cafe-outline" size={32} color={theme.textSecondary} />
              <ThemedText style={styles.emptyEventsText}>No tasks scheduled for this day</ThemedText>
            </View>
          )}
        </RevealUp>
      </ScrollView>
    </ThemedView>
  );
}

const getCategoryColor = (category: string, theme: any) => {
  switch (category.toLowerCase()) {
    case 'work': return '#0052ff';
    case 'personal': return '#10b981';
    case 'shopping': return '#f59e0b';
    case 'health': return '#ef4444';
    default: return theme.accent;
  }
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { zIndex: 100, borderBottomWidth: 1, borderBottomColor: 'rgba(23, 30, 25, 0.05)' },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 64 },
  titleWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitleText: { fontSize: 20, fontFamily: Fonts.black, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 120 },
  calendarCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    ...Shadows.soft,
  },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  monthText: { fontSize: 22, fontFamily: Fonts.black },
  navButtons: { flexDirection: 'row', gap: 8 },
  navBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(183, 198, 194, 0.1)', justifyContent: 'center', alignItems: 'center' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  dayLabel: { fontSize: 14, fontFamily: Fonts.bold, color: Colors.light.secondary, width: 40, textAlign: 'center' },
  datesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dateCell: { width: '14.28%', height: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 4, position: 'relative' },
  dateText: { fontSize: 16, fontFamily: Fonts.bold },
  taskDot: { width: 4, height: 4, borderRadius: 2, position: 'absolute', bottom: 8 },
  upcomingHeader: { marginTop: 32, marginBottom: 16 },
  upcomingTitle: { fontSize: 18, fontFamily: Fonts.black },
  eventCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    ...Shadows.soft,
    alignItems: 'center',
    marginBottom: 12,
  },
  eventIndicator: { width: 4, height: 40, borderRadius: 2, marginRight: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  eventInfo: { flex: 1 },
  eventTime: { fontSize: 12, fontFamily: Fonts.bold, color: Colors.light.accent, marginBottom: 2 },
  eventTitle: { fontSize: 16, fontFamily: Fonts.bold },
  eventSub: { fontSize: 13, fontFamily: Fonts.regular, color: Colors.light.secondary },
  emptyEvents: { alignItems: 'center', marginTop: 20, padding: 32, opacity: 0.5 },
  emptyEventsText: { marginTop: 12, fontSize: 14, fontFamily: Fonts.bold, color: Colors.light.secondary, textAlign: 'center' },
});
