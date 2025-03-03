"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface TasksContextType {
  refreshTasks: () => Promise<void>;
  isLoading: boolean;
}

export const TasksContext = createContext<TasksContextType | null>(null);

export function useTasksContext() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error(
      "useTasksContext must be used within a TasksContext.Provider"
    );
  }
  return context;
}

interface TasksProviderProps {
  children: ReactNode;
}

export function TasksProvider({ children }: TasksProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const refreshTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const value = {
    refreshTasks,
    isLoading,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}
