import { useAuthStore } from "@/lib/store/auth-store";
import { Redirect } from "expo-router";
import { View, Text as RNText } from "react-native";

export default function Index() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
