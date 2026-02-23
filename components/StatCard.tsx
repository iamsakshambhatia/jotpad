import { Text, View } from "react-native";

interface StatCardProps {
  value: string | number;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <View className="flex-1 gap-1 rounded-[20px] bg-card border border-border-subtle p-4">
      <Text
        className="text-foreground"
        style={{ fontFamily: "Outfit_900Black", fontSize: 36, letterSpacing: -1.5 }}
      >
        {value}
      </Text>
      <Text
        className="text-muted-foreground uppercase"
        style={{ fontFamily: "Inter_500Medium", fontSize: 11, letterSpacing: 0.5 }}
      >
        {label}
      </Text>
    </View>
  );
}
