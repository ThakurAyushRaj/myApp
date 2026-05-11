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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInUp,
  Layout,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';

import { Colors, Spacing, BorderRadius, Typography, Fonts, Shadows } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useTasks } from '@/context/TaskContext';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { CustomAlert } from '@/components/common/themed-dialog';

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
  const insets = useSafeAreaInsets();

  // --- State ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [taskDate, setTaskDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(new Date().getTime() + 60 * 60 * 1000));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerType, setPickerType] = useState<'start' | 'end'>('start');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [category, setCategory] = useState('Work');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [pomodoro, setPomodoro] = useState(false);

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

  const titleInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => titleInputRef.current?.focus(), 500);
    return () => clearTimeout(timer);
  }, []);

  // --- Actions ---
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'long' });
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedDate) {
      if (pickerType === 'start') {
        setStartTime(selectedDate);
        if (selectedDate > endTime) {
          setEndTime(new Date(selectedDate.getTime() + 60 * 60 * 1000));
        }
      } else {
        setEndTime(selectedDate);
      }
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setTaskDate(selectedDate);
    }
  };

  const openTimePicker = (type: 'start' | 'end') => {
    setPickerType(type);
    setShowTimePicker(true);
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

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
      // Past time validation
      const now = new Date();
      const isToday = taskDate.toDateString() === now.toDateString();
      
      if (isToday && !isAllDay) {
        const startCheck = new Date(taskDate);
        startCheck.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
        
        // Allow a small buffer (e.g., 1 minute) for latency
        if (startCheck.getTime() < now.getTime() - 60000) {
          showAlert("Invalid Time", "You cannot schedule an activity in the past for today.");
          return;
        }
      }

      const dateStr = taskDate.toISOString().split('T')[0];
      const timeStr = isAllDay ? 'All Day' : formatTime(startTime);
      const mappedSubtasks = subtasks.map(s => ({
        id: s.id,
        text: s.text,
        done: s.completed
      }));
      addTask(title, dateStr, timeStr, priority, category, mappedSubtasks, '10m Before', description);
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
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Main Title & Description */}
          <Animated.View entering={FadeInUp.duration(400)}>
            <View style={[styles.card, styles.mainCard, Shadows.soft, { backgroundColor: theme.surface }]}>
              <ThemedText style={styles.inputLabel}>Activity Name</ThemedText>
              <TextInput
                ref={titleInputRef}
                style={[styles.titleInput, { color: theme.text }]}
                placeholder="What happened?"
                placeholderTextColor="#b7c6c2"
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
              <TextInput
                style={[styles.descInput, { color: theme.text }]}
                placeholder="Add notes or details..."
                placeholderTextColor="#b7c6c2"
                multiline
                value={description}
                onChangeText={setDescription}
              />

              <View style={[styles.smartInputBox, { backgroundColor: theme.secondary + '15' }]}>
                <Ionicons name="sparkles" size={14} color={theme.accent} />
                <ThemedText style={[styles.smartInputText, { color: theme.accent }]}>
                  Try &quot;Meeting with Raj tomorrow at 5pm&quot;
                </ThemedText>
              </View>
            </View>
          </Animated.View>

          {/* 2. Schedule */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <View style={[styles.card, Shadows.soft, { backgroundColor: theme.surface }]}>
              <SectionTitle title="Schedule" icon="calendar-outline" />

              <View style={styles.dateTimeRow}>
                <TouchableOpacity style={styles.datePickerBtn} onPress={openDatePicker}>
                  <ThemedText style={styles.datePickerLabel}>Date</ThemedText>
                  <ThemedText style={[styles.datePickerValue, { color: theme.text }]}>{formatDate(taskDate)}</ThemedText>
                </TouchableOpacity>
                <View style={styles.allDayToggle}>
                  <ThemedText style={styles.label}>All Day</ThemedText>
                  <Switch
                    value={isAllDay}
                    onValueChange={setIsAllDay}
                    trackColor={{ false: '#eeebe3', true: '#0052ff' }}
                  />
                </View>
              </View>

              {!isAllDay && (
                <View style={styles.timePickerContainer}>
                  <TouchableOpacity style={styles.timeCol} onPress={() => openTimePicker('start')}>
                    <ThemedText style={styles.label}>Start</ThemedText>
                    <ThemedText style={[styles.timeValue, { color: theme.text }]}>{formatTime(startTime)}</ThemedText>
                  </TouchableOpacity>
                  <Ionicons name="arrow-forward" size={16} color="#b7c6c2" />
                  <TouchableOpacity style={styles.timeCol} onPress={() => openTimePicker('end')}>
                    <ThemedText style={styles.label}>End</ThemedText>
                    <ThemedText style={[styles.timeValue, { color: theme.text }]}>{formatTime(endTime)}</ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={pickerType === 'start' ? startTime : endTime}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
                  onChange={onTimeChange}
                  themeVariant={isDark ? 'dark' : 'light'}
                />
              )}

              {showDatePicker && (
                <DateTimePicker
                  value={taskDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                  onChange={onDateChange}
                  themeVariant={isDark ? 'dark' : 'light'}
                />
              )}
            </View>
          </Animated.View>

          {/* 3. Priority & Category */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <View style={[styles.card, Shadows.soft, { backgroundColor: theme.surface }]}>
              <SectionTitle title="Classification" icon="options-outline" />

              <ThemedText style={styles.label}>Priority</ThemedText>
              <View style={styles.priorityRow}>
                {(['Low', 'Medium', 'High'] as Priority[]).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[
                      styles.priorityBtn,
                      { backgroundColor: theme.secondary + '15' },
                      priority === p && styles.priorityBtnActive,
                      priority === p && { backgroundColor: p === 'High' ? theme.accent : theme.accent + '25' }
                    ]}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: p === 'High' ? theme.accent : p === 'Medium' ? theme.warning : theme.success }]} />
                    <ThemedText style={[styles.priorityBtnText, priority === p && { color: p === 'High' ? 'white' : theme.text }]}>
                      {p}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <ThemedText style={[styles.label, { marginTop: 20 }]}>Category</ThemedText>
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
            <View style={[styles.card, Shadows.soft, { backgroundColor: theme.surface }]}>
              <SectionTitle title="Subtasks" icon="list-outline" />

              {subtasks.map((item) => (
                <Animated.View
                  key={item.id}
                  layout={Layout.springify()}
                  entering={FadeIn}
                  exiting={FadeOut}
                  style={[styles.subtaskItem, { backgroundColor: theme.secondary + '15' }]}
                >
                  <Ionicons name="ellipse-outline" size={20} color="#b7c6c2" />
                  <ThemedText style={[styles.subtaskText, { color: theme.text }]}>{item.text}</ThemedText>
                  <TouchableOpacity onPress={() => removeSubtask(item.id)}>
                    <Ionicons name="trash-outline" size={18} color={theme.accent} />
                  </TouchableOpacity>
                </Animated.View>
              ))}

              <View style={styles.addSubtaskContainer}>
                <TextInput
                  style={[styles.addSubtaskInput, { 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(183,198,194,0.15)', 
                    color: theme.text,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }]}
                  placeholder="Add a step..."
                  placeholderTextColor="#b7c6c2"
                  value={newSubtask}
                  onChangeText={setNewSubtask}
                  onSubmitEditing={addSubtask}
                />
                <TouchableOpacity onPress={addSubtask} style={[styles.addSubtaskBtn, { backgroundColor: theme.accent }]}>
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* 5. Productivity & Advanced */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)}>
            <View style={[styles.card, Shadows.soft, { backgroundColor: theme.surface }]}>
              <View style={styles.pomodoroRow}>
                <View style={styles.row}>
                  <Ionicons name="timer-outline" size={22} color={theme.accent} />
                  <ThemedText style={[styles.pomodoroLabel, { color: theme.text }]}>Pomodoro Timer</ThemedText>
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
                  {showMore ? 'Hide Options' : 'More Settings'}
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
                    <BentoMetricCard label="Reminder" value="10m Before" icon="notifications-outline" theme={theme} isDark={isDark} />
                    <BentoMetricCard label="Duration" value="1 Hour" icon="hourglass-outline" theme={theme} isDark={isDark} />
                    <BentoMetricCard label="Recurring" value="Weekly" icon="repeat-outline" theme={theme} isDark={isDark} />
                    <BentoMetricCard label="Location" value="Not Set" icon="location-outline" theme={theme} isDark={isDark} />
                  </View>
                </Animated.View>
              )}
            </View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Bottom Button - always visible */}
      <View style={[styles.footer, { bottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={styles.blurContainer}>
            <ThemedText style={styles.saveButtonText}>Create Task</ThemedText>
            <Ionicons name="sparkles-outline" size={20} color="#0052ff" />
          </BlurView>
        </TouchableOpacity>
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

function BentoMetricCard({ label, value, icon, theme, isDark }: { label: string, value: string, icon: any, theme: any, isDark: boolean }) {
  return (
    <TouchableOpacity style={[styles.bentoOption, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(183, 198, 194, 0.1)' }]} activeOpacity={0.8}>
      <View style={[styles.bentoIconInner, { backgroundColor: theme.secondary + '20' }]}>
        <Ionicons name={icon} size={14} color={theme.accent} />
      </View>
      <View>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <ThemedText style={[styles.bentoValue, { color: theme.text }]}>{value}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginBottom: 16,
    ...Shadows.soft,
    borderWidth: 1,
    borderColor: '#171e19',
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
    marginBottom: 12,
  },
  descInput: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  smartInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  smartInputText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    paddingLeft: 4,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 82, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontFamily: Fonts.black,
    textTransform: 'none',
    letterSpacing: 0.5,
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
  },
  timeCol: {
    flex: 1,
  },
  timeValue: {
    fontSize: 16,
    fontFamily: Fonts.bold,
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
    backgroundColor: 'rgba(183, 198, 194, 0.15)',
  },
  chipSelected: {
    backgroundColor: '#0052ff',
    borderColor: '#0052ff',
  },
  chipText: { fontSize: 14, fontFamily: Fonts.bold },
  chipTextSelected: { color: '#ffffff' },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  subtaskText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  addSubtaskInput: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontFamily: Fonts.regular,
  },
  addSubtaskBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
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
  },
  moreOptionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingTop: 16,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoValue: {
    fontSize: 12,
    fontFamily: Fonts.black,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#0052ff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  saveButtonText: {
    color: '#0052ff',
    fontSize: 18,
    fontFamily: Fonts.black,
  },
});
