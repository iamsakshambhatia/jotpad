import "@/global.css";

import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useUniwind } from "uniwind";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fontsLoaded } from "@/lib/font";
import React, { useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: false,
    },
  },
});

SplashScreen.preventAutoHideAsync();

useEffect(() => {
  if (fontsLoaded) {
    SplashScreen.hideAsync();
  }
}, [fontsLoaded]);

export default function RootLayout() {
  const { theme } = useUniwind();

  return (
    <ErrorBoundary>
      <GestureHandlerRootView className="flex-1">
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <ThemeProvider value={NAV_THEME[theme ?? "light"]}>
              <StatusBar style={theme === "dark" ? "light" : "dark"} />
              <SafeAreaView className="flex-1" edges={["top"]}>
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
