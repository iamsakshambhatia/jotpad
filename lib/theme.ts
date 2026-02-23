import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";
import { useThemeStore } from "@/lib/store/theme-store";
import { useColorScheme } from "react-native";

export const THEME = {
  light: {
    background: "#FAF9F6",
    foreground: "#1C1C1E",
    card: "#FFFFFF",
    cardForeground: "#1C1C1E",
    popover: "#FFFFFF",
    popoverForeground: "#1C1C1E",
    primary: "#1C1C1E",
    primaryForeground: "#FFFFFF",
    secondary: "#F5F4F1",
    secondaryForeground: "#1C1C1E",
    muted: "#F5F4F1",
    mutedForeground: "#6B6B6F",
    accent: "#C9A962",
    accentForeground: "#FFFFFF",
    destructive: "#E5484D",
    border: "#E0DDD6",
    borderSubtle: "#F0EDE8",
    input: "#F5F4F1",
    ring: "#C9A962",
    tertiary: "#A0A0A5",
    tabInactive: "#A0A0A5",
    accentSurface: "#C9A96215",
  },
  dark: {
    background: "#141416",
    foreground: "#F5F5F0",
    card: "#1E1E21",
    cardForeground: "#F5F5F0",
    popover: "#28282C",
    popoverForeground: "#F5F5F0",
    primary: "#F5F5F0",
    primaryForeground: "#141416",
    secondary: "#1E1E21",
    secondaryForeground: "#F5F5F0",
    muted: "#28282C",
    mutedForeground: "#8E8E93",
    accent: "#D4B36A",
    accentForeground: "#141416",
    destructive: "#E5484D",
    border: "#3A3A3E",
    borderSubtle: "#2A2A2E",
    input: "#28282C",
    ring: "#D4B36A",
    tertiary: "#5A5A5E",
    tabInactive: "#5A5A5E",
    accentSurface: "#D4B36A15",
  },
};

export function useResolvedTheme(): "light" | "dark" {
  const theme = useThemeStore((state) => state.theme);
  const systemTheme = useColorScheme();
  if (theme === "system") return systemTheme ?? "light";
  return theme as "light" | "dark";
}

export function useColors() {
  const resolvedTheme = useResolvedTheme();
  const accentColor = useThemeStore((state) => state.accentColor);
  const base = THEME[resolvedTheme];
  if (!accentColor) return base;
  return {
    ...base,
    accent: accentColor,
    accentForeground: "#FFFFFF",
  };
}

export const NAV_THEME: Record<"light" | "dark", Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.accent,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.accent,
      text: THEME.dark.foreground,
    },
  },
};
