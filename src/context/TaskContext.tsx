import React, { createContext, useContext, useState } from 'react';

export interface Task {
  id: string;
  title: string;
  time: string;
  done: boolean;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (title: string, time: string) => void;
  toggleTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Design Glassmorphism UI', time: '10:00 AM', done: true },
    { id: '2', title: 'Implement Widget Screen', time: '11:30 AM', done: false },
    { id: '3', title: 'Push Notifications Setup', time: '02:00 PM', done: false },
  ]);

  const addTask = (title: string, time: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      time,
      done: false,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    console.log('TaskContext: Toggling', id);
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };


  return (
    <TaskContext.Provider value={{ tasks, addTask, toggleTask }}>
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
