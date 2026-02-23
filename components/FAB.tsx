import { useColors } from "@/lib/theme";
import { Plus } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

interface FABProps {
  onPress?: () => void;
}

export function FAB({ onPress }: FABProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: colors.accent,
          opacity: pressed ? 0.85 : 1,
          shadowColor: colors.accent,
        },
      ]}
    >
      <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
});
