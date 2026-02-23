import { FolderItem } from "@/components/FolderItem";
import { useCreateFolder, useFolders, useDeleteFolder } from "@/lib/api/folders";
import { useNotes } from "@/lib/api/notes";
import { useColors } from "@/lib/theme";
import { useRouter } from "expo-router";
import { Briefcase, Folder, Lightbulb, Plus, User } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

const FOLDER_ICONS: Record<string, typeof Folder> = {
  Work: Folder,
  Projects: Briefcase,
  Personal: User,
  Ideas: Lightbulb,
};

function getFolderIcon(name: string) {
  return FOLDER_ICONS[name] ?? Folder;
}

export default function FoldersScreen() {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: folders, isLoading, refetch } = useFolders();
  const { data: allNotes } = useNotes({ variables: { limit: 100 } });
  const createFolder = useCreateFolder();
  const deleteFolder = useDeleteFolder();

  const [showInput, setShowInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const folderNoteCounts = (folderId: string) =>
    allNotes?.filter((n) => n.folder_id === folderId).length ?? 0;

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder.mutate(
      { name: newFolderName.trim() },
      {
        onSuccess: () => {
          setNewFolderName("");
          setShowInput(false);
          queryClient.invalidateQueries({ queryKey: ["folders"] });
          Toast.show({ type: "success", text1: "Folder created" });
        },
        onError: () => {
          Toast.show({ type: "error", text1: "Failed to create folder" });
        },
      }
    );
  };

  const handleDeleteFolder = (id: string, name: string) => {
    Alert.alert("Delete Folder", `Delete "${name}" and all its notes?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteFolder.mutate(
            { id },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["folders"] });
                queryClient.invalidateQueries({ queryKey: ["notes"] });
                Toast.show({ type: "success", text1: "Folder deleted" });
              },
            }
          );
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 24, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => refetch()} tintColor={colors.accent} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4">
          <Text
            className="text-foreground"
            style={{ fontFamily: "Outfit_800ExtraBold", fontSize: 26, letterSpacing: -0.5 }}
          >
            Folders
          </Text>
          <Pressable
            onPress={() => setShowInput(!showInput)}
            className="w-9 h-9 rounded-xl bg-accent-surface items-center justify-center"
          >
            <Plus size={20} color={colors.accent} />
          </Pressable>
        </View>

        {/* New Folder Input */}
        {showInput && (
          <View className="flex-row items-center gap-3 px-6">
            <TextInput
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="Folder name"
              placeholderTextColor={colors.tertiary}
              autoFocus
              onSubmitEditing={handleCreateFolder}
              className="flex-1 h-12 rounded-2xl bg-input border border-border-subtle px-4 text-foreground"
              style={{ fontFamily: "Inter_400Regular", fontSize: 14 }}
            />
            <Pressable
              onPress={handleCreateFolder}
              className="items-center justify-center rounded-[14px] h-12 px-5"
              style={{ backgroundColor: colors.accent }}
            >
              <Text style={{ fontFamily: "Outfit_600SemiBold", fontSize: 14, color: "#FFFFFF" }}>
                Add
              </Text>
            </Pressable>
          </View>
        )}

        {/* Folders List */}
        <View className="px-6">
          {isLoading ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <View className="overflow-hidden rounded-[20px] bg-card border border-border-subtle">
              {folders?.map((folder, index) => (
                <View key={folder.id}>
                  {index > 0 && <View className="h-px bg-border-subtle mx-4" />}
                  <FolderItem
                    name={folder.name}
                    count={folderNoteCounts(folder.id)}
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
                <View className="items-center gap-3 py-10">
                  <View className="w-16 h-16 rounded-full bg-accent-surface items-center justify-center">
                    <Folder size={28} color={colors.accent} />
                  </View>
                  <Text
                    className="text-muted-foreground"
                    style={{ fontFamily: "Inter_400Regular", fontSize: 14 }}
                  >
                    No folders yet. Tap + to create one.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
