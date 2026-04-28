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
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn,
  FadeInUp, 
  FadeInDown,
  FadeOut,
} from 'react-native-reanimated';

import { Colors, Spacing, BorderRadius, Typography, Fonts, Shadows } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useTasks } from '@/context/TaskContext';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';

// --- Interfaces ---
type Priority = 'Low' | 'Medium' | 'High';
type ReminderOption = 'None' | 'At Time' | '5m Before' | '10m Before' | '1h Before' | 'Custom';

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

// Simplified SectionCard without parent layout animations to prevent flickering
const SectionCard = ({ title, icon, children, delay = 0 }: { title: string; icon: any; children: React.ReactNode; delay?: number }) => (
  <Animated.View entering={FadeInUp.delay(delay).duration(400)}>
    <View style={[styles.card, Shadows.soft]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <Ionicons name={icon} size={18} color="#0052ff" />
        </View>
        <ThemedText style={styles.sectionHeaderText}>{title}</ThemedText>
      </View>
      {children}
    </View>
  </Animated.View>
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

export default function AdvancedTaskEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const theme = Colors[isDark ? 'dark' : 'light'];
  const { addTask } = useTasks();

  // --- State ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [allDayReminderTime, setAllDayReminderTime] = useState('09:00 AM');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:00 AM');
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

  const titleInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => titleInputRef.current?.focus(), 500);
    return () => clearTimeout(timer);
  }, []);

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

  const handleSave = () => {
    if (title.trim()) {
      addTask(title, isAllDay ? `All Day (${allDayReminderTime})` : startTime);
      router.back();
    }
  };

  const getPriorityColor = (p: Priority) => {
    if (p === 'High') return theme.error;
    if (p === 'Medium') return '#f59e0b';
    if (p === 'Low') return '#10b981';
    return theme.secondary;
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close-outline" size={28} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.titleWrapper}>
            <ThemedText style={styles.headerTitleText}>Task Details</ThemedText>
          </View>
          <View style={styles.headerRightPlaceholder} />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 1. Main Card */}
          <SectionCard title="Task Info" icon="create-outline" delay={0}>
              <View style={styles.inputSection}>
                <ThemedText style={styles.inputLabel}>ACTIVITY NAME</ThemedText>
                <TextInput
                  ref={titleInputRef}
                  style={styles.titleInput}
                  placeholder="Enter task title"
                  placeholderTextColor={theme.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                />
                <TextInput
                  style={styles.descInput}
                  placeholder="Add notes..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View style={styles.unifiedScheduleRow}>
                <View style={styles.dateCol}>
                  <ThemedText style={styles.inputLabel}>DATE</ThemedText>
                  <TouchableOpacity style={styles.inlineDateRow}>
                    <Ionicons name="calendar-outline" size={16} color="#0052ff" />
                    <ThemedText style={styles.inlineDateText}>Tue, 28 April</ThemedText>
                  </TouchableOpacity>
                </View>
                <View style={styles.allDayCol}>
                  <ThemedText style={styles.inputLabel}>ALL DAY</ThemedText>
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
                  <View style={styles.allDayReminderRow}>
                    <Ionicons name="notifications-outline" size={16} color="#0052ff" />
                    <ThemedText style={styles.label}>REMIND ME AT:</ThemedText>
                    <TextInput style={styles.inlineTimeInput} value={allDayReminderTime} onChangeText={setAllDayReminderTime} />
                  </View>
                ) : (
                  <View style={styles.timePickerRow}>
                    <View style={styles.timeCol}>
                      <ThemedText style={styles.inputLabel}>START</ThemedText>
                      <TextInput style={styles.inlineTimeInput} value={startTime} onChangeText={setStartTime} />
                    </View>
                    <Ionicons name="arrow-forward" size={16} color="#b7c6c2" style={{ marginTop: 20 }} />
                    <View style={styles.timeCol}>
                      <ThemedText style={styles.inputLabel}>END</ThemedText>
                      <TextInput style={styles.inlineTimeInput} value={endTime} onChangeText={setEndTime} />
                    </View>
                  </View>
                )}
              </View>
          </SectionCard>

          {/* 2. Classification Section */}
          <SectionCard title="Classification" icon="options-outline" delay={100}>
            <ThemedText style={styles.label}>PRIORITY LEVEL</ThemedText>
            <View style={styles.priorityRow}>
              {(['Low', 'Medium', 'High'] as Priority[]).map((p) => {
                const isActive = priority === p;
                const activeColor = getPriorityColor(p);
                return (
                  <TouchableOpacity 
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[styles.priorityBtn, isActive && { backgroundColor: activeColor, borderColor: activeColor }]}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: isActive ? 'white' : activeColor }]} />
                    <ThemedText style={[styles.priorityBtnText, isActive && { color: 'white' }]}>{p}</ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ThemedText style={[styles.label, { marginTop: 24 }]}>CATEGORIES</ThemedText>
            <View style={styles.chipRow}>
              {categories.map((cat) => (
                <Chip key={cat} label={cat} selected={category === cat} onPress={() => setCategory(cat)} />
              ))}
              {!isAddingCategory ? (
                <TouchableOpacity style={styles.addCategoryChip} onPress={() => setIsAddingCategory(true)}>
                  <Ionicons name="add" size={16} color="#0052ff" />
                </TouchableOpacity>
              ) : (
                <Animated.View entering={FadeIn} style={styles.customCategoryInputRow}>
                   <TextInput style={styles.customCategoryInput} placeholder="New..." autoFocus value={customCategory} onChangeText={setCustomCategory} onSubmitEditing={handleAddCategory} />
                   <TouchableOpacity onPress={handleAddCategory}><Ionicons name="checkmark-circle" size={24} color="#10b981" /></TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </SectionCard>

          {/* 3. Reminder Section - Simplified animation to prevent flickering */}
          <SectionCard title="Reminder" icon="notifications-outline" delay={150}>
             <ThemedText style={styles.label}>NOTIFY ME</ThemedText>
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
                  <ThemedText style={styles.label}>TIME BEFORE EVENT</ThemedText>
                  <View style={styles.customReminderInputsGrid}>
                    <View style={styles.timeInputBox}>
                       <TextInput 
                        style={styles.timeInput}
                        keyboardType="numeric"
                        value={customReminderHrs}
                        onChangeText={setCustomReminderHrs}
                        placeholder="0"
                       />
                       <ThemedText style={styles.timeInputUnit}>HR</ThemedText>
                    </View>
                    <View style={styles.timeInputBox}>
                       <TextInput 
                        style={styles.timeInput}
                        keyboardType="numeric"
                        value={customReminderMins}
                        onChangeText={setCustomReminderMins}
                        placeholder="0"
                       />
                       <ThemedText style={styles.timeInputUnit}>MIN</ThemedText>
                    </View>
                  </View>
               </Animated.View>
             )}
          </SectionCard>

          {/* 4. Checklist Section */}
          <SectionCard title="Checklist" icon="list-outline" delay={200}>
            {subtasks.map((item) => (
              <View key={item.id} style={styles.subtaskItem}>
                <Ionicons name="ellipse-outline" size={20} color="#b7c6c2" />
                <ThemedText style={styles.subtaskText}>{item.text}</ThemedText>
                <TouchableOpacity onPress={() => setSubtasks(subtasks.filter(s => s.id !== item.id))}><Ionicons name="close-circle-outline" size={20} color="#0052ff" /></TouchableOpacity>
              </View>
            ))}
            <View style={styles.addSubtaskContainer}>
              <TextInput style={styles.addSubtaskInput} placeholder="Add subtask..." value={newSubtask} onChangeText={setNewSubtask} onSubmitEditing={handleAddSubtask} />
              <TouchableOpacity onPress={handleAddSubtask} style={styles.addSubtaskBtn}><Ionicons name="add" size={24} color="white" /></TouchableOpacity>
            </View>
          </SectionCard>

          <View style={{ height: 160 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <ThemedText style={styles.saveButtonText}>Create Task</ThemedText>
          <Ionicons name="sparkles-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { zIndex: 100 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 64 },
  titleWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitleText: { fontSize: 20, fontFamily: Fonts.black, textAlign: 'center' },
  headerRightPlaceholder: { width: 44 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', ...Shadows.soft },
  scrollContent: { padding: Spacing.md, paddingTop: 10 },
  card: { backgroundColor: '#ffffff', borderRadius: BorderRadius.md, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(183, 198, 194, 0.3)' },
  inputSection: { marginBottom: 16 },
  inputLabel: { ...Typography.label, color: '#b7c6c2', marginBottom: 8, fontSize: 10 },
  titleInput: { fontSize: 28, fontFamily: Fonts.black, color: '#171e19', marginBottom: 8 },
  descInput: { fontSize: 16, fontFamily: Fonts.regular, color: '#171e19', minHeight: 40, textAlignVertical: 'top' },
  unifiedScheduleRow: { flexDirection: 'row', gap: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(183, 198, 194, 0.2)' },
  dateCol: { flex: 1.5 },
  allDayCol: { flex: 1, alignItems: 'flex-end' },
  inlineDateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  inlineDateText: { fontSize: 15, fontFamily: Fonts.bold, color: '#171e19' },
  timeSection: { marginTop: 12 },
  allDayReminderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(183, 198, 194, 0.1)', padding: 12, borderRadius: 12 },
  timePickerRow: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  timeCol: { flex: 1 },
  inlineTimeInput: { fontSize: 15, fontFamily: Fonts.bold, color: '#171e19' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  sectionIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0, 82, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  sectionHeaderText: { ...Typography.h3, color: '#171e19' },
  label: { ...Typography.label, color: '#b7c6c2', marginBottom: 4, fontSize: 10 },
  priorityRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  priorityBtn: { flex: 1, height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(183, 198, 194, 0.15)' },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityBtnText: { fontSize: 14, fontFamily: Fonts.black, color: '#171e19' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(183, 198, 194, 0.3)' },
  chipSelected: { backgroundColor: '#171e19', borderColor: '#171e19' },
  chipText: { fontSize: 14, fontFamily: Fonts.bold, color: '#171e19' },
  chipTextSelected: { color: '#ffffff' },
  addCategoryChip: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0, 82, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  customCategoryInputRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: '#0052ff' },
  customCategoryInput: { width: 80, height: 40, fontFamily: Fonts.bold, color: '#171e19', fontSize: 12 },
  customReminderBox: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(183, 198, 194, 0.2)' },
  customReminderInputsGrid: { flexDirection: 'row', gap: 12, marginTop: 8 },
  timeInputBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(183, 198, 194, 0.15)', borderRadius: 16, paddingHorizontal: 16, height: 52 },
  timeInput: { flex: 1, fontFamily: Fonts.black, fontSize: 18, color: '#171e19' },
  timeInputUnit: { fontSize: 12, fontFamily: Fonts.black, color: '#b7c6c2', marginLeft: 8 },
  subtaskItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, backgroundColor: 'rgba(183, 198, 194, 0.1)', padding: 12, borderRadius: 16 },
  subtaskText: { flex: 1, fontSize: 15, fontFamily: Fonts.regular, color: '#171e19' },
  addSubtaskContainer: { flexDirection: 'row', gap: 12, marginTop: 12 },
  addSubtaskInput: { flex: 1, height: 52, backgroundColor: 'rgba(183, 198, 194, 0.15)', borderRadius: 16, paddingHorizontal: 16, fontFamily: Fonts.bold },
  addSubtaskBtn: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#171e19', justifyContent: 'center', alignItems: 'center' },
  footer: { position: 'absolute', bottom: 40, left: 24, right: 24 },
  saveButton: { height: 64, borderRadius: 32, backgroundColor: '#0052ff', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, ...Shadows.blue },
  saveButtonText: { color: '#ffffff', fontSize: 18, fontFamily: Fonts.black },
});
