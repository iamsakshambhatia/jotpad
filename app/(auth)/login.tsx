import { useColors } from "@/lib/theme";
import { useLogin } from "@/lib/api/auth";
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

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({ type: "error", text1: "Please enter email and password" });
      return;
    }

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
          Toast.show({ type: "error", text1: "Invalid email or password" });
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
                Your thoughts, beautifully organized
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
                    placeholder="Enter your password"
                    placeholderTextColor={colors.tertiary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    onSubmitEditing={handleLogin}
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

              {/* Forgot Password */}
              <View style={{ alignItems: "flex-end" }}>
                <Pressable>
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 13,
                      color: colors.accent,
                    }}
                  >
                    Forgot password?
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Sign In Button */}
            <Pressable
              onPress={handleLogin}
              disabled={login.isPending}
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
              {login.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    fontFamily: "Outfit_700Bold",
                    fontSize: 16,
                    color: "#FFFFFF",
                  }}
                >
                  Sign In
                </Text>
              )}
            </Pressable>

            {/* Divider */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.borderSubtle }} />
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.tertiary }}>
                or continue with
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.borderSubtle }} />
            </View>

            {/* Social Buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                style={({ pressed }) => ({
                  flex: 1,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.borderSubtle,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.foreground }}>
                  Google
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => ({
                  flex: 1,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.borderSubtle,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.foreground }}>
                  Apple
                </Text>
              </Pressable>
            </View>

            {/* Bottom Spacer */}
            <View style={{ flex: 1 }} />

            {/* Sign Up Row */}
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: colors.mutedForeground,
                }}
              >
                Don't have an account?
              </Text>
              <Pressable onPress={() => router.push("/(auth)/register")}>
                <Text
                  style={{
                    fontFamily: "Outfit_700Bold",
                    fontSize: 14,
                    color: colors.accent,
                  }}
                >
                  Sign Up
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
