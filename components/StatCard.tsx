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
        borderRadius: 20,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontFamily: "Outfit_900Black",
          fontSize: 36,
          letterSpacing: -1.5,
          color: colors.foreground,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 11,
          letterSpacing: 0.5,
          color: colors.mutedForeground,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
