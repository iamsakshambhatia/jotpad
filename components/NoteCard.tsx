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
      className="flex-row rounded-[20px] bg-card border border-border-subtle p-4 gap-2.5 overflow-hidden"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      {isFavorite && (
        <View
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-sm"
          style={{ backgroundColor: colors.accent }}
        />
      )}

      <View className="flex-1 gap-2.5">
        <Text
          className="text-foreground"
          style={{ fontFamily: "Outfit_600SemiBold", fontSize: 16, letterSpacing: -0.3 }}
          numberOfLines={1}
        >
          {title}
        </Text>

        <Text
          className="text-muted-foreground"
          style={{ fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 }}
          numberOfLines={2}
        >
          {preview}
        </Text>

        <View className="flex-row items-center justify-between">
          <Text
            className="text-tertiary"
            style={{ fontFamily: "Inter_500Medium", fontSize: 11 }}
          >
            {date}
          </Text>

          <View className="flex-row items-center gap-1 rounded-lg bg-muted px-2 py-[3px]">
            <Folder size={11} color={colors.tertiary} />
            <Text
              className="text-tertiary"
              style={{ fontFamily: "Inter_500Medium", fontSize: 10 }}
            >
              {folderName}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
