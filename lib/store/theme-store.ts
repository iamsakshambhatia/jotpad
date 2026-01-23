import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Uniwind } from "uniwind";

type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "@jotpad-theme";

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (newTheme: Theme) => {
        set({ theme: newTheme });
        // Sync with uniwind to maintain compatibility with className utilities
        Uniwind.setTheme(newTheme);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Sync uniwind with persisted theme after rehydration
        if (state?.theme) {
          Uniwind.setTheme(state.theme);
        }
      },
    }
  )
);
