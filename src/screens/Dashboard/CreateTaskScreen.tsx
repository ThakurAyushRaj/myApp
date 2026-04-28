import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInUp, 
  Layout, 
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

import { Colors, Spacing, BorderRadius, Typography, Fonts, Shadows } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useTasks } from '@/context/TaskContext';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';

const { width } = Dimensions.get('window');

// --- Types ---
type Priority = 'Low' | 'Medium' | 'High';

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

// --- Components ---
const SectionTitle = ({ title, icon }: { title: string; icon: any }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIconContainer}>
      <Ionicons name={icon} size={18} color="#0052ff" />
    </View>
    <ThemedText style={styles.sectionHeaderText}>{title}</ThemedText>
  </View>
);

const Chip = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[styles.chip, selected && styles.chipSelected]}
    activeOpacity={0.8}
  >
    <ThemedText style={[styles.chipText, selected && styles.chipTextSelected]}>
      {label}
    </ThemedText>
  </TouchableOpacity>
);

export default function AdvancedCreateTaskScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const { addTask } = useTasks();

  // --- State ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [priority, setPriority] = useState<Priority>('Medium');
  const [category, setCategory] = useState('Work');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [pomodoro, setPomodoro] = useState(false);

  const titleInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => titleInputRef.current?.focus(), 500);
    return () => clearTimeout(timer);
  }, []);

  // --- Actions ---
  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { id: Math.random().toString(), text: newSubtask, completed: false }]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSave = () => {
    if (title.trim()) {
      addTask(title, "Today"); 
      router.back();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: 'Log Activity',
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#171e19" />
            </TouchableOpacity>
          ),
        }} 
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Main Title & Description */}
          <Animated.View entering={FadeInUp.duration(400)}>
            <View style={[styles.card, styles.mainCard, Shadows.soft]}>
              <ThemedText style={styles.inputLabel}>ACTIVITY NAME</ThemedText>
              <TextInput
                ref={titleInputRef}
                style={styles.titleInput}
                placeholder="What happened?"
                placeholderTextColor="#b7c6c2"
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
              <TextInput
                style={styles.descInput}
                placeholder="Add notes or details..."
                placeholderTextColor="#b7c6c2"
                multiline
                value={description}
                onChangeText={setDescription}
              />
              
              <View style={styles.smartInputBox}>
                <Ionicons name="sparkles" size={14} color="#0052ff" />
                <ThemedText style={styles.smartInputText}>
                  Try &quot;Meeting with Raj tomorrow at 5pm&quot;
                </ThemedText>
              </View>
            </View>
          </Animated.View>

          {/* 2. Schedule */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <View style={[styles.card, Shadows.soft]}>
              <SectionTitle title="Schedule" icon="calendar-outline" />
              
              <View style={styles.dateTimeRow}>
                <TouchableOpacity style={styles.datePickerBtn}>
                  <ThemedText style={styles.datePickerLabel}>DATE</ThemedText>
                  <ThemedText style={styles.datePickerValue}>Tue, 28 April</ThemedText>
                </TouchableOpacity>
                <View style={styles.allDayToggle}>
                  <ThemedText style={styles.label}>ALL DAY</ThemedText>
                  <Switch 
                    value={isAllDay} 
                    onValueChange={setIsAllDay}
                    trackColor={{ false: '#eeebe3', true: '#0052ff' }}
                  />
                </View>
              </View>

              {!isAllDay && (
                <View style={styles.timePickerContainer}>
                  <View style={styles.timeCol}>
                    <ThemedText style={styles.label}>START</ThemedText>
                    <ThemedText style={styles.timeValue}>09:00 AM</ThemedText>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color="#b7c6c2" />
                  <View style={styles.timeCol}>
                    <ThemedText style={styles.label}>END</ThemedText>
                    <ThemedText style={styles.timeValue}>10:00 AM</ThemedText>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>

          {/* 3. Priority & Category */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <View style={[styles.card, Shadows.soft]}>
              <SectionTitle title="Classification" icon="options-outline" />
              
              <ThemedText style={styles.label}>PRIORITY</ThemedText>
              <View style={styles.priorityRow}>
                {(['Low', 'Medium', 'High'] as Priority[]).map((p) => (
                  <TouchableOpacity 
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[
                      styles.priorityBtn, 
                      priority === p && styles.priorityBtnActive,
                      priority === p && { backgroundColor: p === 'High' ? '#0052ff' : p === 'Medium' ? '#0052ff20' : '#b7c6c220' }
                    ]}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: p === 'High' ? '#0052ff' : p === 'Medium' ? '#f59e0b' : '#10b981' }]} />
                    <ThemedText style={[styles.priorityBtnText, priority === p && { color: p === 'High' ? 'white' : '#171e19' }]}>
                      {p}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <ThemedText style={[styles.label, { marginTop: 20 }]}>CATEGORY</ThemedText>
              <View style={styles.chipRow}>
                {['Work', 'Personal', 'Health', 'Study'].map((cat) => (
                  <Chip 
                    key={cat} 
                    label={cat} 
                    selected={category === cat} 
                    onPress={() => setCategory(cat)} 
                  />
                ))}
              </View>
            </View>
          </Animated.View>

          {/* 4. Subtasks Checklist */}
          <Animated.View entering={FadeInUp.delay(300).duration(400)}>
            <View style={[styles.card, Shadows.soft]}>
              <SectionTitle title="Subtasks" icon="list-outline" />
              
              {subtasks.map((item) => (
                <Animated.View 
                  key={item.id} 
                  layout={Layout.springify()} 
                  entering={FadeIn} 
                  exiting={FadeOut}
                  style={styles.subtaskItem}
                >
                  <Ionicons name="ellipse-outline" size={20} color="#b7c6c2" />
                  <ThemedText style={styles.subtaskText}>{item.text}</ThemedText>
                  <TouchableOpacity onPress={() => removeSubtask(item.id)}>
                    <Ionicons name="trash-outline" size={18} color="#0052ff" />
                  </TouchableOpacity>
                </Animated.View>
              ))}

              <View style={styles.addSubtaskContainer}>
                <TextInput
                  style={styles.addSubtaskInput}
                  placeholder="Add a step..."
                  placeholderTextColor="#b7c6c2"
                  value={newSubtask}
                  onChangeText={setNewSubtask}
                  onSubmitEditing={addSubtask}
                />
                <TouchableOpacity onPress={addSubtask} style={styles.addSubtaskBtn}>
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* 5. Productivity & Advanced */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)}>
            <View style={[styles.card, Shadows.soft]}>
              <View style={styles.pomodoroRow}>
                <View style={styles.row}>
                  <Ionicons name="timer-outline" size={22} color="#0052ff" />
                  <ThemedText style={styles.pomodoroLabel}>Pomodoro Timer</ThemedText>
                </View>
                <Switch 
                  value={pomodoro} 
                  onValueChange={setPomodoro}
                  trackColor={{ false: '#eeebe3', true: '#0052ff' }}
                />
              </View>

              <TouchableOpacity 
                style={styles.moreOptionsToggle}
                onPress={() => setShowMore(!showMore)}
              >
                <ThemedText style={styles.moreOptionsText}>
                  {showMore ? 'HIDE OPTIONS' : 'MORE SETTINGS'}
                </ThemedText>
                <Ionicons 
                  name={showMore ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#b7c6c2" 
                />
              </TouchableOpacity>

              {showMore && (
                <Animated.View entering={FadeIn.duration(300)}>
                  <View style={styles.moreOptionsGrid}>
                    <BentoMetricCard label="REMINDER" value="10m Before" icon="notifications-outline" />
                    <BentoMetricCard label="DURATION" value="1 Hour" icon="hourglass-outline" />
                    <BentoMetricCard label="RECURRING" value="Weekly" icon="repeat-outline" />
                    <BentoMetricCard label="LOCATION" value="Not Set" icon="location-outline" />
                  </View>
                </Animated.View>
              )}
            </View>
          </Animated.View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 6. Sticky Bottom Action */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          activeOpacity={0.9}
        >
          <ThemedText style={styles.saveButtonText}>Create Task</ThemedText>
          <Ionicons name="sparkles-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

function BentoMetricCard({ label, value, icon }: { label: string, value: string, icon: any }) {
  return (
    <TouchableOpacity style={styles.bentoOption} activeOpacity={0.8}>
       <View style={styles.bentoIconInner}>
          <Ionicons name={icon} size={14} color="#0052ff" />
       </View>
       <View>
          <ThemedText style={styles.label}>{label}</ThemedText>
          <ThemedText style={styles.bentoValue}>{value}</ThemedText>
       </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeebe3',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    ...Shadows.soft,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingTop: 120,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(183, 198, 194, 0.3)',
  },
  mainCard: {
    borderRadius: BorderRadius.xl, 
    padding: 32,
  },
  inputLabel: {
    ...Typography.label,
    color: '#b7c6c2',
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 28,
    fontFamily: Fonts.black,
    color: '#171e19',
    marginBottom: 12,
  },
  descInput: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: '#171e19',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  smartInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(202, 0, 19, 0.05)',
    padding: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  smartInputText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#0052ff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(202, 0, 19, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderText: {
    ...Typography.h3,
    color: '#171e19',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerBtn: {
    flex: 1,
  },
  datePickerLabel: {
    ...Typography.label,
    fontSize: 8,
    color: '#b7c6c2',
  },
  datePickerValue: {
    fontSize: 18,
    fontFamily: Fonts.black,
    color: '#171e19',
    marginTop: 4,
  },
  allDayToggle: {
    alignItems: 'flex-end',
  },
  label: {
    ...Typography.label,
    color: '#b7c6c2',
    marginBottom: 4,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(183, 198, 194, 0.2)',
  },
  timeCol: {
    flex: 1,
  },
  timeValue: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#171e19',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  priorityBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#eeebe3',
  },
  priorityBtnActive: {
    borderWidth: 1.5,
    borderColor: '#0052ff',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityBtnText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(183, 198, 194, 0.3)',
  },
  chipSelected: {
    backgroundColor: '#171e19',
    borderColor: '#171e19',
  },
  chipText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#171e19',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    backgroundColor: '#eeebe340',
    padding: 12,
    borderRadius: 16,
  },
  subtaskText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#171e19',
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  addSubtaskInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#eeebe3',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontFamily: Fonts.regular,
  },
  addSubtaskBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#171e19',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pomodoroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pomodoroLabel: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#171e19',
  },
  moreOptionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(183, 198, 194, 0.2)',
  },
  moreOptionsText: {
    ...Typography.label,
    color: '#b7c6c2',
  },
  moreOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  bentoOption: {
    width: (width - Spacing.md * 2 - 24 * 2 - 12) / 2,
    backgroundColor: 'rgba(183, 198, 194, 0.1)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bentoIconInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(202, 0, 19, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoValue: {
    fontSize: 12,
    fontFamily: Fonts.black,
    color: '#171e19',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  saveButton: {
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0052ff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    ...Shadows.blue,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: Fonts.black,
  },
});
