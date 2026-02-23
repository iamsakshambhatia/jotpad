import { useColors } from "@/lib/theme";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface FolderItemProps {
  name: string;
  count: number;
  icon: LucideIcon;
  onPress?: () => void;
}

export function FolderItem({ name, count, icon: FolderIcon, onPress }: FolderItemProps) {
  const colors = useColors();

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
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: colors.accentSurface,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FolderIcon size={18} color={colors.accent} />
      </View>

      <Text
        style={{
          fontFamily: "Outfit_600SemiBold",
          fontSize: 15,
          color: colors.foreground,
          flex: 1,
        }}
      >
        {name}
      </Text>

      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 13,
          color: colors.tertiary,
        }}
      >
        {count}
      </Text>

      <ChevronRight size={16} color={colors.tertiary} />
    </Pressable>
  );
}
