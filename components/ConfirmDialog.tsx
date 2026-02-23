import { useColors } from "@/lib/theme";
import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Delete",
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const colors = useColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 20,
          stiffness: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <Animated.View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
          opacity: fadeAnim,
        }}
      >
        <Pressable
          className="absolute top-0 left-0 right-0 bottom-0"
          onPress={onCancel}
        />
        <Animated.View
          style={{
            width: "85%",
            maxWidth: 340,
            borderRadius: 20,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            padding: 24,
            gap: 16,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Text
            className="text-foreground text-center"
            style={{ fontFamily: "Outfit_700Bold", fontSize: 18 }}
          >
            {title}
          </Text>

          <Text
            className="text-muted-foreground text-center"
            style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 }}
          >
            {message}
          </Text>

          <View className="flex-row gap-3 pt-1">
            <Pressable
              onPress={onCancel}
              className="flex-1 h-11 rounded-xl bg-background items-center justify-center"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text
                className="text-muted-foreground"
                style={{ fontFamily: "Outfit_600SemiBold", fontSize: 15 }}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              className="flex-1 h-11 rounded-xl items-center justify-center"
              style={({ pressed }) => ({
                backgroundColor: destructive ? colors.destructive : colors.accent,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text
                style={{
                  fontFamily: "Outfit_600SemiBold",
                  fontSize: 15,
                  color: "#FFFFFF",
                }}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
