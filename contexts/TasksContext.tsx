import { createContext, useContext } from "react";

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
