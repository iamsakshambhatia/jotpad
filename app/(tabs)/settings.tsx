import { useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { THEME, useColors, useResolvedTheme } from "@/lib/theme";
import { useThemeStore } from "@/lib/store/theme-store";
import { useRouter } from "expo-router";
import {
  Check,
  ChevronRight,
  HelpCircle,
  Info,
  LogOut,
  Moon,
  Monitor,
  Shield,
  Smartphone,
  Sun,
  Trash2,
} from "lucide-react-native";
import { Alert, FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LinearGradient } from "expo-linear-gradient";

const ACCENT_COLORS = [
  null,
  "#6366F1",
  "#EC4899",
  "#F97316",
  "#10B981",
  "#3B82F6",
  "#E5484D",
] as const;

function ThemeCard({
  label,
  icon: IconComp,
  isActive,
  onPress,
  colors,
}: {
  label: string;
  icon: typeof Sun;
  isActive: boolean;
  onPress: () => void;
  colors: (typeof THEME)["light"];
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center gap-2"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View
        className="items-center justify-center rounded-[20px] w-full aspect-square"
        style={{
          backgroundColor: isActive ? colors.accentSurface : colors.card,
          borderWidth: isActive ? 2 : 1,
          borderColor: isActive ? colors.accent : colors.borderSubtle,
        }}
      >
        <IconComp size={26} color={isActive ? colors.accent : colors.tertiary} />
      </View>
      <Text
        style={{
          fontFamily: isActive ? "Outfit_700Bold" : "Inter_500Medium",
          fontSize: 12,
          color: isActive ? colors.accent : colors.mutedForeground,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SettingsRow({
  icon: IconComp,
  label,
  value,
  onPress,
  colors,
  destructive,
}: {
  icon: typeof Info;
  label: string;
  value?: string;
  onPress?: () => void;
  colors: (typeof THEME)["light"];
  destructive?: boolean;
}) {
  const iconColor = destructive ? colors.destructive : colors.mutedForeground;
  const labelColor = destructive ? colors.destructive : colors.foreground;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3.5"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View
        className="w-8 h-8 rounded-lg items-center justify-center"
        style={{ backgroundColor: destructive ? colors.destructive + "15" : colors.muted }}
      >
        <IconComp size={16} color={iconColor} />
      </View>
      <Text
        className="flex-1"
        style={{ fontFamily: "Inter_500Medium", fontSize: 15, color: labelColor }}
      >
        {label}
      </Text>
      {value && (
        <Text className="text-tertiary" style={{ fontFamily: "Inter_400Regular", fontSize: 13 }}>
          {value}
        </Text>
      )}
      {onPress && !destructive && <ChevronRight size={16} color={colors.tertiary} />}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const setTheme = useThemeStore((state) => state.setTheme);
  const theme = useThemeStore((state) => state.theme);
  const accentColor = useThemeStore((state) => state.accentColor);
  const setAccentColor = useThemeStore((state) => state.setAccentColor);
  const fontSize = useThemeStore((state) => state.fontSize);
  const setFontSize = useThemeStore((state) => state.setFontSize);
  const colors = useColors();
  const resolvedTheme = useResolvedTheme();
  const defaultAccent = THEME[resolvedTheme].accent;
  const router = useRouter();
  const email = useAuthStore((state) => state.email);
  const logout = useAuthStore((state) => state.logout);

  const [showSignOut, setShowSignOut] = useState(false);

  const confirmSignOut = () => {
    setShowSignOut(false);
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 32, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 100 }}
      >
        {/* Header */}
        <Text
          className="text-foreground"
          style={{ fontFamily: "Outfit_800ExtraBold", fontSize: 26, letterSpacing: -0.5 }}
        >
          Settings
        </Text>

        {/* Appearance */}
        <View className="gap-4">
          <Text
            className="text-foreground"
            style={{ fontFamily: "Outfit_700Bold", fontSize: 18, letterSpacing: -0.3 }}
          >
            Appearance
          </Text>
          <View className="flex-row gap-3">
            <ThemeCard label="Light" icon={Sun} isActive={theme === "light"} onPress={() => setTheme("light")} colors={colors} />
            <ThemeCard label="Dark" icon={Moon} isActive={theme === "dark"} onPress={() => setTheme("dark")} colors={colors} />
            <ThemeCard label="System" icon={Monitor} isActive={theme === "system"} onPress={() => setTheme("system")} colors={colors} />
          </View>
        </View>

        {/* Accent Color */}
        <View className="gap-4">
          <Text
            className="text-foreground"
            style={{ fontFamily: "Outfit_700Bold", fontSize: 18, letterSpacing: -0.3 }}
          >
            Accent Color
          </Text>
          <View style={{ marginHorizontal: -24 }}>
            <FlatList
              data={ACCENT_COLORS as readonly (string | null)[]}
              keyExtractor={(item) => item ?? "default"}
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
              renderItem={({ item: color }) => {
                const displayColor = color ?? defaultAccent;
                const isSelected = accentColor === color;
                return (
                  <Pressable
                    onPress={() => setAccentColor(color)}
                    className="w-[42px] h-[42px] rounded-[14px] items-center justify-center"
                    style={{
                      backgroundColor: displayColor,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: "#FFFFFF",
                      shadowColor: displayColor,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isSelected ? 0.4 : 0,
                      shadowRadius: 8,
                    }}
                  >
                    {isSelected && <Check size={18} color="#FFFFFF" strokeWidth={3} />}
                  </Pressable>
                );
              }}
            />
            <LinearGradient
              colors={[colors.background, colors.background + "00"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 32 }}
              pointerEvents="none"
            />
            <LinearGradient
              colors={[colors.background + "00", colors.background]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 32 }}
              pointerEvents="none"
            />
          </View>
        </View>

        {/* General */}
        <View className="gap-4">
          <Text
            className="text-foreground"
            style={{ fontFamily: "Outfit_700Bold", fontSize: 18, letterSpacing: -0.3 }}
          >
            General
          </Text>
          <View className="overflow-hidden rounded-[20px] bg-card border border-border-subtle">
            <SettingsRow
              icon={Smartphone}
              label="Default Font Size"
              value={fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}
              onPress={() => {
                Alert.alert("Font Size", "Choose your default font size", [
                  { text: "Small", onPress: () => setFontSize("small") },
                  { text: "Medium", onPress: () => setFontSize("medium") },
                  { text: "Large", onPress: () => setFontSize("large") },
                  { text: "Cancel", style: "cancel" },
                ]);
              }}
              colors={colors}
            />
            <View className="h-px bg-border-subtle mx-4" />
            <SettingsRow icon={Shield} label="Privacy & Security" onPress={() => {}} colors={colors} />
            <View className="h-px bg-border-subtle mx-4" />
            <SettingsRow icon={HelpCircle} label="Help & Support" onPress={() => {}} colors={colors} />
          </View>
        </View>

        {/* Account */}
        <View className="gap-4">
          <Text
            className="text-foreground"
            style={{ fontFamily: "Outfit_700Bold", fontSize: 18, letterSpacing: -0.3 }}
          >
            Account
          </Text>
          <View className="overflow-hidden rounded-[20px] bg-card border border-border-subtle">
            <SettingsRow icon={Info} label="Email" value={email ?? ""} colors={colors} />
            <View className="h-px bg-border-subtle mx-4" />
            <SettingsRow icon={Trash2} label="Delete Account" onPress={() => {}} colors={colors} destructive />
          </View>
        </View>

        {/* Sign Out */}
        <Pressable
          onPress={() => setShowSignOut(true)}
          className="flex-row items-center justify-center gap-2 rounded-2xl h-[52px]"
          style={({ pressed }) => ({
            backgroundColor: colors.destructive + "12",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <LogOut size={18} color={colors.destructive} />
          <Text style={{ fontFamily: "Outfit_600SemiBold", fontSize: 15, color: colors.destructive }}>
            Sign Out
          </Text>
        </Pressable>

        {/* Version */}
        <Text
          className="text-tertiary text-center"
          style={{ fontFamily: "Inter_400Regular", fontSize: 12 }}
        >
          Jotpad v1.0.0
        </Text>
      </ScrollView>

      <ConfirmDialog
        visible={showSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmLabel="Sign Out"
        destructive
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOut(false)}
      />
    </View>
  );
}
