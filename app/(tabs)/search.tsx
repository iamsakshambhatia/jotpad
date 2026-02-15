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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, gap: 24, paddingHorizontal: 24, paddingTop: 16 }}>
        <Text
          style={{
            fontFamily: "Outfit_900Black",
            fontSize: 32,
            letterSpacing: -1,
            color: colors.foreground,
          }}
        >
          {folderName ?? (show_all === "true" ? "All Notes" : "Search")}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            borderRadius: 24,
            backgroundColor: colors.card,
            paddingHorizontal: 16,
            height: 48,
          }}
        >
          <SearchIcon size={18} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={folderName ? `Search in ${folderName}...` : "Search your notes..."}
            placeholderTextColor={colors.mutedForeground}
            style={{
              flex: 1,
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: colors.foreground,
            }}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <X size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {isLoading && hasFilter && (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color={colors.accent} />
          </View>
        )}

        {!isLoading && hasFilter && notes && (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <NoteCard
                title={item.title}
                preview={item.preview}
                date={format(new Date(item.updated_at), "MMM d, yyyy")}
                folderName={item.folder?.name ?? "Uncategorized"}
                onPress={() => router.push(`/note/${item.id}`)}
              />
            )}
            ListEmptyComponent={
              <View style={{ alignItems: "center", gap: 8, paddingTop: 64 }}>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: colors.mutedForeground,
                  }}
                >
                  No notes found
                </Text>
              </View>
            }
          />
        )}

        {!hasFilter && (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
            <SearchIcon size={48} color={colors.mutedForeground} />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: colors.mutedForeground,
              }}
            >
              Search your notes
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
