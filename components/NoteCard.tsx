import { useColors } from "@/lib/theme";
import { Folder } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface NoteCardProps {
  title: string;
  preview: string;
  date: string;
  folderName: string;
  isFavorite?: boolean;
  onPress?: () => void;
}

export function NoteCard({ title, preview, date, folderName, isFavorite, onPress }: NoteCardProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        borderRadius: 20,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        padding: 16,
        gap: 10,
        opacity: pressed ? 0.7 : 1,
        overflow: "hidden",
      })}
    >
      {/* Favorite accent bar */}
      {isFavorite && (
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 8,
            bottom: 8,
            width: 3,
            borderRadius: 2,
            backgroundColor: colors.accent,
          }}
        />
      )}

      <View style={{ flex: 1, gap: 10 }}>
        <Text
          style={{
            fontFamily: "Outfit_600SemiBold",
            fontSize: 16,
            letterSpacing: -0.3,
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
            lineHeight: 19,
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
              color: colors.tertiary,
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
              paddingVertical: 3,
            }}
          >
            <Folder size={11} color={colors.tertiary} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 10,
                color: colors.tertiary,
              }}
            >
              {folderName}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
