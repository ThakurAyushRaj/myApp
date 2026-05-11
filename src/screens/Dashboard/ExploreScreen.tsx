import React from 'react';
import { StyleSheet, View, TouchableOpacity, SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTasks, Task, Priority } from '@/context/TaskContext';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Typography, Fonts, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { RevealUp } from '@/components/common/reveal-up';

export default function AllActivitiesScreen() {
  const { tasks } = useTasks();
  const { isDark } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = Colors[isDark ? 'dark' : 'light'];

  const todayStr = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const sections = [
    {
      title: "TODAY'S ACTIVITIES",
      data: tasks.filter(t => t.date === todayStr),
    },
    {
      title: 'UPCOMING ACTIVITIES',
      data: tasks
        .filter(t => t.date > todayStr)
        .sort((a, b) => a.date.localeCompare(b.date)),
    },
    {
      title: 'PAST HISTORY',
      data: tasks
        .filter(t => t.date < todayStr)
        .sort((a, b) => b.date.localeCompare(a.date)),
    },
  ].filter(section => section.data.length > 0);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scrollContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <RevealUp delay={100}>
              <View style={styles.header}>
                {/* Small label: OVERVIEW — 2026 (appears ABOVE "All Activities") */}
                <View style={styles.titleRow}>
                  <View style={[styles.titleIndicator, { backgroundColor: theme.accent }]} />
                  <ThemedText style={[styles.labelText, { color: theme.textSecondary }]}>OVERVIEW — {new Date().getFullYear()}</ThemedText>
                </View>
                {/* Big title + Add button row (appears BELOW label) */}
                <View style={styles.headerMain}>
                  <ThemedText style={[styles.title, { color: theme.primary }]}>All Activities</ThemedText>
                  <TouchableOpacity
                    style={[styles.headerAddBtn, { backgroundColor: theme.accent }]}
                    onPress={() => router.push('/task-entry')}
                  >
                    <Ionicons name="add" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </RevealUp>
          }
          renderSectionHeader={({ section: { title } }) => (
            <ThemedText style={[styles.sectionHeader, { color: theme.textSecondary }]}>{title}</ThemedText>
          )}
          renderItem={({ item, index }) => (
            <RevealUp delay={150 + index * 50}>
              <TaskCard task={item} onPress={() => router.push({ pathname: '/task-entry', params: { taskId: item.id } })} />
            </RevealUp>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={theme.textSecondary} />
              <ThemedText style={[styles.emptyTitle, { color: theme.textSecondary }]}>No activities found</ThemedText>
            </View>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      </View>
    </ThemedView>
  );
}

function TaskCard({ task, onPress }: { task: Task; onPress: () => void }) {
  const { isDark } = useAppTheme();
  const theme = Colors[isDark ? 'dark' : 'light'];

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case 'High': return theme.accent;
      case 'Medium': return theme.warning;
      case 'Low': return theme.success;
      default: return theme.accent;
    }
  };

  const subtaskCount = task.subtasks?.length || 0;

  return (
    <TouchableOpacity
      style={[styles.taskCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.priorityPill, { backgroundColor: getPriorityColor(task.priority) + '15' }]}>
          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
          <ThemedText style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
            {task.priority.toUpperCase()}
          </ThemedText>
        </View>
        {task.done && <Ionicons name="checkmark-circle" size={20} color={theme.success} />}
      </View>

      <ThemedText style={[styles.cardTitle, { color: theme.primary }, task.done && styles.doneText]}>
        {task.title}
      </ThemedText>

      <View style={styles.cardMetadata}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
          <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>{task.date} • {task.time}</ThemedText>
        </View>
        {subtaskCount > 0 && (
          <View style={styles.metaItem}>
            <Ionicons name="list-outline" size={14} color={theme.textSecondary} />
            <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>{subtaskCount} subtasks</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.categoryChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(23, 30, 25, 0.05)' }]}>
          <ThemedText style={[styles.categoryText, { color: theme.primary }]}>{task.category}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  // Reduced marginTop from 60 to 16 to fix the content starting too low
  header: { marginTop: 16, marginBottom: 24 },
  headerMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerAddBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  // titleRow is above headerMain so OVERVIEW shows above "All Activities"
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  titleIndicator: { width: 4, height: 12, borderRadius: 2 },
  labelText: { ...Typography.label },
  title: { ...Typography.h1 },
  sectionHeader: {
    ...Typography.label,
    marginTop: 32,
    marginBottom: 16,
    letterSpacing: 2,
    marginLeft: 4,
  },
  taskCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    ...Shadows.soft,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  priorityText: { fontSize: 10, fontFamily: Fonts.black, letterSpacing: 0.5 },
  cardTitle: { fontSize: 20, fontFamily: Fonts.bold, marginBottom: 12 },
  cardMetadata: { gap: 8, marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, fontFamily: Fonts.regular },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end' },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  categoryText: { fontSize: 12, fontFamily: Fonts.bold },
  doneText: { textDecorationLine: 'line-through', opacity: 0.5 },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: Fonts.bold },
});
