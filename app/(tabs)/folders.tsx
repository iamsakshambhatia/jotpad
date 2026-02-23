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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 24, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => refetch()}
            tintColor={colors.accent}
          />
        }
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingTop: 16,
          }}
        >
          <Text
            style={{
              fontFamily: "Outfit_800ExtraBold",
              fontSize: 26,
              letterSpacing: -0.5,
              color: colors.foreground,
            }}
          >
            Folders
          </Text>
          <Pressable
            onPress={() => setShowInput(!showInput)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: colors.accentSurface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={20} color={colors.accent} />
          </Pressable>
        </View>

        {/* New Folder Input */}
        {showInput && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 24 }}>
            <TextInput
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="Folder name"
              placeholderTextColor={colors.tertiary}
              autoFocus
              onSubmitEditing={handleCreateFolder}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 16,
                backgroundColor: colors.input,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                paddingHorizontal: 16,
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: colors.foreground,
              }}
            />
            <Pressable
              onPress={handleCreateFolder}
              style={{
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 14,
                backgroundColor: colors.accent,
                height: 48,
                paddingHorizontal: 20,
              }}
            >
              <Text
                style={{
                  fontFamily: "Outfit_600SemiBold",
                  fontSize: 14,
                  color: "#FFFFFF",
                }}
              >
                Add
              </Text>
            </Pressable>
          </View>
        )}

        {/* Folders List */}
        <View style={{ paddingHorizontal: 24 }}>
          {isLoading ? (
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
                  {index > 0 && (
                    <View
                      style={{ height: 1, backgroundColor: colors.borderSubtle, marginHorizontal: 16 }}
                    />
                  )}
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
                <View style={{ alignItems: "center", gap: 12, paddingVertical: 40 }}>
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: colors.accentSurface,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Folder size={28} color={colors.accent} />
                  </View>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: colors.mutedForeground,
                    }}
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
