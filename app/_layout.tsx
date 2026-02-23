import "@/global.css";

import { NAV_THEME, useResolvedTheme, THEME } from "@/lib/theme";
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
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from "@expo-google-fonts/outfit";
import React, { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useFonts } from "expo-font";
import { ThemeProvider } from "@react-navigation/native";
import { getDatabase } from "@/lib/db/database";
import { useNetworkStore } from "@/lib/store/network-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { syncEngine } from "@/lib/sync/sync-engine";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const resolvedTheme = useResolvedTheme();
  const colors = THEME[resolvedTheme];

  const [dbReady, setDbReady] = useState(false);
  const appState = useRef(AppState.currentState);
  const token = useAuthStore((s) => s.token);

  const [fontsLoaded, fontError] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });

  useEffect(() => {
    getDatabase()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error("Failed to init database:", err);
        setDbReady(true);
      });
  }, []);

  useEffect(() => {
    syncEngine.init(queryClient);
    useNetworkStore.getState().initNetworkListener(() => {
      syncEngine.triggerSync();
    });
    return () => {
      useNetworkStore.getState().stopNetworkListener();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active" && token) {
        syncEngine.triggerSync();
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [token]);

  useEffect(() => {
    if (token && dbReady) {
      syncEngine.performFullSync();
      syncEngine.startPeriodicSync();
    }
  }, [token, dbReady]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, dbReady]);

  if (!fontsLoaded && !fontError) return null;
  if (!dbReady) return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <ThemeProvider value={resolvedTheme === "dark" ? NAV_THEME.dark : NAV_THEME.light}>
              <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
              <SafeAreaView
                style={{ flex: 1, backgroundColor: colors.background }}
                edges={["top"]}
              >
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen
                    name="note/[id]"
                    options={{
                      presentation: "modal",
                      animation: "slide_from_bottom",
                      gestureEnabled: true,
                      gestureDirection: "vertical",
                    }}
                  />
                </Stack>
              </SafeAreaView>
              <PortalHost />
              <Toast />
            </ThemeProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
