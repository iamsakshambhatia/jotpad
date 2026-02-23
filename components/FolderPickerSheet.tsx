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
      <Pressable className="flex-1" onPress={onClose}>
        <View className="flex-1 justify-end">
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              className="bg-card rounded-t-3xl max-h-[400px]"
              style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
              {/* Drag handle */}
              <View className="items-center pt-3 pb-2">
                <View className="w-9 h-[5px] rounded-sm bg-tertiary opacity-40" />
              </View>

              {/* Header */}
              <View className="flex-row items-center justify-between px-5 pb-4">
                <Text
                  className="text-foreground"
                  style={{ fontFamily: "Outfit_700Bold", fontSize: 18, letterSpacing: -0.3 }}
                >
                  Move to Folder
                </Text>
                <Pressable onPress={onClose} className="p-1">
                  <X size={20} color={colors.mutedForeground} />
                </Pressable>
              </View>

              <View className="h-px bg-border-subtle" />

              {/* Folder list */}
              <ScrollView className="max-h-[300px]" showsVerticalScrollIndicator={false}>
                {folders.map((folder) => {
                  const isSelected = selectedFolderId === folder.id;
                  return (
                    <Pressable
                      key={folder.id}
                      onPress={() => onSelect(folder.id)}
                      className="flex-row items-center gap-3 px-5 py-3.5"
                      style={({ pressed }) => ({
                        backgroundColor: isSelected ? colors.accentSurface : "transparent",
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <FolderIcon
                        size={20}
                        color={isSelected ? colors.accent : colors.mutedForeground}
                      />
                      <Text
                        className="flex-1"
                        style={{
                          fontFamily: isSelected ? "Outfit_600SemiBold" : "Inter_400Regular",
                          fontSize: 15,
                          color: isSelected ? colors.accent : colors.foreground,
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
