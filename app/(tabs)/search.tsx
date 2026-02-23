import { useNotes } from "@/lib/api/notes";
import { useFolders } from "@/lib/api/folders";
import { useColors } from "@/lib/theme";
import { NoteCard } from "@/components/NoteCard";
import { format } from "date-fns";
import { Search as SearchIcon, X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function SearchScreen() {
  const colors = useColors();
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { folder_id, show_all } = useLocalSearchParams<{ folder_id?: string; show_all?: string }>();

  const { data: folders } = useFolders();
  const folderName = folder_id ? folders?.find((f) => f.id === folder_id)?.name : undefined;

  const hasFilter = query.length > 0 || !!folder_id || show_all === "true";

  const { data: notes, isLoading } = useNotes({
    variables: {
      search: query || undefined,
      folder_id: folder_id || undefined,
      limit: 50,
    },
    enabled: hasFilter,
  });

  return (
    <View className="flex-1 bg-background">
      <View className="gap-6 px-6 pt-4">
        <Text
          className="text-foreground"
          style={{ fontFamily: "Outfit_800ExtraBold", fontSize: 26, letterSpacing: -0.5 }}
        >
          {folderName ?? (show_all === "true" ? "All Notes" : "Search")}
        </Text>

        <View className="flex-row items-center gap-3 rounded-[26px] bg-input border border-border-subtle px-[18px] h-[50px]">
          <SearchIcon size={18} color={colors.tertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={folderName ? `Search in ${folderName}...` : "Search your notes..."}
            placeholderTextColor={colors.tertiary}
            className="flex-1 text-foreground"
            style={{ fontFamily: "Inter_400Regular", fontSize: 14 }}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <X size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {isLoading && hasFilter && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      )}

      {!isLoading && hasFilter && notes && (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <NoteCard
              title={item.title}
              preview={item.preview}
              date={format(new Date(item.updated_at), "MMM d, yyyy")}
              folderName={item.folder?.name ?? "Uncategorized"}
              isFavorite={item.is_favorite}
              onPress={() => router.push(`/note/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View className="items-center gap-3 pt-16">
              <SearchIcon size={40} color={colors.tertiary} />
              <Text
                className="text-muted-foreground"
                style={{ fontFamily: "Inter_400Regular", fontSize: 14 }}
              >
                No notes found
              </Text>
            </View>
          }
        />
      )}

      {!hasFilter && (
        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
          <View className="items-center gap-3">
            <View className="w-20 h-20 rounded-full bg-accent-surface items-center justify-center">
              <SearchIcon size={32} color={colors.accent} />
            </View>
            <Text
              className="text-muted-foreground"
              style={{ fontFamily: "Inter_500Medium", fontSize: 15 }}
            >
              Search your notes
            </Text>
            <Text
              className="text-tertiary"
              style={{ fontFamily: "Inter_400Regular", fontSize: 13 }}
            >
              Find by title, content, or keyword
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
