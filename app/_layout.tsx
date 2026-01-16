import "@/global.css";

import { NAV_THEME, THEME } from "@/lib/theme";
import { useThemeStore } from "@/lib/store/theme-store";
import { PortalHost } from "@rn-primitives/portal";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import { ShadowsIntoLight_400Regular } from "@expo-google-fonts/shadows-into-light";
import React, { useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useFonts } from "expo-font";
import { ThemeProvider } from "@react-navigation/native";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: false,
    },
  },
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const theme = useThemeStore((state) => state.theme);
  const [fontsLoaded] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    ShadowsIntoLight_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView className="flex-1">
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <ThemeProvider value={theme === "dark" ? NAV_THEME.dark : NAV_THEME.light}>
              <StatusBar style={theme === "dark" ? "light" : "dark"} />
              <SafeAreaView
                style={{
                  flex: 1,
                  backgroundColor: THEME[theme ?? "light"].background,
                }}
              >
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                />
                <PortalHost />
                <Toast />
              </SafeAreaView>
            </ThemeProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
