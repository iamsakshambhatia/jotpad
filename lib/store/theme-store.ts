import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ThemeMode = "light" | "dark" | "system";
type FontSize = "small" | "medium" | "large";

interface ThemeStore {
  theme: ThemeMode;
  accentColor: string | null;
  fontSize: FontSize;
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (color: string | null) => void;
  setFontSize: (size: FontSize) => void;
}

const STORAGE_KEY = "@jotpad-theme";

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light",
      accentColor: null,
      fontSize: "medium",
      setTheme: (newTheme: ThemeMode) => {
        set({ theme: newTheme });
      },
      setAccentColor: (color: string | null) => {
        set({ accentColor: color });
      },
      setFontSize: (size: FontSize) => {
        set({ fontSize: size });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
