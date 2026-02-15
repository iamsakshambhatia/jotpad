import { useColors } from "@/lib/theme";
import { Folder } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface NoteCardProps {
  title: string;
  preview: string;
  date: string;
  folderName: string;
  onPress?: () => void;
}

export function NoteCard({ title, preview, date, folderName, onPress }: NoteCardProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        gap: 8,
        borderRadius: 16,
        backgroundColor: colors.card,
        padding: 16,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          fontFamily: "Outfit_600SemiBold",
          fontSize: 16,
          letterSpacing: -0.5,
          color: colors.foreground,
        }}
        numberOfLines={1}
      >
        {title}
      </Text>

      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 13,
          lineHeight: 18,
          color: colors.mutedForeground,
        }}
        numberOfLines={2}
      >
        {preview}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 11,
            color: colors.mutedForeground,
          }}
        >
          {date}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            borderRadius: 8,
            backgroundColor: colors.muted,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <Folder size={12} color={colors.mutedForeground} />
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 10,
              color: colors.mutedForeground,
            }}
          >
            {folderName}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
