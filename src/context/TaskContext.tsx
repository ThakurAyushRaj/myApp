import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { googleCalendarService, GoogleCalendarEvent } from '@/services/GoogleCalendarService';
import { notificationService } from '@/services/NotificationService';

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export type Priority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  time: string;
  date: string; // YYYY-MM-DD
  done: boolean;
  priority: Priority;
  category: string;
  subtasks?: Subtask[];
  reminder?: string;
  customReminderMinutes?: number;
  description?: string;
  isGoogleTask?: boolean;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (title: string, date: string, time: string, priority: Priority, category: string, subtasks?: Subtask[], reminder?: string, customReminderMinutes?: number, description?: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  syncWithGoogle: () => Promise<void>;
  isLoading: boolean;
}

const STORAGE_KEY = '@daily_task_club_tasks';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Moved outside component so it's never recreated
function mapGoogleEventToTask(event: GoogleCalendarEvent): Task {
  const isAllDay = !!event.start.date;
  const date = event.start.date || event.start.dateTime!.split('T')[0];
  const time = isAllDay
    ? 'All Day'
    : new Date(event.start.dateTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  return {
    id: event.id,
    title: event.summary,
    date,
    time,
    done: false,
    priority: 'Medium',
    category: 'Work',
    subtasks: [],
    isGoogleTask: true,
  };
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { googleToken, refreshGoogleToken } = useAuth();

  // Use a ref to track if we've already synced for this token to avoid infinite loops
  const lastSyncedToken = useRef<string | null>(null);

  // Load tasks from storage on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }
      } catch (e) {
        console.error('Failed to load tasks from storage', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
    notificationService.requestPermissions();
  }, []);

  // Save tasks to storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoading]);

  const syncWithGoogle = useCallback(async () => {
    if (!googleToken) return;

    try {
      console.log('TaskContext: Syncing with Google Calendar...');
      const events = await googleCalendarService.fetchUpcomingEvents(googleToken);

      setTasks(prevTasks => {
        const newTasks = [...prevTasks];
        events.forEach(event => {
          const existingIndex = newTasks.findIndex(t => t.id === event.id);
          if (existingIndex === -1) {
            newTasks.push(mapGoogleEventToTask(event));
          } else {
            newTasks[existingIndex] = {
              ...newTasks[existingIndex],
              title: event.summary,
              date: event.start.date || event.start.dateTime!.split('T')[0],
            };
          }
        });
        return newTasks;
      });
    } catch (error: any) {
      if (error?.response?.status === 401) {
        console.log('TaskContext: Token expired, refreshing...');
        const newToken = await refreshGoogleToken();
        if (newToken) {
          return syncWithGoogle();
        }
      }
      console.error('Google sync failed:', error);
    }
  }, [googleToken, refreshGoogleToken]);

  // Automatically sync ONCE when token first becomes available after loading
  useEffect(() => {
    if (googleToken && !isLoading && lastSyncedToken.current !== googleToken) {
      lastSyncedToken.current = googleToken;
      syncWithGoogle();
    }
  }, [googleToken, isLoading, syncWithGoogle]);

  const addTask = (title: string, date: string, time: string, priority: Priority, category: string, subtasks?: Subtask[], reminder?: string, customReminderMinutes?: number, description?: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      date,
      time,
      done: false,
      priority,
      category,
      subtasks: subtasks || [],
      reminder: reminder || 'None',
      customReminderMinutes,
      description,
    };
    setTasks((prev) => [newTask, ...prev]);

    if (newTask.reminder !== 'None') {
      console.log(`TaskProvider: Scheduling notification for task "${newTask.title}"`);
      notificationService.scheduleTaskNotification(newTask as any);
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => {
      const updated = prev.map((task) => (task.id === id ? { ...task, ...updates } : task));

      const task = updated.find(t => t.id === id);
      if (task && task.reminder && task.reminder !== 'None') {
        console.log(`TaskProvider: Updating notification for task "${task.title}"`);
        notificationService.scheduleTaskNotification(task as any);
      }

      return updated;
    });
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const newDone = !task.done;
          return {
            ...task,
            done: newDone,
            subtasks: task.subtasks?.map(s => ({ ...s, done: newDone }))
          };
        }
        return task;
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const newSubtasks = task.subtasks?.map((s) =>
            s.id === subtaskId ? { ...s, done: !s.done } : s
          );
          const allSubtasksDone = newSubtasks?.every(s => s.done);
          return {
            ...task,
            subtasks: newSubtasks,
            done: !!allSubtasksDone
          };
        }
        return task;
      })
    );
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, toggleTask, toggleSubtask, syncWithGoogle, isLoading }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
