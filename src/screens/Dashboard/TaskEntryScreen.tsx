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
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  FadeOut,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { Colors, Spacing, BorderRadius, Typography, Fonts, Shadows } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useTasks } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { googleCalendarService } from '@/services/GoogleCalendarService';
import { CustomAlert } from '@/components/common/themed-dialog';

// --- Interfaces ---
type Priority = 'Low' | 'Medium' | 'High';
type ReminderOption = 'None' | 'At Time' | '5m Before' | '10m Before' | '1h Before' | 'Custom';

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

// Simplified SectionCard without parent layout animations to prevent flickering
function SectionCard({ title, icon, children, delay = 0, theme }: { title: string, icon: any, children: React.ReactNode, delay?: number, theme: any }) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(400)} style={styles.sectionWrapper}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconContainer, { backgroundColor: theme.secondary + '20' }]}>
          <Ionicons name={icon} size={18} color={theme.accent} />
        </View>
        <ThemedText style={styles.sectionHeaderText}>{title}</ThemedText>
      </View>
      {children}
    </Animated.View>
  );
}

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

export default function AdvancedTaskEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { isDark } = useAppTheme();
  const theme = Colors[isDark ? 'dark' : 'light'];
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { googleToken } = useAuth();

  const existingTask = taskId ? tasks.find(t => t.id === taskId) : null;
  const isEditing = !!existingTask;

  // --- State ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [taskDate, setTaskDate] = useState(new Date());
  const [allDayReminderTime, setAllDayReminderTime] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(new Date().getTime() + 60 * 60 * 1000));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerType, setPickerType] = useState<'allDay' | 'start' | 'end'>('start');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [category, setCategory] = useState('Work');
  const [categories, setCategories] = useState(['Work', 'Personal', 'Health', 'Study']);
  const [customCategory, setCustomCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [reminder, setReminder] = useState<ReminderOption>('10m Before');
  const [customReminderHrs, setCustomReminderHrs] = useState('0');
  const [customReminderMins, setCustomReminderMins] = useState('30');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

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
    if (existingTask) {
      setTitle(existingTask.title);
      // Logic for parsing date/time back to Date objects if needed
      // For simplicity, we'll keep the current date objects unless we want to be more precise
      const [year, month, day] = existingTask.date.split('-').map(Number);
      setTaskDate(new Date(year, month - 1, day));

      if (existingTask.time === 'All Day') {
        setIsAllDay(true);
      } else {
        setIsAllDay(false);
        // We'd ideally parse the time string back to a Date object here
      }

      setPriority(existingTask.priority);
      setCategory(existingTask.category);
      setSubtasks(existingTask.subtasks?.map(s => ({ id: s.id, text: s.text, completed: s.done })) || []);
      
      if (existingTask.reminder === 'Custom' && existingTask.customReminderMinutes) {
        setReminder('Custom');
        setCustomReminderHrs(Math.floor(existingTask.customReminderMinutes / 60).toString());
        setCustomReminderMins((existingTask.customReminderMinutes % 60).toString());
      } else if (existingTask.reminder) {
        setReminder(existingTask.reminder as ReminderOption);
      }
    } else {
      const timer = setTimeout(() => titleInputRef.current?.focus(), 500);
      return () => clearTimeout(timer);
    }
  }, [existingTask]);

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
      if (pickerType === 'allDay') {
        setAllDayReminderTime(selectedDate);
      } else if (pickerType === 'start') {
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

  const openTimePicker = (type: 'allDay' | 'start' | 'end') => {
    setPickerType(type);
    setShowTimePicker(true);
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleAddCategory = () => {
    if (customCategory.trim() && !categories.includes(customCategory)) {
      setCategories([...categories, customCategory.trim()]);
      setCategory(customCategory.trim());
      setCustomCategory('');
      setIsAddingCategory(false);
    }
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { id: Math.random().toString(), text: newSubtask, completed: false }]);
      setNewSubtask('');
    }
  };

  const handleSave = async () => {
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

      if (isEditing && taskId) {
        updateTask(taskId, {
          title,
          description,
          date: dateStr,
          time: timeStr,
          priority,
          category,
          subtasks: mappedSubtasks,
          reminder,
          customReminderMinutes: reminder === 'Custom' ? (parseInt(customReminderHrs) * 60 + parseInt(customReminderMins)) : undefined
        });
      } else {
        addTask(title, dateStr, timeStr, priority, category, mappedSubtasks, reminder, reminder === 'Custom' ? (parseInt(customReminderHrs) * 60 + parseInt(customReminderMins)) : undefined, description);

        // Sync to Google Calendar if user is connected
        if (googleToken) {
          googleCalendarService.createEvent(googleToken, {
            title,
            description: description || undefined,
            date: dateStr,
            isAllDay,
            startTime,
            endTime,
          }).catch(err => console.warn('Google Calendar sync failed:', err));
        }
      }
      router.back();
    }
  };

  const handleDelete = () => {
    if (isEditing && taskId) {
      showAlert(
        "Delete Activity",
        "Are you sure you want to permanently delete this activity?",
        () => {
          deleteTask(taskId);
          router.back();
        },
        "Delete"
      );
    }
  };

  const getPriorityColor = (p: Priority) => {
    if (p === 'High') return theme.accent;
    if (p === 'Medium') return theme.warning;
    if (p === 'Low') return theme.success;
    return theme.secondary;
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.surface }]}>
            <Ionicons name="close-outline" size={28} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.titleWrapper}>
            <ThemedText style={styles.headerTitleText}>{isEditing ? 'Edit Activity' : 'New Activity'}</ThemedText>
          </View>
          <View style={styles.headerRight}>
            {isEditing && (
              <TouchableOpacity onPress={handleDelete} style={[styles.deleteButton, { backgroundColor: theme.surface }]}>
                <Ionicons name="trash-outline" size={24} color={Colors.light.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 1. Main Card */}
          <SectionCard title="Activity Info" icon="create-outline" delay={0} theme={theme}>
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.inputSection}>
                <ThemedText style={styles.inputLabel}>Activity Name</ThemedText>
                <TextInput
                  ref={titleInputRef}
                  style={[styles.titleInput, { color: theme.text }]}
                  placeholder="Enter activity title"
                  placeholderTextColor={theme.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                />
                <TextInput
                  style={[styles.descInput, { color: theme.text }]}
                  placeholder="Add notes..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View style={styles.unifiedScheduleRow}>
                <View style={styles.dateCol}>
                  <ThemedText style={styles.inputLabel}>Date</ThemedText>
                  <TouchableOpacity style={styles.inlineDateRow} onPress={openDatePicker}>
                    <Ionicons name="calendar-outline" size={16} color={theme.accent} />
                    <ThemedText style={[styles.inlineDateText, { color: theme.text }]}>{formatDate(taskDate)}</ThemedText>
                  </TouchableOpacity>
                </View>
                <View style={styles.allDayCol}>
                  <ThemedText style={styles.inputLabel}>All Day</ThemedText>
                  <Switch
                    value={isAllDay}
                    onValueChange={setIsAllDay}
                    trackColor={{ false: '#eeebe3', true: '#0052ff' }}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], marginTop: -4 }}
                  />
                </View>
              </View>

              <View style={styles.timeSection}>
                {isAllDay ? (
                  <TouchableOpacity style={[styles.allDayReminderRow, { backgroundColor: theme.secondary + '15' }]} onPress={() => openTimePicker('allDay')}>
                    <Ionicons name="notifications-outline" size={16} color={theme.accent} />
                    <ThemedText style={styles.label}>Remind me at:</ThemedText>
                    <ThemedText style={[styles.inlineTimeInput, { color: theme.text }]}>{formatTime(allDayReminderTime)}</ThemedText>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.timePickerRow}>
                    <TouchableOpacity style={styles.timeCol} onPress={() => openTimePicker('start')}>
                      <ThemedText style={styles.inputLabel}>Start</ThemedText>
                      <ThemedText style={[styles.inlineTimeInput, { color: theme.text }]}>{formatTime(startTime)}</ThemedText>
                    </TouchableOpacity>
                    <Ionicons name="arrow-forward" size={16} color="#b7c6c2" style={{ marginTop: 20 }} />
                    <TouchableOpacity style={styles.timeCol} onPress={() => openTimePicker('end')}>
                      <ThemedText style={styles.inputLabel}>End</ThemedText>
                      <ThemedText style={[styles.inlineTimeInput, { color: theme.text }]}>{formatTime(endTime)}</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {showTimePicker && (
                <DateTimePicker
                  value={pickerType === 'allDay' ? allDayReminderTime : pickerType === 'start' ? startTime : endTime}
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
          </SectionCard>

          {/* 2. Classification Section */}
          <SectionCard title="Classification" icon="options-outline" delay={100} theme={theme}>
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <ThemedText style={styles.label}>Priority Level</ThemedText>
              <View style={styles.priorityRow}>
                {(['Low', 'Medium', 'High'] as Priority[]).map((p) => {
                  const isActive = priority === p;
                  const activeColor = getPriorityColor(p);
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPriority(p)}
                      style={[
                        styles.priorityBtn,
                        { backgroundColor: theme.secondary + '15' },
                        isActive && { backgroundColor: activeColor, borderColor: activeColor }
                      ]}
                    >
                      <View style={[styles.priorityDot, { backgroundColor: p === 'High' ? theme.accent : p === 'Medium' ? theme.warning : theme.success }]} />
                      <ThemedText style={[styles.priorityBtnText, { color: isActive ? 'white' : theme.text }]}>{p}</ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <ThemedText style={[styles.label, { marginTop: 24 }]}>Categories</ThemedText>
              <View style={styles.chipRow}>
                {categories.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    selected={category === cat}
                    onPress={() => setCategory(cat)}
                  />
                ))}
                {!isAddingCategory ? (
                  <TouchableOpacity
                    style={[styles.addCategoryChip, { backgroundColor: theme.secondary + '20' }]}
                    onPress={() => setIsAddingCategory(true)}
                  >
                    <Ionicons name="add" size={16} color={theme.accent} />
                  </TouchableOpacity>
                ) : (
                  <Animated.View entering={FadeIn} style={[styles.customCategoryInputRow, { backgroundColor: theme.surface, borderColor: theme.accent }]}>
                    <TextInput
                      style={[styles.customCategoryInput, { color: theme.text }]}
                      placeholder="New..."
                      autoFocus
                      value={customCategory}
                      onChangeText={setCustomCategory}
                      onSubmitEditing={handleAddCategory}
                    />
                    <TouchableOpacity onPress={handleAddCategory}>
                      <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
            </View>
          </SectionCard>

          {/* 3. Reminder Section - Simplified animation to prevent flickering */}
          <SectionCard title="Reminder" icon="notifications-outline" delay={150} theme={theme}>
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <ThemedText style={styles.label}>Notify Me</ThemedText>
              <View style={styles.chipRow}>
                {(['None', 'At Time', '5m Before', '10m Before', '1h Before', 'Custom'] as ReminderOption[]).map((opt) => (
                  <Chip
                    key={opt}
                    label={opt}
                    selected={reminder === opt}
                    onPress={() => setReminder(opt)}
                  />
                ))}
              </View>

              {reminder === 'Custom' && (
                <Animated.View
                  entering={FadeInDown.duration(300)}
                  exiting={FadeOut.duration(200)}
                  style={styles.customReminderBox}
                >
                  <ThemedText style={styles.label}>Time Before Event</ThemedText>
                  <View style={styles.customReminderInputsGrid}>
                    <View style={[styles.timeInputBox, { backgroundColor: theme.secondary + '15' }]}>
                      <TextInput
                        style={[styles.timeInput, { color: theme.text }]}
                        keyboardType="numeric"
                        value={customReminderHrs}
                        onChangeText={setCustomReminderHrs}
                        placeholder="0"
                        placeholderTextColor="#b7c6c2"
                      />
                      <ThemedText style={styles.timeInputUnit}>HR</ThemedText>
                    </View>
                    <View style={[styles.timeInputBox, { backgroundColor: theme.secondary + '15' }]}>
                      <TextInput
                        style={[styles.timeInput, { color: theme.text }]}
                        keyboardType="numeric"
                        value={customReminderMins}
                        onChangeText={setCustomReminderMins}
                        placeholder="0"
                        placeholderTextColor="#b7c6c2"
                      />
                      <ThemedText style={styles.timeInputUnit}>MIN</ThemedText>
                    </View>
                  </View>
                </Animated.View>
              )}
            </View>
          </SectionCard>

          {/* 4. Checklist Section */}
          <SectionCard title="Checklist" icon="list-outline" delay={200} theme={theme}>
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {subtasks.map((item) => (
                <View key={item.id} style={[styles.subtaskItem, { backgroundColor: theme.secondary + '10' }]}>
                  <Ionicons name="ellipse-outline" size={20} color="#b7c6c2" />
                  <ThemedText style={[styles.subtaskText, { color: theme.text }]}>{item.text}</ThemedText>
                  <TouchableOpacity onPress={() => setSubtasks(subtasks.filter(s => s.id !== item.id))}>
                    <Ionicons name="close-circle-outline" size={20} color={theme.accent} />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.addSubtaskContainer}>
                <TextInput
                  style={[styles.addSubtaskInput, { backgroundColor: theme.secondary + '15', color: theme.text }]}
                  placeholder="Add subtask..."
                  placeholderTextColor="#b7c6c2"
                  value={newSubtask}
                  onChangeText={setNewSubtask}
                  onSubmitEditing={handleAddSubtask}
                />
                <TouchableOpacity onPress={handleAddSubtask} style={[styles.addSubtaskBtn, { backgroundColor: theme.primary }]}>
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </SectionCard>

          <View style={{ height: 160 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={styles.blurContainer}>
            <ThemedText style={styles.saveButtonText}>{isEditing ? 'Update Activity' : 'Create Activity'}</ThemedText>
            <Ionicons name={isEditing ? "refresh-outline" : "sparkles-outline"} size={20} color="#0052ff" />
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { zIndex: 100 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 64 },
  titleWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitleText: { fontSize: 20, fontFamily: Fonts.black, textAlign: 'center' },
  headerRight: { width: 44, alignItems: 'flex-end' },
  backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', ...Shadows.soft },
  deleteButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', ...Shadows.soft },
  scrollContent: { padding: Spacing.md, paddingTop: 10 },
  sectionWrapper: { marginBottom: 24 },
  card: {
    borderRadius: BorderRadius.lg,
    padding: 20,
    ...Shadows.soft,
    borderWidth: 1,
  },
  inputSection: { marginBottom: 16 },
  inputLabel: { ...Typography.label, color: '#b7c6c2', marginBottom: 8, fontSize: 10 },
  titleInput: { fontSize: 24, fontFamily: Fonts.black, marginBottom: 4 },
  descInput: { fontSize: 16, fontFamily: Fonts.regular, minHeight: 40, textAlignVertical: 'top' },
  unifiedScheduleRow: { flexDirection: 'row', gap: 20, paddingTop: 16 },
  dateCol: { flex: 1.5 },
  allDayCol: { flex: 1, alignItems: 'flex-end' },
  inlineDateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  inlineDateText: { fontSize: 15, fontFamily: Fonts.bold },
  timeSection: { marginTop: 12 },
  allDayReminderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12 },
  timePickerRow: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  timeCol: { flex: 1 },
  inlineTimeInput: { fontSize: 15, fontFamily: Fonts.bold },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, paddingLeft: 4 },
  sectionIconContainer: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionHeaderText: { fontSize: 16, fontFamily: Fonts.black, textTransform: 'none', letterSpacing: 0.5 },
  label: { ...Typography.label, color: '#b7c6c2', marginBottom: 4, fontSize: 10 },
  priorityRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  priorityBtn: { flex: 1, height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityBtnText: { fontSize: 14, fontFamily: Fonts.black },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
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
  addCategoryChip: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  customCategoryInputRow: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: '#0052ff' },
  customCategoryInput: { width: 80, height: 40, fontFamily: Fonts.bold, fontSize: 12 },
  customReminderBox: { marginTop: 16, paddingTop: 16 },
  customReminderInputsGrid: { flexDirection: 'row', gap: 12, marginTop: 8 },
  timeInputBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 16, height: 52 },
  timeInput: { flex: 1, fontFamily: Fonts.black, fontSize: 18 },
  timeInputUnit: { fontSize: 12, fontFamily: Fonts.black, color: '#b7c6c2', marginLeft: 8 },
  subtaskItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, padding: 12, borderRadius: 16 },
  subtaskText: { flex: 1, fontSize: 15, fontFamily: Fonts.regular },
  addSubtaskContainer: { flexDirection: 'row', gap: 12, marginTop: 12 },
  addSubtaskInput: { flex: 1, height: 52, borderRadius: 16, paddingHorizontal: 16, fontFamily: Fonts.bold },
  addSubtaskBtn: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  footer: { position: 'absolute', bottom: 40, left: 24, right: 24, paddingBottom: 20 },
  saveButton: {
    height: 56,
    borderRadius: 16,
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
  saveButtonText: { color: '#0052ff', fontSize: 18, fontFamily: Fonts.black },
});
