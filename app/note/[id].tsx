import { useNote, useCreateNote, useUpdateNote } from "@/lib/api/notes";
import { useFolders } from "@/lib/api/folders";
import { useColors } from "@/lib/theme";
import { useThemeStore } from "@/lib/store/theme-store";
import { FolderPickerSheet } from "@/components/FolderPickerSheet";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  EllipsisVertical,
  Folder,
  Heart,
  Image,
  Link,
  List,
  ListOrdered,
  SquareCheck,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FONT_SIZE_MAP = { small: 14, medium: 15, large: 17 } as const;

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const fontSize = useThemeStore((state) => state.fontSize);

  const { data: note, isLoading } = useNote({
    variables: { id: id! },
    enabled: !isNew,
  });

  const { data: folders } = useFolders();
  const updateNote = useUpdateNote();
  const createNote = useCreateNote();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitialized = useRef(false);
  const contentRef = useRef<TextInput>(null);

  useEffect(() => {
    if (note && !hasInitialized.current) {
      setTitle(note.title);
      setContent(note.content ?? "");
      setIsFavorite(note.is_favorite);
      setSelectedFolderId(note.folder_id);
      hasInitialized.current = true;
    }
  }, [note]);

  // Set default folder for new notes
  useEffect(() => {
    if (isNew && folders && folders.length > 0 && !selectedFolderId) {
      setSelectedFolderId(folders[0].id);
    }
  }, [isNew, folders, selectedFolderId]);

  const autoSave = (newTitle: string, newContent: string) => {
    if (isNew || !note) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      updateNote.mutate(
        { id: note.id, title: newTitle, content: newContent },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes"] });
          },
        }
      );
    }, 1000);
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    autoSave(text, content);
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    autoSave(title, text);
  };

  const toggleFavorite = () => {
    if (isNew || !note) return;
    const newFav = !isFavorite;
    setIsFavorite(newFav);
    updateNote.mutate(
      { id: note.id, is_favorite: newFav },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["notes"] });
        },
      }
    );
  };

  const changeFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
    setShowFolderPicker(false);
    if (!isNew && note) {
      updateNote.mutate(
        { id: note.id, folder_id: folderId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes"] });
            queryClient.invalidateQueries({ queryKey: ["folders"] });
          },
        }
      );
    }
  };

  const insertFormatting = (prefix: string, suffix: string) => {
    const before = content.slice(0, selection.start);
    const selected = content.slice(selection.start, selection.end);
    const after = content.slice(selection.end);
    const replacement = selected.length > 0 ? `${prefix}${selected}${suffix}` : `${prefix}${suffix}`;
    const newContent = before + replacement + after;
    setContent(newContent);
    autoSave(title, newContent);
  };

  const insertPrefix = (prefix: string) => {
    const before = content.slice(0, selection.start);
    const lineStart = before.lastIndexOf("\n") + 1;
    const newContent = content.slice(0, lineStart) + prefix + content.slice(lineStart);
    setContent(newContent);
    autoSave(title, newContent);
  };

  const handleSaveNew = () => {
    if (!title.trim()) {
      Toast.show({ type: "error", text1: "Title is required" });
      return;
    }
    if (!selectedFolderId) {
      Toast.show({ type: "error", text1: "Create a folder first" });
      return;
    }

    createNote.mutate(
      {
        title: title.trim(),
        content,
        folder_id: selectedFolderId,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["notes"] });
          queryClient.invalidateQueries({ queryKey: ["folders"] });
          Toast.show({ type: "success", text1: "Note created" });
          router.back();
        },
        onError: () => {
          Toast.show({ type: "error", text1: "Failed to create note" });
        },
      }
    );
  };

  if (!isNew && isLoading) {
    return (
      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const selectedFolderName = folders?.find((f) => f.id === selectedFolderId)?.name ?? note?.folder?.name ?? "Uncategorized";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Drag Handle */}
        <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 4 }}>
          <View
            style={{
              width: 36,
              height: 5,
              borderRadius: 3,
              backgroundColor: colors.tertiary,
              opacity: 0.4,
            }}
          />
        </View>

        {/* Nav Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <ArrowLeft size={22} color={colors.foreground} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 15,
                color: colors.foreground,
              }}
            >
              Back
            </Text>
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            {isNew ? (
              <Pressable
                onPress={handleSaveNew}
                disabled={createNote.isPending}
                style={({ pressed }) => ({
                  backgroundColor: colors.accent,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  style={{
                    fontFamily: "Outfit_700Bold",
                    fontSize: 14,
                    color: "#FFFFFF",
                  }}
                >
                  {createNote.isPending ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            ) : (
              <>
                <Pressable onPress={toggleFavorite}>
                  <Heart
                    size={22}
                    color={isFavorite ? colors.destructive : colors.mutedForeground}
                    fill={isFavorite ? colors.destructive : "none"}
                  />
                </Pressable>
                <Pressable>
                  <EllipsisVertical size={22} color={colors.mutedForeground} />
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Meta Info Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            paddingHorizontal: 24,
            paddingVertical: 8,
          }}
        >
          {!isNew && note && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Calendar size={13} color={colors.tertiary} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: colors.tertiary,
                }}
              >
                {format(new Date(note.updated_at), "MMM d, yyyy")}
              </Text>
            </View>
          )}
          <Pressable
            onPress={() => setShowFolderPicker(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: colors.accentSurface,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 12,
            }}
          >
            <Folder size={13} color={colors.accent} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 12,
                color: colors.accent,
              }}
            >
              {selectedFolderName}
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginHorizontal: 24 }} />

        {/* Editor Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, paddingTop: 16, gap: 12 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            value={title}
            onChangeText={handleTitleChange}
            placeholder="Note title"
            placeholderTextColor={colors.tertiary}
            style={{
              fontFamily: "Outfit_800ExtraBold",
              fontSize: 24,
              letterSpacing: -0.5,
              color: colors.foreground,
            }}
            multiline
          />

          <TextInput
            ref={contentRef}
            value={content}
            onChangeText={handleContentChange}
            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
            placeholder="Start writing..."
            placeholderTextColor={colors.tertiary}
            multiline
            textAlignVertical="top"
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: FONT_SIZE_MAP[fontSize],
              lineHeight: FONT_SIZE_MAP[fontSize] * 1.7,
              color: colors.foreground,
              minHeight: 300,
            }}
          />
        </ScrollView>

        {/* Formatting Toolbar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 18,
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.borderSubtle,
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 10 + insets.bottom,
          }}
        >
          <Pressable onPress={() => insertFormatting("**", "**")}>
            <Text
              style={{
                fontFamily: "Outfit_800ExtraBold",
                fontSize: 17,
                color: colors.foreground,
              }}
            >
              B
            </Text>
          </Pressable>
          <Pressable onPress={() => insertFormatting("*", "*")}>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 17,
                fontStyle: "italic",
                color: colors.mutedForeground,
              }}
            >
              I
            </Text>
          </Pressable>
          <Pressable onPress={() => insertFormatting("__", "__")}>
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 17,
                textDecorationLine: "underline",
                color: colors.mutedForeground,
              }}
            >
              U
            </Text>
          </Pressable>
          <Pressable onPress={() => insertFormatting("~~", "~~")}>
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 17,
                textDecorationLine: "line-through",
                color: colors.mutedForeground,
              }}
            >
              S
            </Text>
          </Pressable>

          <View style={{ width: 1, height: 20, backgroundColor: colors.borderSubtle }} />

          <Pressable onPress={() => insertPrefix("- ")}>
            <List size={19} color={colors.mutedForeground} />
          </Pressable>
          <Pressable onPress={() => insertPrefix("1. ")}>
            <ListOrdered size={19} color={colors.mutedForeground} />
          </Pressable>
          <Pressable onPress={() => insertPrefix("- [ ] ")}>
            <SquareCheck size={19} color={colors.mutedForeground} />
          </Pressable>

          <View style={{ width: 1, height: 20, backgroundColor: colors.borderSubtle }} />

          <Pressable onPress={() => insertFormatting("[", "](url)")}>
            <Link size={19} color={colors.mutedForeground} />
          </Pressable>
          <Pressable onPress={() => insertFormatting("![alt](", ")")}>
            <Image size={19} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Folder Picker Sheet */}
      {folders && (
        <FolderPickerSheet
          visible={showFolderPicker}
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelect={changeFolder}
          onClose={() => setShowFolderPicker(false)}
        />
      )}
    </View>
  );
}
