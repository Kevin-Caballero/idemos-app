import { PropsWithChildren, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? "light";

  const rotation = useSharedValue(0);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  function handlePress() {
    setIsOpen((prev) => {
      const next = !prev;
      rotation.value = withTiming(next ? 90 : 0, { duration: 200 });
      return next;
    });
  }

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Animated.View style={chevronStyle}>
          <IconSymbol
            name="chevron.right"
            size={18}
            weight="medium"
            color={theme === "light" ? Colors.light.icon : Colors.dark.icon}
          />
        </Animated.View>

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.content}
        >
          {children}
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
