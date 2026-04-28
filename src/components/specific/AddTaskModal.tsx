import React, { useState } from 'react';
import { StyleSheet, View, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Spacing, BorderRadius, Typography, Fonts, Shadows } from '@/constants/theme';
import { useTasks } from '@/context/TaskContext';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/common/themed-text';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddTaskModal({ visible, onClose }: AddTaskModalProps) {
  const { isDark } = useAppTheme();
  const theme = Colors[isDark ? 'dark' : 'light'];
  const { addTask } = useTasks();
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  const handleAdd = () => {
    if (title.trim()) {
      addTask(title, time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setTitle('');
      setTime('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalView}>
          <View style={styles.headerRow}>
            <ThemedText style={styles.modalHeading}>New Activity</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeCircle}>
              <Ionicons name="close" size={24} color="#171e19" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputWrapper}>
            <ThemedText style={styles.inputLabelText}>ACTIVITY TITLE</ThemedText>
            <TextInput
              style={styles.textInput}
              placeholder="What needs to be done?"
              placeholderTextColor={theme.textSecondary}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          <View style={styles.inputWrapper}>
            <ThemedText style={styles.inputLabelText}>TIME (OPTIONAL)</ThemedText>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 10:00 AM"
              placeholderTextColor={theme.textSecondary}
              value={time}
              onChangeText={setTime}
            />
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleAdd} activeOpacity={0.9}>
            <ThemedText style={styles.primaryBtnText}>Save Activity</ThemedText>
            <Ionicons name="checkmark" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23, 30, 25, 0.4)',
  },
  modalView: {
    backgroundColor: '#eeebe3', // Keep as base off-white for specific modal style
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 32,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    ...Shadows.soft,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalHeading: {
    fontSize: 24,
    fontFamily: Fonts.black,
    color: '#171e19',
  },
  closeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabelText: {
    ...Typography.label,
    color: '#b7c6c2',
    marginBottom: 8,
  },
  textInput: {
    height: 64,
    backgroundColor: '#ffffff',
    borderRadius: 24, // Nested per spec
    paddingHorizontal: 20,
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#171e19',
    borderWidth: 1,
    borderColor: 'rgba(183, 198, 194, 0.3)',
  },
  primaryBtn: {
    height: 64,
    borderRadius: 32, // Pill shape
    backgroundColor: '#0052ff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    ...Shadows.blue,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Nunito_900Black',
  },
});
