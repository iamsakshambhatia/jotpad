import { useColors } from "@/lib/theme";
import { useRegister, useLogin } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { NotebookPen, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const colors = useColors();
  const router = useRouter();
  const register = useRegister();
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({ type: "error", text1: "Please enter email and password" });
      return;
    }
    if (password.length < 8) {
      Toast.show({ type: "error", text1: "Password must be at least 8 characters" });
      return;
    }

    register.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          login.mutate(
            { email: email.trim(), password },
            {
              onSuccess: (data) => {
                useAuthStore.setState({
                  token: data.access_token,
                  refreshToken: data.refresh_token,
                  email: email.trim(),
                });
                router.replace("/(tabs)");
              },
              onError: () => {
                Toast.show({ type: "success", text1: "Account created! Please sign in." });
                router.back();
              },
            }
          );
        },
        onError: () => {
          Toast.show({ type: "error", text1: "Registration failed. Email may already exist." });
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-[60px] pb-8 gap-10">
            {/* Brand */}
            <View className="items-center gap-3">
              <View
                className="w-[72px] h-[72px] rounded-[20px] items-center justify-center"
                style={{
                  backgroundColor: colors.accent,
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                }}
              >
                <NotebookPen size={36} color="#FFFFFF" />
              </View>
              <Text
                className="text-foreground mt-2"
                style={{ fontFamily: "Outfit_900Black", fontSize: 36, letterSpacing: -1 }}
              >
                Jotpad
              </Text>
              <Text
                className="text-muted-foreground"
                style={{ fontFamily: "Inter_400Regular", fontSize: 15 }}
              >
                Create your account
              </Text>
            </View>

            {/* Form */}
            <View className="gap-4">
              {/* Email */}
              <View className="gap-2">
                <Text
                  className="text-foreground"
                  style={{ fontFamily: "Outfit_600SemiBold", fontSize: 13 }}
                >
                  Email
                </Text>
                <View className="flex-row items-center gap-2.5 h-[52px] rounded-2xl bg-input border border-border-subtle px-4">
                  <Mail size={18} color={colors.tertiary} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.tertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="flex-1 text-foreground"
                    style={{ fontFamily: "Inter_400Regular", fontSize: 14 }}
                  />
                </View>
              </View>

              {/* Password */}
              <View className="gap-2">
                <Text
                  className="text-foreground"
                  style={{ fontFamily: "Outfit_600SemiBold", fontSize: 13 }}
                >
                  Password
                </Text>
                <View className="flex-row items-center gap-2.5 h-[52px] rounded-2xl bg-input border border-border-subtle px-4">
                  <Lock size={18} color={colors.tertiary} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Min. 8 characters"
                    placeholderTextColor={colors.tertiary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    onSubmitEditing={handleRegister}
                    className="flex-1 text-foreground"
                    style={{ fontFamily: "Inter_400Regular", fontSize: 14 }}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Eye size={18} color={colors.tertiary} /> : <EyeOff size={18} color={colors.tertiary} />}
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Sign Up Button */}
            <Pressable
              onPress={handleRegister}
              disabled={register.isPending || login.isPending}
              className="h-[54px] rounded-2xl items-center justify-center"
              style={({ pressed }) => ({
                backgroundColor: colors.accent,
                opacity: pressed ? 0.85 : 1,
                shadowColor: colors.accent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
              })}
            >
              {register.isPending || login.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ fontFamily: "Outfit_700Bold", fontSize: 16, color: "#FFFFFF" }}>
                  Sign Up
                </Text>
              )}
            </Pressable>

            <View className="flex-1" />

            {/* Sign In Row */}
            <View className="flex-row justify-center gap-1">
              <Text
                className="text-muted-foreground"
                style={{ fontFamily: "Inter_400Regular", fontSize: 14 }}
              >
                Already have an account?
              </Text>
              <Pressable onPress={() => router.back()}>
                <Text style={{ fontFamily: "Outfit_700Bold", fontSize: 14, color: colors.accent }}>
                  Sign In
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
