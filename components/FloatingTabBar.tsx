import { useColors } from "@/lib/theme";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        paddingBottom: Math.max(insets.bottom, 12),
      }}
      pointerEvents="box-none"
    >
      {/* Gradient fade above tab bar */}
      <LinearGradient
        colors={[colors.background + "00", colors.background + "CC", colors.background]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 100 + Math.max(insets.bottom, 12),
        }}
        pointerEvents="none"
      />

      {/* Floating pill */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.card,
          borderRadius: 34,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          paddingHorizontal: 8,
          paddingVertical: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 20,
          elevation: 8,
          gap: 4,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const icon = options.tabBarIcon?.({
            focused: isFocused,
            color: isFocused ? colors.accent : colors.tertiary,
            size: 22,
          });

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: isFocused ? 16 : 14,
                paddingVertical: 10,
                borderRadius: 28,
                backgroundColor: isFocused ? colors.accentSurface : "transparent",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              {icon}
              {isFocused && (
                <Text
                  style={{
                    fontFamily: "Outfit_700Bold",
                    fontSize: 13,
                    color: colors.accent,
                    letterSpacing: -0.3,
                  }}
                >
                  {options.title ?? route.name}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
