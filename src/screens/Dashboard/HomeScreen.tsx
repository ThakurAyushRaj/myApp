import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Fonts,
  Shadows
} from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useTasks } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { CustomAlert } from '@/components/common/themed-dialog';
import { RevealUp } from '@/components/common/reveal-up';

const { width } = Dimensions.get('window');



export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useAppTheme();
  const theme = Colors[isDark ? 'dark' : 'light'];
  const { tasks = [], toggleTask, toggleSubtask, syncWithGoogle, isLoading } = useTasks();

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const showAlert = (title: string, message: string, onConfirm?: () => void, confirmText = 'OK') => {
    setAlertConfig({ visible: true, title, message, onConfirm, confirmText });
  };
  const { userName, userImage } = useAuth();
  const [activeCat, setActiveCat] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await syncWithGoogle();
    } catch (error) {
      console.log('HomeScreen: Refresh failed silently:', error);
    } finally {
      setRefreshing(false);
    }
  }, [syncWithGoogle]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) return 'Good Night,';
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const displayName = userName || 'Guest';
  console.log('HomeScreen: rendering with displayName:', displayName, 'greeting:', getGreeting());

  const getLocalTodayStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalTodayStr();
  const todayTasks = tasks.filter(t => t.date === todayStr);

  const now = new Date();

  const parseDateTime = (date: string, time: string = '') => {
    const [y, m, d] = date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const timeMatch = (time || '').match(/(\d+):(\d+)\s*([AaPp][Mm])/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const min = parseInt(timeMatch[2], 10);
      const mod = timeMatch[3].toUpperCase();
      if (mod === 'PM' && h < 12) h += 12;
      if (mod === 'AM' && h === 12) h = 0;
      dateObj.setHours(h, min, 0, 0);
    } else {
      dateObj.setHours(0, 0, 0, 0);
    }
    return dateObj;
  };

  const pendingTasks = todayTasks.filter(t => !t.done && parseDateTime(t.date, t.time) < now);
  const completedTasks = todayTasks.filter(t => t.done);
  const upcomingTasks = todayTasks.filter(t => !t.done && parseDateTime(t.date, t.time) >= now);

  const allCount = todayTasks.length;
  const pendingTodayCount = todayTasks.filter(t => !t.done).length;

  const dynamicCategories = [
    { id: 'all', title: 'All Activities', value: allCount.toString() },
    { id: 'pending', title: 'Pending', value: pendingTasks.length.toString() },
    { id: 'Completed', title: 'Completed', value: completedTasks.length.toString() },
    { id: 'Upcoming', title: 'Upcoming', value: upcomingTasks.length.toString() },
  ];

  const filteredTasks = todayTasks.filter(t => {
    if (activeCat === 'pending') return !t.done && parseDateTime(t.date, t.time) < now;
    if (activeCat === 'Completed') return t.done;
    if (activeCat === 'Upcoming') return !t.done && parseDateTime(t.date, t.time) >= now;
    return true;
  });

  // Calculate detailed progress including subtasks
  const progressData = todayTasks.reduce((acc, task) => {
    // Main task contributes 1 point
    acc.total += 1;
    if (task.done) acc.earned += 1;

    // Each subtask contributes 1 point
    if (task.subtasks && task.subtasks.length > 0) {
      acc.total += task.subtasks.length;
      acc.earned += task.subtasks.filter((st: any) => st.done).length;
    }
    return acc;
  }, { total: 0, earned: 0 });

  const completionRate = progressData.total > 0 
    ? Math.round((progressData.earned / progressData.total) * 100) 
    : 0;

  const handleToggleTask = (task: any) => {
    if (task.done) {
      showAlert("Already Completed", "This activity is already completed and cannot be undone.");
      return;
    }

    // Parse task date and time to compare with current time
    const [year, month, day] = task.date.split('-').map(Number);
    const taskDateObj = new Date(year, month - 1, day);
    
    // Improved time parsing
    const timeMatch = task.time.match(/(\d+):(\d+)\s*([AaPp][Mm])/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const modifier = timeMatch[3].toUpperCase();
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      taskDateObj.setHours(hours, minutes, 0, 0);
    } else {
      // If it's "All Day" or invalid format, we'll check just the date
      taskDateObj.setHours(0, 0, 0, 0);
    }

    const now = new Date();
    
    if (taskDateObj > now) {
      showAlert("Too Early", "You can't mark this activity done before the given time and date.");
      return;
    }

    // Ask for confirmation
    const confirmDone = () => {
      toggleTask(task.id);
    };

    if (Platform.OS === 'web') {
      if (confirm("Are you sure you want to mark this activity as done?")) {
        confirmDone();
      }
    } else {
      showAlert(
        "Confirm Completion",
        "Are you sure you want to mark this activity as done?",
        confirmDone,
        "Mark Done"
      );
    }
  };

  const handleToggleSubtask = (task: any, subtaskId: string) => {
    const subtask = task.subtasks?.find((s: any) => s.id === subtaskId);
    if (!subtask) return;

    if (subtask.done) {
      showAlert("Already Completed", "This subtask is already completed and cannot be undone.");
      return;
    }

    // Reuse logic for future date check
    const [year, month, day] = task.date.split('-').map(Number);
    const taskDateObj = new Date(year, month - 1, day);
    const timeMatch = task.time.match(/(\d+):(\d+)\s*([AaPp][Mm])/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const modifier = timeMatch[3].toUpperCase();
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      taskDateObj.setHours(hours, minutes, 0, 0);
    } else {
      taskDateObj.setHours(0, 0, 0, 0);
    }

    if (taskDateObj > new Date()) {
      showAlert("Too Early", "You can't mark subtasks as done before the given time and date.");
      return;
    }

    toggleSubtask(task.id, subtaskId);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.accent}
              colors={[theme.accent]}
            />
          }
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <ThemedText style={styles.headerLabel}>{getGreeting()}</ThemedText>
                  <ThemedText style={[styles.headerTitle, { color: theme.primary }]}>{displayName}</ThemedText>
                </View>
                <View style={styles.headerRight}>
                  <TouchableOpacity
                    onPress={toggleTheme}
                    style={[styles.themeToggle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23, 30, 25, 0.05)' }]}
                  >
                    <Ionicons name={isDark ? "sunny" : "moon"} size={22} color={theme.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => router.push('/settings')}
                    style={[styles.themeToggle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23, 30, 25, 0.05)', overflow: 'hidden' }]}
                  >
                    {userImage ? (
                      <Image source={{ uri: userImage }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Ionicons name="person" size={22} color={theme.text} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
               {/* Horizontal Scroll Selector */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catScroll}
                snapToInterval={172}
                decelerationRate="fast"
              >
                {dynamicCategories.map((cat) => {
                  const isActive = activeCat === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setActiveCat(cat.id)}
                      style={[
                        styles.catItem,
                        isActive
                           ? [styles.catItemActive, { backgroundColor: isDark ? theme.accent : theme.primary }]
                           : [styles.catItemInactive, { backgroundColor: theme.surface, borderColor: theme.border }]
                      ]}
                    >
                      {isActive ? (
                        <View style={styles.activePillContent}>
                          <View style={[styles.activeCircleHighlight, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : theme.accent }]}>
                            <ThemedText style={[styles.activeCircleText, { color: 'white' }]}>{cat.value}</ThemedText>
                          </View>
                          <ThemedText style={[styles.activePillTitle, { color: 'white' }]}>{cat.title}</ThemedText>
                        </View>
                      ) : (
                        <ThemedText style={styles.inactiveValueText}>{cat.value}</ThemedText>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>





            </>
          }
          renderItem={({ item, index }) => (
            <RevealUp key={item.id} delay={100 + index * 50}>
              <TaskCard
                task={item}
                onPress={() => router.push({ pathname: '/task-entry', params: { taskId: item.id } })}
                onToggle={() => handleToggleTask(item)}
                onToggleSubtask={(subId) => handleToggleSubtask(item, subId)}
              />
            </RevealUp>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No {activeCat} activities for today</ThemedText>
            </View>
          }
          ListFooterComponent={
            <View style={{ paddingBottom: 100 }}>
              {/* Hero Feature Card at the bottom */}
              <RevealUp delay={200}>
                <View style={[styles.heroCard, Shadows.soft, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: Spacing.xl }]}>
                  <View style={[styles.heroDecorativeBlob, { backgroundColor: theme.secondary + '33' }]} />
                  <View style={styles.heroHeaderRow}>
                    <View style={[styles.heroIconContainer, { backgroundColor: theme.surface }]}>
                      <ThemedText style={{ fontSize: 32 }}>📊</ThemedText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.heroCardTitle}>Your Daily Progress</ThemedText>
                      <ThemedText style={styles.heroCardSub}>You&apos;re doing great!</ThemedText>
                    </View>

                  </View>

                  <View style={styles.heroMetricsGrid}>
                    <View style={[styles.glassMetricCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.8)' }]}>
                      <ThemedText style={styles.metricLabel}>Completion</ThemedText>
                      <ThemedText style={[styles.metricValue, { color: theme.primary }]}>{completionRate}%</ThemedText>
                    </View>
                    <View style={[styles.glassMetricCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.8)' }]}>
                      <ThemedText style={styles.metricLabel}>Pending</ThemedText>
                      <ThemedText style={[styles.metricValue, { color: theme.primary }]}>{pendingTodayCount}</ThemedText>
                    </View>
                  </View>

                  <View style={[styles.heroAlertBox, { backgroundColor: theme.secondary + '26' }]}>
                    <Ionicons name="sparkles" size={18} color={theme.accent} />
                    <ThemedText style={[styles.heroAlertText, { color: theme.accent }]}>Either you run the day, or the day runs you!!</ThemedText>
                  </View>
                </View>
              </RevealUp>
            </View>
          }
        />
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.confirmText}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </ThemedView>
  );
}

function TaskCard({ task, onPress, onToggle, onToggleSubtask }: {
  task: any,
  onPress: () => void,
  onToggle: () => void,
  onToggleSubtask: (subId: string) => void
}) {
  const { isDark } = useAppTheme();
  const theme = Colors[isDark ? 'dark' : 'light'];

  return (
    <TouchableOpacity
      style={[styles.taskCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.taskMainRow}>
        <TouchableOpacity
          style={[styles.circularCheckbox, task.done && styles.checkboxActive]}
          onPress={onToggle}
        >
          {task.done && <Ionicons name="checkmark" size={24} color="white" />}
        </TouchableOpacity>

        <View style={styles.taskTextWrapper}>
          <ThemedText style={[styles.taskTitleText, { color: theme.primary }, task.done && styles.taskDoneText]}>
            {task.title}
          </ThemedText>
          <ThemedText style={styles.taskSubtitleText}>
            {task.time}
          </ThemedText>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#b7c6c2" />
      </View>

      {task.subtasks && task.subtasks.length > 0 && !task.done && (
        <View style={styles.subtasksPreview}>
          {task.subtasks.slice(0, 3).map((sub: any) => (
            <TouchableOpacity
              key={sub.id}
              style={styles.subtaskRow}
              onPress={() => onToggleSubtask(sub.id)}
            >
              <View style={[styles.miniCheckbox, sub.done && styles.miniCheckboxActive]}>
                {sub.done && <Ionicons name="checkmark" size={10} color="white" />}
              </View>
              <ThemedText
                style={[styles.subtaskText, { color: theme.primary }, sub.done && styles.subtaskDoneText]}
                numberOfLines={1}
              >
                {sub.text}
              </ThemedText>
            </TouchableOpacity>
          ))}
          {task.subtasks.length > 3 && (
            <ThemedText style={styles.moreSubtasks}>
              + {task.subtasks.length - 3} more
            </ThemedText>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  header: {
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.light.secondary,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    marginTop: 2,
  },
  profileWrapper: {
    position: 'relative',
  },
  profileBorder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  profileImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  notifBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.accent,
    borderWidth: 2,
  },
  catScroll: {
    paddingVertical: Spacing.md,
    gap: 12,
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  catItem: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  catItemInactive: {
    width: 56,
    borderWidth: 1,
  },
  catItemActive: {
    width: 160,
    borderRadius: 16,
  },
  inactiveValueText: {
    ...Typography.h2,
    color: Colors.light.secondary,
  },
  activePillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 12,
  },
  activeCircleHighlight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircleText: {
    color: Colors.light.surface,
    fontFamily: Fonts.black,
    fontSize: 16,
  },
  activePillTitle: {
    color: Colors.light.surface,
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
  heroCard: {
    padding: 24,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    borderWidth: 1,
  },
  heroDecorativeBlob: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    zIndex: -1,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: Spacing.xl,
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  heroCardTitle: {
    ...Typography.h2,
  },
  heroCardSub: {
    ...Typography.small,
    color: Colors.light.secondary,
    marginTop: 2,
  },
  heroQuickAdd: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.blue,
  },
  heroMetricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.xl,
  },
  glassMetricCard: {
    flex: 1,
    backgroundColor: Colors.light.glass,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  metricLabel: {
    ...Typography.label,
    color: Colors.light.secondary,
    fontSize: 8,
  },
  metricValue: {
    fontSize: 18,
    fontFamily: Fonts.black,
    marginTop: 4,
  },
  heroAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(183, 198, 194, 0.15)',
    padding: 12,
    borderRadius: 12,
  },
  heroAlertText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: Colors.light.accent,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitleText: {
    ...Typography.h2,
    fontFamily: Fonts.bold,
  },
  seeAllActionText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.light.accent,
  },
  taskCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    ...Shadows.soft,
  },
  taskMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTextWrapper: {
    flex: 1,
    marginLeft: 16,
  },
  taskTitleText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  taskDoneText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  taskSubtitleText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.light.secondary,
    marginTop: 2,
  },
  circularCheckbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(183, 198, 194, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.light.accent,
    borderColor: Colors.light.accent,
  },
  subtasksPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(183, 198, 194, 0.1)',
    paddingLeft: 40 + 16, // Align with text wrapper
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  miniCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.light.secondary,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCheckboxActive: {
    backgroundColor: Colors.light.accent,
    borderColor: Colors.light.accent,
  },
  subtaskText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    flex: 1,
  },
  subtaskDoneText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  moreSubtasks: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.light.secondary,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.light.secondary,
  },
});
