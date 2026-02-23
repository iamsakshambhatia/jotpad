import { FAB } from "@/components/FAB";
import { FolderItem } from "@/components/FolderItem";
import { NoteCard } from "@/components/NoteCard";
import { SearchBar } from "@/components/SearchBar";
import { StatCard } from "@/components/StatCard";
import { useCreateFolder, useFolders } from "@/lib/api/folders";
import { useNotes, useRecentNotes } from "@/lib/api/notes";
import { syncEngine } from "@/lib/sync/sync-engine";
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
          syncEngine.triggerSync();
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
    await syncEngine.triggerSync();
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 28, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-3">
            <View className="gap-0.5">
              <Text
                className="text-muted-foreground"
                style={{ fontFamily: "Inter_500Medium", fontSize: 13 }}
              >
                {getGreeting()}
              </Text>
              <Text
                className="text-foreground"
                style={{ fontFamily: "Outfit_900Black", fontSize: 28, letterSpacing: -1 }}
              >
                Jotpad
              </Text>
            </View>

            <Pressable className="items-center justify-center rounded-[22px] bg-card border border-border-subtle w-11 h-11">
              <Bell size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View className="px-6">
            <SearchBar onPress={() => router.push("/(tabs)/search")} />
          </View>

          {/* Stats */}
          <View className="flex-row gap-3 px-6">
            <StatCard value={allNotes?.length ?? 0} label="Notes" />
            <StatCard value={folders?.length ?? 0} label="Folders" />
            <StatCard value={favNotes?.length ?? 0} label="Favorites" />
          </View>

          {/* Recent Notes Section */}
          <View className="gap-4 px-6">
            <View className="flex-row items-center justify-between">
              <Text
                className="text-foreground"
                style={{ fontFamily: "Outfit_700Bold", fontSize: 18, letterSpacing: -0.3 }}
              >
                Recent Notes
              </Text>
              <Pressable onPress={() => router.push({ pathname: "/(tabs)/search", params: { show_all: "true" } })}>
                <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: colors.accent }}>
                  View all
                </Text>
              </Pressable>
            </View>

            {notesLoading ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <View className="gap-3">
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
                  <View className="items-center gap-2 py-10 rounded-[20px] bg-card border border-border-subtle">
                    <Text
                      className="text-muted-foreground"
                      style={{ fontFamily: "Inter_400Regular", fontSize: 14 }}
                    >
                      No notes yet. Tap + to create one.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Folders Section */}
          <View className="gap-4 px-6">
            <View className="flex-row items-center justify-between">
              <Text
                className="text-foreground"
                style={{ fontFamily: "Outfit_700Bold", fontSize: 18, letterSpacing: -0.3 }}
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
              <View className="overflow-hidden rounded-[20px] bg-card border border-border-subtle">
                {folders?.map((folder, index) => (
                  <View key={folder.id}>
                    {index > 0 && <View className="h-px bg-border-subtle mx-4" />}
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
                  <View className="items-center gap-2 py-8">
                    <Text
                      className="text-muted-foreground"
                      style={{ fontFamily: "Inter_400Regular", fontSize: 14 }}
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
