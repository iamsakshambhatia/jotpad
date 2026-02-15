import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";
import { useThemeStore } from "@/lib/store/theme-store";
import { useColorScheme } from "react-native";

export const THEME = {
  light: {
    background: "#FFFFFF",
    foreground: "#000000",
    card: "#F4F4F5",
    cardForeground: "#000000",
    popover: "#FFFFFF",
    popoverForeground: "#000000",
    primary: "#000000",
    primaryForeground: "#FFFFFF",
    secondary: "#F4F4F5",
    secondaryForeground: "#000000",
    muted: "#F4F4F5",
    mutedForeground: "#71717A",
    accent: "#000000",
    accentForeground: "#FFFFFF",
    destructive: "#EF4444",
    border: "#E4E4E7",
    borderSubtle: "#F4F4F5",
    input: "#F4F4F5",
    ring: "#000000",
    tertiary: "#A1A1AA",
    tabInactive: "#A1A1AA",
  },
  dark: {
    background: "#0A0A0F",
    foreground: "#FAFAFA",
    card: "#18181B",
    cardForeground: "#FAFAFA",
    popover: "#27272A",
    popoverForeground: "#FAFAFA",
    primary: "#FFFFFF",
    primaryForeground: "#000000",
    secondary: "#18181B",
    secondaryForeground: "#FAFAFA",
    muted: "#18181B",
    mutedForeground: "#A1A1AA",
    accent: "#FFFFFF",
    accentForeground: "#000000",
    destructive: "#EF4444",
    border: "#3F3F46",
    borderSubtle: "#27272A",
    input: "#18181B",
    ring: "#FFFFFF",
    tertiary: "#71717A",
    tabInactive: "#52525B",
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
      primary: THEME.light.primary,
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
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
