import { useColors } from "@/lib/theme";
import { Text, View } from "react-native";

interface StatCardProps {
  value: string | number;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  const colors = useColors();

  return (
    <View
      style={{
        flex: 1,
        gap: 4,
        borderRadius: 16,
        backgroundColor: colors.card,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontFamily: "Outfit_900Black",
          fontSize: 32,
          letterSpacing: -1,
          color: colors.foreground,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 11,
          color: colors.mutedForeground,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
