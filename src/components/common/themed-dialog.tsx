import React from 'react';
import { StyleSheet, View, Modal, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function CustomAlert({
  visible,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
}: CustomAlertProps) {
  const { isDark } = useAppTheme();
  const theme = Colors[isDark ? 'dark' : 'light'];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={[styles.alertBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: theme.accent + '20' }]}>
              <Ionicons name="sparkles" size={32} color={theme.accent} />
            </View>
          </View>
          
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.message}>{message}</ThemedText>
          
          <View style={styles.buttonRow}>
            {onConfirm && (
              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, styles.cancelButton, { backgroundColor: theme.secondary + '20' }]}
              >
                <ThemedText style={[styles.buttonText, { color: theme.textSecondary }]}>{cancelText}</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              style={[styles.button, { backgroundColor: theme.accent }]}
            >
              <ThemedText style={[styles.buttonText, { color: 'white' }]}>{confirmText}</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  alertBox: {
    width: '90%',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
