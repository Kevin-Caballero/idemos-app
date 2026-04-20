import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInDown,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import type { Initiative, InitiativeType } from "@/hooks/use-feed";
import { BrandColors } from "@/constants/theme";
import { useVoteStore } from "@/store/vote.store";

type TypeConfig = {
  label: string;
  accentColor: string;
  gradientStart: string;
  badgeBg: string;
  badgeText: string;
};

const ALPHA_GRADIENT = "38";
const ALPHA_BADGE = "24";

const TYPE_CONFIG: Record<InitiativeType, TypeConfig> = {
  Proyecto: {
    label: "Proyecto",
    accentColor: BrandColors.primary,
    gradientStart: BrandColors.primary + ALPHA_GRADIENT,
    badgeBg: BrandColors.primary + ALPHA_BADGE,
    badgeText: BrandColors.primary,
  },
  Proposicion: {
    label: "Proposición",
    accentColor: BrandColors.secondary,
    gradientStart: BrandColors.secondary + ALPHA_GRADIENT,
    badgeBg: BrandColors.secondary + ALPHA_BADGE,
    badgeText: BrandColors.secondary,
  },
};

type StatusStyle = { dot: string; bg: string; text: string };

function getStatusStyle(status: string): StatusStyle {
  const s = status.toLowerCase();
  if (
    s.includes("aprobad") ||
    s.includes("publicad") ||
    s.includes("promulgad")
  ) {
    return {
      dot: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      text: "#059669",
    };
  }
  if (
    s.includes("rechazad") ||
    s.includes("caducad") ||
    s.includes("retirad") ||
    s.includes("inadmitid")
  ) {
    return {
      dot: "#ef4444",
      bg: "rgba(239,68,68,0.12)",
      text: "#dc2626",
    };
  }
  if (
    s.includes("comisión") ||
    s.includes("ponencia") ||
    s.includes("tramit") ||
    s.includes("debate")
  ) {
    return {
      dot: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
      text: "#d97706",
    };
  }
  return {
    dot: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    text: "#7c3aed",
  };
}

interface InitiativeCardProps {
  initiative: Initiative;
  onPress?: () => void;
  index?: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const VOTE_BADGE: Record<string, { label: string; color: string }> = {
  SI: { label: "Votado: Sí", color: "#10b981" },
  NO: { label: "Votado: No", color: "#ef4444" },
  ABST: { label: "Votado: Abstención", color: "#8b5cf6" },
};

export function InitiativeCard({
  initiative,
  onPress,
  index = 0,
}: InitiativeCardProps) {
  const router = useRouter();
  const config = TYPE_CONFIG[initiative.type] ?? TYPE_CONFIG.Proyecto;
  const statusStyle = getStatusStyle(initiative.currentStatus);
  const optimisticChoice = useVoteStore(
    (s) => s.optimisticVotes[initiative.id],
  );
  const votedChoice = optimisticChoice ?? initiative.votedChoice ?? null;

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress =
    onPress ?? (() => router.push(`/initiative/${initiative.id}`));

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 60, 400)).duration(300)}
      className="mx-4 mb-3"
    >
      <Pressable
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 100 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 150 });
        }}
      >
        <Animated.View style={animatedStyle}>
          <View
            className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900"
            style={{
              shadowColor: config.accentColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            <View style={{ height: 3, backgroundColor: config.accentColor }} />

            <LinearGradient
              colors={[config.gradientStart, "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0.6 }}
              className="p-4"
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: config.badgeBg }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: config.badgeText }}
                    >
                      {config.label}
                    </Text>
                  </View>
                  {votedChoice && (
                    <View
                      className="flex-row items-center gap-1 rounded-full px-2 py-0.5"
                      style={{
                        backgroundColor: VOTE_BADGE[votedChoice].color + "20",
                      }}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={11}
                        color={VOTE_BADGE[votedChoice].color}
                      />
                      <Text
                        className="text-xs font-medium"
                        style={{ color: VOTE_BADGE[votedChoice].color }}
                      >
                        {VOTE_BADGE[votedChoice].label}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-neutral-400 dark:text-neutral-500">
                  {initiative.expediente}
                </Text>
              </View>

              <Text
                className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100 mb-3"
                style={{ lineHeight: 22 }}
                numberOfLines={3}
              >
                {initiative.title}
              </Text>

              <View className="flex-row items-center gap-1.5 mb-4">
                <Ionicons name="person-outline" size={12} color="#a3a3a3" />
                <Text
                  className="text-xs text-neutral-400 dark:text-neutral-500 flex-1"
                  numberOfLines={1}
                >
                  {initiative.author}
                </Text>
              </View>

              <View className="h-px bg-neutral-100 dark:bg-neutral-800 mb-3" />

              <View className="flex-row items-center justify-between">
                <View
                  className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
                  style={{
                    backgroundColor: statusStyle.bg,
                    maxWidth: "68%",
                  }}
                >
                  <View
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: statusStyle.dot }}
                  />
                  <Text
                    className="text-xs font-medium"
                    style={{ color: statusStyle.text }}
                    numberOfLines={1}
                  >
                    {initiative.currentStatus}
                  </Text>
                </View>

                <View className="flex-row items-center gap-1">
                  <Ionicons name="calendar-outline" size={11} color="#a3a3a3" />
                  <Text className="text-xs text-neutral-400 dark:text-neutral-500">
                    {formatDate(initiative.presentedAt)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
