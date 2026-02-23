import { useColors } from "@/lib/theme";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

interface InputDialogProps {
  visible: boolean;
  title: string;
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export function InputDialog({
  visible,
  title,
  placeholder,
  submitLabel = "Create",
  onSubmit,
  onCancel,
}: InputDialogProps) {
  const colors = useColors();
  const [value, setValue] = useState("");
  const inputRef = useRef<TextInput>(null);
  const submittingRef = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      setValue("");
      submittingRef.current = false;
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
      ]).start(() => {
        inputRef.current?.focus();
      });
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!value.trim() || submittingRef.current) return;
    submittingRef.current = true;
    onSubmit(value.trim());
    setValue("");
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
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
              gap: 20,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <Text
              className="text-foreground text-center"
              style={{ fontFamily: "Outfit_700Bold", fontSize: 18 }}
            >
              {title}
            </Text>

            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={setValue}
              placeholder={placeholder}
              placeholderTextColor={colors.tertiary}
              onSubmitEditing={handleSubmit}
              returnKeyType="done"
              className="h-12 rounded-xl bg-background px-4"
              style={{ fontFamily: "Inter_400Regular", fontSize: 15, color: colors.foreground }}
            />

            <View className="flex-row gap-3">
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
                onPress={handleSubmit}
                className="flex-1 h-11 rounded-xl items-center justify-center"
                style={({ pressed }) => ({
                  backgroundColor: colors.accent,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text
                  style={{
                    fontFamily: "Outfit_600SemiBold",
                    fontSize: 15,
                    color: colors.accentForeground,
                  }}
                >
                  {submitLabel}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
