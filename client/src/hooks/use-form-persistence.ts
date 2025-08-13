import { useState, useEffect } from "react";

// Generic hook to persist form data in localStorage
export function useFormPersistence<T>(key: string, initialData: T) {
  const [data, setData] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(`resai-form-${key}`);
      return saved ? JSON.parse(saved) : initialData;
    } catch {
      return initialData;
    }
  });

  const updateData = (newData: Partial<T>) => {
    setData(prev => {
      const updated = { ...prev, ...newData };
      try {
        localStorage.setItem(`resai-form-${key}`, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save form data:", error);
      }
      return updated;
    });
  };

  const clearData = () => {
    setData(initialData);
    try {
      localStorage.removeItem(`resai-form-${key}`);
    } catch (error) {
      console.error("Failed to clear form data:", error);
    }
  };

  return { data, updateData, clearData };
}