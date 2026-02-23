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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32, gap: 40 }}>
            {/* Brand */}
            <View style={{ alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  backgroundColor: colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                }}
              >
                <NotebookPen size={36} color="#FFFFFF" />
              </View>
              <Text
                style={{
                  fontFamily: "Outfit_900Black",
                  fontSize: 36,
                  letterSpacing: -1,
                  color: colors.foreground,
                  marginTop: 8,
                }}
              >
                Jotpad
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: colors.mutedForeground,
                }}
              >
                Create your account
              </Text>
            </View>

            {/* Form */}
            <View style={{ gap: 16 }}>
              {/* Email Field */}
              <View style={{ gap: 8 }}>
                <Text
                  style={{
                    fontFamily: "Outfit_600SemiBold",
                    fontSize: 13,
                    color: colors.foreground,
                  }}
                >
                  Email
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: colors.input,
                    borderWidth: 1,
                    borderColor: colors.borderSubtle,
                    paddingHorizontal: 16,
                  }}
                >
                  <Mail size={18} color={colors.tertiary} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.tertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                      flex: 1,
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: colors.foreground,
                    }}
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={{ gap: 8 }}>
                <Text
                  style={{
                    fontFamily: "Outfit_600SemiBold",
                    fontSize: 13,
                    color: colors.foreground,
                  }}
                >
                  Password
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: colors.input,
                    borderWidth: 1,
                    borderColor: colors.borderSubtle,
                    paddingHorizontal: 16,
                  }}
                >
                  <Lock size={18} color={colors.tertiary} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Min. 8 characters"
                    placeholderTextColor={colors.tertiary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    onSubmitEditing={handleRegister}
                    style={{
                      flex: 1,
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: colors.foreground,
                    }}
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
              style={({ pressed }) => ({
                height: 54,
                borderRadius: 16,
                backgroundColor: colors.accent,
                alignItems: "center",
                justifyContent: "center",
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
                <Text
                  style={{
                    fontFamily: "Outfit_700Bold",
                    fontSize: 16,
                    color: "#FFFFFF",
                  }}
                >
                  Sign Up
                </Text>
              )}
            </Pressable>

            {/* Bottom Spacer */}
            <View style={{ flex: 1 }} />

            {/* Sign In Row */}
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: colors.mutedForeground,
                }}
              >
                Already have an account?
              </Text>
              <Pressable onPress={() => router.back()}>
                <Text
                  style={{
                    fontFamily: "Outfit_700Bold",
                    fontSize: 14,
                    color: colors.accent,
                  }}
                >
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
