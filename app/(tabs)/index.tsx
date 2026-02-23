import { FAB } from "@/components/FAB";
import { FolderItem } from "@/components/FolderItem";
import { NoteCard } from "@/components/NoteCard";
import { SearchBar } from "@/components/SearchBar";
import { StatCard } from "@/components/StatCard";
import { useCreateFolder, useFolders } from "@/lib/api/folders";
import { useNotes, useRecentNotes } from "@/lib/api/notes";
import { useColors } from "@/lib/theme";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { Bell, Briefcase, Folder, Lightbulb, Plus, User } from "lucide-react-native";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { InputDialog } from "@/components/InputDialog";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

const FOLDER_ICONS: Record<string, typeof Folder> = {
  Work: Folder,
  Projects: Briefcase,
  Personal: User,
  Ideas: Lightbulb,
};

function getFolderIcon(name: string) {
  return FOLDER_ICONS[name] ?? Folder;
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const createFolder = useCreateFolder();
  const [showNewFolder, setShowNewFolder] = useState(false);

  const handleCreateFolder = (name: string) => {
    createFolder.mutate(
      { name },
      {
        onSuccess: () => {
          setShowNewFolder(false);
          queryClient.invalidateQueries({ queryKey: ["folders"] });
          Toast.show({ type: "success", text1: "Folder created" });
        },
        onError: () => {
          Toast.show({ type: "error", text1: "Failed to create folder" });
        },
      }
    );
  };

  const { data: recentNotes, isLoading: notesLoading } = useRecentNotes();
  const { data: folders, isLoading: foldersLoading } = useFolders();
  const { data: allNotes } = useNotes({ variables: { limit: 100 } });
  const { data: favNotes } = useNotes({ variables: { favorite: true, limit: 100 } });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 28, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 24,
              paddingTop: 12,
            }}
          >
            <View style={{ gap: 2 }}>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                  color: colors.mutedForeground,
                }}
              >
                {getGreeting()}
              </Text>
              <Text
                style={{
                  fontFamily: "Outfit_900Black",
                  fontSize: 28,
                  letterSpacing: -1,
                  color: colors.foreground,
                }}
              >
                Jotpad
              </Text>
            </View>

            <Pressable
              style={{
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 22,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                width: 44,
                height: 44,
              }}
            >
              <Bell size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={{ paddingHorizontal: 24 }}>
            <SearchBar onPress={() => router.push("/(tabs)/search")} />
          </View>

          {/* Stats */}
          <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 24 }}>
            <StatCard value={allNotes?.length ?? 0} label="Notes" />
            <StatCard value={folders?.length ?? 0} label="Folders" />
            <StatCard value={favNotes?.length ?? 0} label="Favorites" />
          </View>

          {/* Recent Notes Section */}
          <View style={{ gap: 16, paddingHorizontal: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text
                style={{
                  fontFamily: "Outfit_700Bold",
                  fontSize: 18,
                  letterSpacing: -0.3,
                  color: colors.foreground,
                }}
              >
                Recent Notes
              </Text>
              <Pressable onPress={() => router.push({ pathname: "/(tabs)/search", params: { show_all: "true" } })}>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                    color: colors.accent,
                  }}
                >
                  View all
                </Text>
              </Pressable>
            </View>

            {notesLoading ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <View style={{ gap: 12 }}>
                {recentNotes?.map((note) => (
                  <NoteCard
                    key={note.id}
                    title={note.title}
                    preview={note.preview}
                    date={format(new Date(note.updated_at), "MMM d, yyyy")}
                    folderName={note.folder?.name ?? "Uncategorized"}
                    isFavorite={note.is_favorite}
                    onPress={() => router.push(`/note/${note.id}`)}
                  />
                ))}
                {recentNotes?.length === 0 && (
                  <View
                    style={{
                      alignItems: "center",
                      gap: 8,
                      paddingVertical: 40,
                      borderRadius: 20,
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: colors.borderSubtle,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: colors.mutedForeground,
                      }}
                    >
                      No notes yet. Tap + to create one.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Folders Section */}
          <View style={{ gap: 16, paddingHorizontal: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text
                style={{
                  fontFamily: "Outfit_700Bold",
                  fontSize: 18,
                  letterSpacing: -0.3,
                  color: colors.foreground,
                }}
              >
                Folders
              </Text>
              <Pressable onPress={() => setShowNewFolder(true)}>
                <Plus size={20} color={colors.accent} />
              </Pressable>
            </View>

            {foldersLoading ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <View
                style={{
                  overflow: "hidden",
                  borderRadius: 20,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.borderSubtle,
                }}
              >
                {folders?.map((folder, index) => (
                  <View key={folder.id}>
                    {index > 0 && <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginHorizontal: 16 }} />}
                    <FolderItem
                      name={folder.name}
                      count={allNotes?.filter((n) => n.folder_id === folder.id).length ?? 0}
                      icon={getFolderIcon(folder.name)}
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/search",
                          params: { folder_id: folder.id },
                        })
                      }
                    />
                  </View>
                ))}
                {folders?.length === 0 && (
                  <View style={{ alignItems: "center", gap: 8, paddingVertical: 32 }}>
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: colors.mutedForeground,
                      }}
                    >
                      No folders yet
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        <FAB onPress={() => router.push("/note/new")} />
      </View>

      <InputDialog
        visible={showNewFolder}
        title="New Folder"
        placeholder="Folder name"
        submitLabel="Create"
        onSubmit={handleCreateFolder}
        onCancel={() => setShowNewFolder(false)}
      />
    </View>
  );
}
