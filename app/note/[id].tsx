import { useNote, useCreateNote, useUpdateNote } from "@/lib/api/notes";
import { useFolders } from "@/lib/api/folders";
import { useColors } from "@/lib/theme";
import { useThemeStore } from "@/lib/store/theme-store";
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
    if (!isNew && note) {
      updateNote.mutate(
        { id: note.id, folder_id: folderId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes"] });
            queryClient.invalidateQueries({ queryKey: ["folders"] });
            setShowFolderPicker(false);
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
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
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Text
                  style={{
                    fontFamily: "Outfit_700Bold",
                    fontSize: 15,
                    color: colors.accent,
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
                    color={isFavorite ? "#EF4444" : colors.mutedForeground}
                    fill={isFavorite ? "#EF4444" : "none"}
                  />
                </Pressable>
                <Pressable>
                  <EllipsisVertical size={22} color={colors.foreground} />
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Folder Picker */}
        {(isNew || showFolderPicker) && folders && folders.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 24, paddingVertical: 8 }}
          >
            {folders.map((folder) => {
              const isSelected = selectedFolderId === folder.id;
              return (
                <Pressable
                  key={folder.id}
                  onPress={() => isNew ? setSelectedFolderId(folder.id) : changeFolder(folder.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isSelected ? colors.accent : colors.card,
                  }}
                >
                  <Folder size={14} color={isSelected ? colors.accentForeground : colors.mutedForeground} />
                  <Text
                    style={{
                      fontFamily: isSelected ? "Outfit_600SemiBold" : "Inter_400Regular",
                      fontSize: 13,
                      color: isSelected ? colors.accentForeground : colors.foreground,
                    }}
                  >
                    {folder.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* Editor Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            value={title}
            onChangeText={handleTitleChange}
            placeholder="Note title"
            placeholderTextColor={colors.mutedForeground}
            style={{
              fontFamily: "Outfit_800ExtraBold",
              fontSize: 28,
              letterSpacing: -0.5,
              color: colors.foreground,
            }}
            multiline
          />

          {/* Meta Info */}
          {!isNew && note && (
            <View style={{ flexDirection: "row", gap: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Calendar size={14} color={colors.mutedForeground} />
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                    color: colors.mutedForeground,
                  }}
                >
                  {format(new Date(note.updated_at), "MMM d, yyyy")}
                </Text>
              </View>
              <Pressable
                onPress={() => setShowFolderPicker(!showFolderPicker)}
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Folder size={14} color={colors.mutedForeground} />
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                    color: colors.mutedForeground,
                    textDecorationLine: "underline",
                  }}
                >
                  {folders?.find((f) => f.id === selectedFolderId)?.name ?? note.folder?.name ?? "Uncategorized"}
                </Text>
              </Pressable>
            </View>
          )}

          <View style={{ height: 1, backgroundColor: colors.border }} />

          <TextInput
            ref={contentRef}
            value={content}
            onChangeText={handleContentChange}
            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
            placeholder="Start writing..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            textAlignVertical="top"
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: FONT_SIZE_MAP[fontSize],
              lineHeight: FONT_SIZE_MAP[fontSize] * 1.6,
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
            gap: 20,
            backgroundColor: colors.card,
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 12 + insets.bottom,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Pressable onPress={() => insertFormatting("**", "**")}>
            <Text
              style={{
                fontFamily: "Outfit_800ExtraBold",
                fontSize: 18,
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
                fontSize: 18,
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
                fontSize: 18,
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
                fontSize: 18,
                textDecorationLine: "line-through",
                color: colors.mutedForeground,
              }}
            >
              S
            </Text>
          </Pressable>

          <View style={{ width: 1, height: 20, backgroundColor: colors.border }} />

          <Pressable onPress={() => insertPrefix("- ")}>
            <List size={20} color={colors.mutedForeground} />
          </Pressable>
          <Pressable onPress={() => insertPrefix("1. ")}>
            <ListOrdered size={20} color={colors.mutedForeground} />
          </Pressable>
          <Pressable onPress={() => insertPrefix("- [ ] ")}>
            <SquareCheck size={20} color={colors.mutedForeground} />
          </Pressable>

          <View style={{ width: 1, height: 20, backgroundColor: colors.border }} />

          <Pressable onPress={() => insertFormatting("[", "](url)")}>
            <Link size={20} color={colors.mutedForeground} />
          </Pressable>
          <Pressable onPress={() => insertFormatting("![alt](", ")")}>
            <Image size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
