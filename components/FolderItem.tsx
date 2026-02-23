import { useColors } from "@/lib/theme";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface FolderItemProps {
  name: string;
  count: number;
  icon: LucideIcon;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function FolderItem({ name, count, icon: FolderIcon, onPress, onLongPress }: FolderItemProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-row items-center gap-3 px-4 py-3.5"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View className="w-9 h-9 rounded-[10px] bg-accent-surface items-center justify-center">
        <FolderIcon size={18} color={colors.accent} />
      </View>

      <Text
        className="flex-1 text-foreground"
        style={{ fontFamily: "Outfit_600SemiBold", fontSize: 15 }}
      >
        {name}
      </Text>

      <Text
        className="text-tertiary"
        style={{ fontFamily: "Inter_500Medium", fontSize: 13 }}
      >
        {count}
      </Text>

      <ChevronRight size={16} color={colors.tertiary} />
    </Pressable>
  );
}
