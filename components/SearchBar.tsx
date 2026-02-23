import { useColors } from "@/lib/theme";
import { Search } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, View } from "react-native";

const PHRASES = [
  "Search your notes...",
  "Find a meeting note...",
  "Look up an idea...",
  "Search by keyword...",
];

interface SearchBarProps {
  onPress?: () => void;
}

export function SearchBar({ onPress }: SearchBarProps) {
  const colors = useColors();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const phrase = PHRASES[phraseIndex];

    if (!isDeleting) {
      if (displayText.length < phrase.length) {
        timerRef.current = setTimeout(() => {
          setDisplayText(phrase.slice(0, displayText.length + 1));
        }, 60);
      } else {
        timerRef.current = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (displayText.length > 0) {
        timerRef.current = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 30);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displayText, isDeleting, phraseIndex]);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      <View className="flex-row items-center gap-3 rounded-[26px] bg-input border border-border-subtle px-[18px] h-[50px]">
        <Search size={18} color={colors.tertiary} />
        <Animated.Text
          style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: colors.tertiary, opacity }}
        >
          {displayText}
          <Animated.Text style={{ color: colors.tertiary }}>|</Animated.Text>
        </Animated.Text>
      </View>
    </Pressable>
  );
}
