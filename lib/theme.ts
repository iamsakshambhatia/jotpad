import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";

export const THEME = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(0 0% 3.9%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(0 0% 3.9%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(0 0% 3.9%)",
    primary: "hsl(217 89% 54%)", // #1F76F3 - Facilpay blue
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(183 98% 45%)", // #02DEE5 - Facilpay cyan
    secondaryForeground: "hsl(0 0% 100%)",
    muted: "hsl(0 0% 96.1%)",
    mutedForeground: "hsl(0 0% 45.1%)",
    accent: "hsl(183 98% 45%)", // #02DEE5 - Facilpay cyan
    accentForeground: "hsl(0 0% 100%)",
    destructive: "hsl(0 84.2% 60.2%)",
    border: "hsl(0 0% 89.8%)",
    input: "hsl(0 0% 89.8%)",
    ring: "hsl(217 89% 54%)", // #1F76F3 - Facilpay blue
    radius: "0.625rem",
    chart1: "hsl(217 89% 54%)", // #1F76F3
    chart2: "hsl(183 98% 45%)", // #02DEE5
    chart3: "hsl(197 37% 24%)",
    chart4: "hsl(43 74% 66%)",
    chart5: "hsl(27 87% 67%)",
  },
  dark: {
    background: "hsl(220 30% 8%)", // Deep dark blue-gray inspired by Facilpay
    foreground: "hsl(0 0% 98%)",
    card: "hsl(220 25% 12%)",
    cardForeground: "hsl(0 0% 98%)",
    popover: "hsl(220 25% 12%)",
    popoverForeground: "hsl(0 0% 98%)",
    primary: "hsl(217 89% 64%)", // Brighter blue for dark mode
    primaryForeground: "hsl(220 30% 8%)",
    secondary: "hsl(183 98% 55%)", // Brighter cyan for dark mode
    secondaryForeground: "hsl(220 30% 8%)",
    muted: "hsl(220 20% 18%)",
    mutedForeground: "hsl(0 0% 63.9%)",
    accent: "hsl(183 98% 55%)", // Brighter cyan for dark mode
    accentForeground: "hsl(220 30% 8%)",
    destructive: "hsl(0 70.9% 59.4%)",
    border: "hsl(220 20% 20%)",
    input: "hsl(220 20% 20%)",
    ring: "hsl(217 89% 64%)", // Brighter blue for dark mode
    radius: "0.625rem",
    chart1: "hsl(217 89% 64%)", // #1F76F3 variant
    chart2: "hsl(183 98% 55%)", // #02DEE5 variant
    chart3: "hsl(30 80% 55%)",
    chart4: "hsl(280 65% 60%)",
    chart5: "hsl(340 75% 55%)",
  },
};

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
