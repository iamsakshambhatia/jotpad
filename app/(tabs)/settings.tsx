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
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

const ACCENT_COLORS = [
  null, // default — warm gold
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
      style={({ pressed }) => ({
        flex: 1,
        alignItems: "center",
        gap: 8,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 20,
          width: "100%",
          aspectRatio: 1,
          backgroundColor: isActive ? colors.accentSurface : colors.card,
          borderWidth: isActive ? 2 : 1,
          borderColor: isActive ? colors.accent : colors.borderSubtle,
        }}
      >
        <IconComp
          size={26}
          color={isActive ? colors.accent : colors.tertiary}
        />
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
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: destructive ? colors.destructive + "15" : colors.muted,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconComp size={16} color={iconColor} />
      </View>
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 15,
          color: labelColor,
          flex: 1,
        }}
      >
        {label}
      </Text>
      {value && (
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 13,
            color: colors.tertiary,
          }}
        >
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

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 32, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 100 }}
      >
        {/* Header */}
        <Text
          style={{
            fontFamily: "Outfit_800ExtraBold",
            fontSize: 26,
            letterSpacing: -0.5,
            color: colors.foreground,
          }}
        >
          Settings
        </Text>

        {/* Appearance Section */}
        <View style={{ gap: 16 }}>
          <Text
            style={{
              fontFamily: "Outfit_700Bold",
              fontSize: 18,
              letterSpacing: -0.3,
              color: colors.foreground,
            }}
          >
            Appearance
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <ThemeCard
              label="Light"
              icon={Sun}
              isActive={theme === "light"}
              onPress={() => setTheme("light")}
              colors={colors}
            />
            <ThemeCard
              label="Dark"
              icon={Moon}
              isActive={theme === "dark"}
              onPress={() => setTheme("dark")}
              colors={colors}
            />
            <ThemeCard
              label="System"
              icon={Monitor}
              isActive={theme === "system"}
              onPress={() => setTheme("system")}
              colors={colors}
            />
          </View>
        </View>

        {/* Accent Color Section */}
        <View style={{ gap: 16 }}>
          <Text
            style={{
              fontFamily: "Outfit_700Bold",
              fontSize: 18,
              letterSpacing: -0.3,
              color: colors.foreground,
            }}
          >
            Accent Color
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {ACCENT_COLORS.map((color) => {
              const displayColor = color ?? defaultAccent;
              const isSelected = accentColor === color;
              return (
                <Pressable
                  key={color ?? "default"}
                  onPress={() => setAccentColor(color)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    backgroundColor: displayColor,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: "#FFFFFF",
                    shadowColor: displayColor,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isSelected ? 0.4 : 0,
                    shadowRadius: 8,
                  }}
                >
                  {isSelected && (
                    <Check size={18} color="#FFFFFF" strokeWidth={3} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* General Section */}
        <View style={{ gap: 16 }}>
          <Text
            style={{
              fontFamily: "Outfit_700Bold",
              fontSize: 18,
              letterSpacing: -0.3,
              color: colors.foreground,
            }}
          >
            General
          </Text>
          <View
            style={{
              overflow: "hidden",
              borderRadius: 20,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
            }}
          >
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
            <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginHorizontal: 16 }} />
            <SettingsRow
              icon={Shield}
              label="Privacy & Security"
              onPress={() => {}}
              colors={colors}
            />
            <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginHorizontal: 16 }} />
            <SettingsRow
              icon={HelpCircle}
              label="Help & Support"
              onPress={() => {}}
              colors={colors}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={{ gap: 16 }}>
          <Text
            style={{
              fontFamily: "Outfit_700Bold",
              fontSize: 18,
              letterSpacing: -0.3,
              color: colors.foreground,
            }}
          >
            Account
          </Text>
          <View
            style={{
              overflow: "hidden",
              borderRadius: 20,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
            }}
          >
            <SettingsRow
              icon={Info}
              label="Email"
              value={email ?? ""}
              colors={colors}
            />
            <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginHorizontal: 16 }} />
            <SettingsRow
              icon={Trash2}
              label="Delete Account"
              onPress={() => {}}
              colors={colors}
              destructive
            />
          </View>
        </View>

        {/* Sign Out */}
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 16,
            backgroundColor: colors.destructive + "12",
            height: 52,
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
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 12,
            textAlign: "center",
            color: colors.tertiary,
          }}
        >
          Jotpad v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
