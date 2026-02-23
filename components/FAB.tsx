import { useColors } from "@/lib/theme";
import { Plus } from "lucide-react-native";
import { Pressable } from "react-native";

interface FABProps {
  onPress?: () => void;
}

export function FAB({ onPress }: FABProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-[100px] right-6 w-14 h-14 rounded-full items-center justify-center"
      style={({ pressed }) => ({
        backgroundColor: colors.accent,
        opacity: pressed ? 0.85 : 1,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
      })}
    >
      <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
    </Pressable>
  );
}
