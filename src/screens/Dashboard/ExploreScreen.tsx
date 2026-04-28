import React from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTasks } from '@/context/TaskContext';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Spacing, BorderRadius, Shadows, Typography, Fonts } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { RevealUp } from '@/components/common/reveal-up';

const { width } = Dimensions.get('window');

export default function InsightsScreen() {
  const { tasks, toggleTask } = useTasks();
  const { isDark } = useAppTheme();
  const router = useRouter();
  const theme = Colors[isDark ? 'dark' : 'light'];

  // Split tasks for staggered effect
  const leftColumnTasks = tasks.filter((_, i) => i % 2 === 0);
  const rightColumnTasks = tasks.filter((_, i) => i % 2 !== 0);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <RevealUp delay={100}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <View style={[styles.titleIndicator, { backgroundColor: '#0052ff' }]} />
                <ThemedText style={styles.labelText}>INSIGHTS — 2026</ThemedText>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <ThemedText style={styles.title}>All Activities</ThemedText>
                {/* Secondary FAB for Explore Screen */}
                <TouchableOpacity 
                  style={styles.headerAddBtn}
                  onPress={() => router.push('/task-entry')}
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </RevealUp>

          <View style={styles.staggeredContainer}>
            <View style={styles.column}>
              {leftColumnTasks.map((task, index) => (
                <RevealUp key={task.id} delay={200 + index * 100}>
                  <TouchableOpacity 
                    style={styles.taskItem} 
                    onPress={() => toggleTask(task.id)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.cardSurface}>
                       <ThemedText style={styles.categoryBadge}>Task</ThemedText>
                       {task.done && (
                        <View style={styles.doneOverlay}>
                           <Ionicons name="checkmark-circle" size={32} color="white" />
                        </View>
                       )}
                    </View>
                    <View style={styles.itemMeta}>
                      <ThemedText style={styles.itemTitle}>{task.title}</ThemedText>
                      <ThemedText style={styles.itemSubtitle}>{task.time} • PRIORITY</ThemedText>
                    </View>
                  </TouchableOpacity>
                </RevealUp>
              ))}
            </View>

            <View style={[styles.column, { marginTop: 60 }]}>
              {rightColumnTasks.map((task, index) => (
                <RevealUp key={task.id} delay={300 + index * 100}>
                  <TouchableOpacity 
                    style={styles.taskItem} 
                    onPress={() => toggleTask(task.id)}
                    activeOpacity={0.9}
                  >
                    <View style={[styles.cardSurface, { backgroundColor: '#b7c6c220' }]}>
                       <ThemedText style={styles.categoryBadge}>Routine</ThemedText>
                       {task.done && (
                        <View style={styles.doneOverlay}>
                           <Ionicons name="checkmark-circle" size={32} color="white" />
                        </View>
                       )}
                    </View>
                    <View style={styles.itemMeta}>
                      <ThemedText style={styles.itemTitle}>{task.title}</ThemedText>
                      <ThemedText style={styles.itemSubtitle}>{task.time} • DAILY</ThemedText>
                    </View>
                  </TouchableOpacity>
                </RevealUp>
              ))}
            </View>
          </View>

          {tasks.length === 0 && (
            <RevealUp delay={400}>
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyTitle}>All caught up</ThemedText>
                <ThemedText style={styles.emptySub}>Your activity log is up to date.</ThemedText>
              </View>
            </RevealUp>
          )}

          <View style={{ height: 150 }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeebe3',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  header: {
    marginTop: 120,
    marginBottom: 40,
  },
  headerAddBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0052ff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.blue,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  titleIndicator: {
    width: 4,
    height: 12,
    borderRadius: 2,
  },
  labelText: {
    ...Typography.label,
    color: '#b7c6c2',
  },
  title: {
    ...Typography.h1,
    color: '#171e19',
  },
  staggeredContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
  },
  taskItem: {
    marginBottom: 32,
  },
  cardSurface: {
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(183, 198, 194, 0.3)',
    justifyContent: 'flex-end',
    padding: 16,
    ...Shadows.soft,
  },
  categoryBadge: {
    ...Typography.label,
    fontSize: 8,
    color: '#0052ff',
    backgroundColor: 'rgba(202, 0, 19, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  doneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23, 30, 25, 0.4)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemMeta: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: Fonts.black,
    color: '#171e19',
  },
  itemSubtitle: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#b7c6c2',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    ...Typography.h2,
    color: '#171e19',
  },
  emptySub: {
    ...Typography.body,
    color: '#b7c6c2',
    marginTop: 8,
  },
});
