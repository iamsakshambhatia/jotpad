import { useColors } from "@/lib/theme";
import type { Folder } from "@/lib/types";
import { Check, Folder as FolderIcon, X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FolderPickerSheetProps {
  visible: boolean;
  folders: Folder[];
  selectedFolderId: string | null;
  onSelect: (folderId: string) => void;
  onClose: () => void;
}

export function FolderPickerSheet({
  visible,
  folders,
  selectedFolderId,
  onSelect,
  onClose,
}: FolderPickerSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1 }} onPress={onClose}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: Math.max(insets.bottom, 16),
                maxHeight: 400,
              }}
            >
              {/* Drag handle */}
              <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
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

              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Outfit_700Bold",
                    fontSize: 18,
                    letterSpacing: -0.3,
                    color: colors.foreground,
                  }}
                >
                  Move to Folder
                </Text>
                <Pressable onPress={onClose} style={{ padding: 4 }}>
                  <X size={20} color={colors.mutedForeground} />
                </Pressable>
              </View>

              <View style={{ height: 1, backgroundColor: colors.borderSubtle }} />

              {/* Folder list */}
              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                {folders.map((folder) => {
                  const isSelected = selectedFolderId === folder.id;
                  return (
                    <Pressable
                      key={folder.id}
                      onPress={() => onSelect(folder.id)}
                      style={({ pressed }) => ({
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        paddingHorizontal: 20,
                        paddingVertical: 14,
                        backgroundColor: isSelected ? colors.accentSurface : "transparent",
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <FolderIcon
                        size={20}
                        color={isSelected ? colors.accent : colors.mutedForeground}
                      />
                      <Text
                        style={{
                          fontFamily: isSelected ? "Outfit_600SemiBold" : "Inter_400Regular",
                          fontSize: 15,
                          color: isSelected ? colors.accent : colors.foreground,
                          flex: 1,
                        }}
                      >
                        {folder.name}
                      </Text>
                      {isSelected && <Check size={18} color={colors.accent} strokeWidth={2.5} />}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
