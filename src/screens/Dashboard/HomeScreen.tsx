import React from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  SafeAreaView, 
  Dimensions, 
  TouchableOpacity, 
  Image,
} from 'react-native';
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
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { RevealUp } from '@/components/common/reveal-up';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', title: 'All Tasks', value: '7' },
  { id: 'work', title: 'Work', value: '3' },
  { id: 'health', title: 'Health', value: '✓' },
  { id: 'study', title: 'Study', value: '1' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const theme = Colors[isDark ? 'dark' : 'light'];
  const { tasks, toggleTask } = useTasks();
  const [activeCat, setActiveCat] = React.useState('all');

  const pendingCount = tasks.filter(t => !t.done).length;
  const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) : 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.headerLabel}>GOOD MORNING,</ThemedText>
              <ThemedText style={styles.headerTitle}>Rajay</ThemedText>
            </View>
            <View style={styles.profileWrapper}>
              <View style={styles.profileBorder}>
                <Image 
                  source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajay' }} 
                  style={styles.profileImg} 
                />
              </View>
              <View style={styles.notifBadge} />
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
            {CATEGORIES.map((cat) => {
              const isActive = activeCat === cat.id;
              return (
                <TouchableOpacity 
                  key={cat.id} 
                  onPress={() => setActiveCat(cat.id)}
                  style={[
                    styles.catItem,
                    isActive ? styles.catItemActive : styles.catItemInactive
                  ]}
                >
                  {isActive ? (
                    <View style={styles.activePillContent}>
                      <View style={styles.activeCircleHighlight}>
                        <ThemedText style={styles.activeCircleText}>{cat.value}</ThemedText>
                      </View>
                      <ThemedText style={styles.activePillTitle}>{cat.title}</ThemedText>
                    </View>
                  ) : (
                    <ThemedText style={styles.inactiveValueText}>{cat.value}</ThemedText>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Hero Feature Card */}
          <RevealUp delay={200}>
            <View style={[styles.heroCard, Shadows.soft]}>
              <View style={styles.heroDecorativeBlob} />
              <View style={styles.heroHeaderRow}>
                <View style={styles.heroIconContainer}>
                   <ThemedText style={{ fontSize: 32 }}>📊</ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.heroCardTitle}>Daily Progress</ThemedText>
                  <ThemedText style={styles.heroCardSub}>You&apos;re doing great!</ThemedText>
                </View>
                {/* Secondary Create Button */}
                <TouchableOpacity 
                  style={styles.heroQuickAdd}
                  onPress={() => router.push('/task-entry')}
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <View style={styles.heroMetricsGrid}>
                <View style={styles.glassMetricCard}>
                   <ThemedText style={styles.metricLabel}>COMPLETION</ThemedText>
                   <ThemedText style={styles.metricValue}>{completionRate}%</ThemedText>
                </View>
                <View style={styles.glassMetricCard}>
                   <ThemedText style={styles.metricLabel}>PENDING</ThemedText>
                   <ThemedText style={styles.metricValue}>{pendingCount}</ThemedText>
                </View>
              </View>

              <View style={styles.heroAlertBox}>
                <Ionicons name="sparkles" size={18} color="#0052ff" />
                <ThemedText style={styles.heroAlertText}>Tap the red &quot;+&quot; to add a new task!</ThemedText>
              </View>
            </View>
          </RevealUp>

          {/* Secondary List Items */}
          <View style={styles.sectionHeaderRow}>
             <ThemedText style={styles.sectionTitleText}>My Tasks</ThemedText>
             <TouchableOpacity onPress={() => router.push('/task-entry')}>
                <ThemedText style={styles.seeAllActionText}>+ NEW TASK</ThemedText>
             </TouchableOpacity>
          </View>

          {tasks.map((task, index) => (
            <RevealUp key={task.id} delay={400 + index * 100}>
               <TouchableOpacity 
                style={styles.taskCard}
                onPress={() => toggleTask(task.id)}
                activeOpacity={0.8}
               >
                  <View style={[styles.taskIconWrapper, { backgroundColor: '#0052ff10' }]}>
                     <Ionicons 
                        name={task.done ? "checkmark-done" : "flash-outline"} 
                        size={24} 
                        color="#0052ff" 
                      />
                  </View>
                  <View style={styles.taskTextWrapper}>
                     <ThemedText style={[styles.taskTitleText, task.done && styles.taskDoneText]}>
                       {task.title}
                     </ThemedText>
                     <ThemedText style={styles.taskSubtitleText}>{task.time}</ThemedText>
                  </View>
                  <View style={[styles.circularCheckbox, task.done && styles.checkboxActive]}>
                     <Ionicons name="checkmark" size={20} color={task.done ? "white" : "transparent"} />
                  </View>
               </TouchableOpacity>
            </RevealUp>
          ))}

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
    paddingTop: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerLabel: {
    ...Typography.label,
    color: '#b7c6c2',
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: Fonts.black,
    color: '#171e19',
    marginTop: 2,
  },
  profileWrapper: {
    position: 'relative',
  },
  profileBorder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  profileImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  notifBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0052ff',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  catScroll: {
    paddingVertical: Spacing.md,
    gap: 12,
  },
  catItem: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  catItemInactive: {
    width: 56,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(183, 198, 194, 0.3)',
  },
  catItemActive: {
    width: 160,
    backgroundColor: '#171e19',
    borderRadius: 32,
  },
  inactiveValueText: {
    ...Typography.h2,
    color: '#b7c6c2',
  },
  activePillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 12,
  },
  activeCircleHighlight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0052ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircleText: {
    color: '#ffffff',
    fontFamily: Fonts.black,
    fontSize: 16,
  },
  activePillTitle: {
    color: '#ffffff',
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    overflow: 'hidden',
  },
  heroDecorativeBlob: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(183, 198, 194, 0.2)',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: Spacing.xl,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  heroCardTitle: {
    ...Typography.h2,
    color: '#171e19',
  },
  heroCardSub: {
    ...Typography.small,
    color: '#b7c6c2',
    marginTop: 2,
  },
  heroQuickAdd: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0052ff',
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(183, 198, 194, 0.2)',
  },
  metricLabel: {
    ...Typography.label,
    color: '#b7c6c2',
    fontSize: 8,
  },
  metricValue: {
    fontSize: 18,
    fontFamily: Fonts.black,
    color: '#171e19',
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
    color: '#0052ff',
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
    color: '#171e19',
  },
  seeAllActionText: {
    ...Typography.label,
    color: '#0052ff',
    fontWeight: '900',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(183, 198, 194, 0.3)',
  },
  taskIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTextWrapper: {
    flex: 1,
    marginLeft: 16,
  },
  taskTitleText: {
    fontSize: 18,
    fontFamily: Fonts.black,
    color: '#171e19',
  },
  taskDoneText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  taskSubtitleText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#b7c6c2',
    marginTop: 2,
  },
  circularCheckbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(183, 198, 194, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#0052ff',
    borderColor: '#0052ff',
  },
});
