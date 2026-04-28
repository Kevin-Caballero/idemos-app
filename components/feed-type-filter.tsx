import { View, Pressable, StyleSheet } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import type { InitiativeType } from "@/hooks/use-feed";
import { BrandColors } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type FilterOption = { label: string; value: InitiativeType | undefined };

const OPTIONS: FilterOption[] = [
  { label: "Todos", value: undefined },
  { label: "Proyectos", value: "Proyecto" },
  { label: "Proposiciones", value: "Proposicion" },
];

interface FeedTypeFilterProps {
  selected: InitiativeType | undefined;
  onSelect: (type: InitiativeType | undefined) => void;
}

function FilterPill({
  opt,
  active,
  onSelect,
}: {
  opt: FilterOption;
  active: boolean;
  onSelect: (v: FilterOption["value"]) => void;
}) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 200 });
  }, [active]);

  const pillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["transparent", BrandColors.secondary],
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [BrandColors.primary, BrandColors.secondary],
    ),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [BrandColors.primary, "#ffffff"],
    ),
  }));

  return (
    <AnimatedPressable
      onPress={() => onSelect(opt.value)}
      style={[styles.pill, pillStyle]}
    >
      <Animated.Text style={[styles.label, labelStyle]}>
        {opt.label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

export function FeedTypeFilter({ selected, onSelect }: FeedTypeFilterProps) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => (
        <FilterPill
          key={opt.label}
          opt={opt}
          active={selected === opt.value}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "600",
    includeFontPadding: false,
  },
});
