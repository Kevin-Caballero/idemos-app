import { View, Text, Pressable, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInDown,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { Initiative, InitiativeType } from "@/hooks/use-feed";
import { BrandColors } from "@/constants/theme";
import { useVoteStore } from "@/store/vote.store";

type TypeConfig = {
  label: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
};

const ALPHA_BADGE = "24";

const TYPE_CONFIG: Record<InitiativeType, TypeConfig> = {
  Proyecto: {
    label: "Proyecto",
    accentColor: BrandColors.primary,
    badgeBg: BrandColors.primary + ALPHA_BADGE,
    badgeText: BrandColors.primary,
  },
  Proposicion: {
    label: "Proposición",
    accentColor: BrandColors.secondary,
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

const PARTY_LOGOS: {
  keywords: string[];
  source: number;
  brandColor: string;
  abbreviation: string;
}[] = [
  {
    keywords: ["socialista", "psoe"],
    source: require("@/assets/logos/Partido-Socialista-Obrero-Espanol-Logo.png"),
    brandColor: "#CC0000",
    abbreviation: "PSOE",
  },
  {
    keywords: ["popular"],
    source: require("@/assets/logos/Logo_del_PP_(2022).svg.png"),
    brandColor: "#003EA1",
    abbreviation: "PP",
  },
  {
    keywords: ["sumar"],
    source: require("@/assets/logos/Sumar_logo.svg.png"),
    brandColor: "#E2095B",
    abbreviation: "SUMAR",
  },
  {
    keywords: ["vox"],
    source: require("@/assets/logos/VOX_logo.svg.png"),
    brandColor: "#52AB44",
    abbreviation: "VOX",
  },
  {
    keywords: ["bildu"],
    source: require("@/assets/logos/Logo_de_EH_Bildu_(2023).svg.png"),
    brandColor: "#00BFA5",
    abbreviation: "BILDU",
  },
  {
    keywords: ["junts"],
    source: require("@/assets/logos/Logo_partit_Junts_per_Catalunya.png"),
    brandColor: "#00A99D",
    abbreviation: "JUNTS",
  },
  {
    keywords: ["mixto"],
    source: require("@/assets/logos/Partido-Socialista-Obrero-Espanol-Logo.png"),
    brandColor: "#9E9E9E",
    abbreviation: "MIXTO",
  },
  {
    keywords: ["gobierno", "ejecutivo"],
    source: require("@/assets/logos/Partido-Socialista-Obrero-Espanol-Logo.png"),
    brandColor: "#F5C518",
    abbreviation: "GOB",
  },
  {
    keywords: ["senado", "senador"],
    source: require("@/assets/logos/Partido-Socialista-Obrero-Espanol-Logo.png"),
    brandColor: "#B87333",
    abbreviation: "SEN",
  },
  {
    keywords: ["republicano", "erc", "esquerra"],
    source: require("@/assets/logos/Partido-Socialista-Obrero-Espanol-Logo.png"),
    brandColor: "#E63329",
    abbreviation: "ERC",
  },
  {
    keywords: ["vasco", "pnv", "eaj"],
    source: require("@/assets/logos/Partido-Socialista-Obrero-Espanol-Logo.png"),
    brandColor: "#1A5C2A",
    abbreviation: "PNV",
  },
];

function getPartyInfo(
  author: string,
): { source: number; brandColor: string; abbreviation: string } | null {
  const lower = author.toLowerCase();
  for (const entry of PARTY_LOGOS) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return {
        source: entry.source,
        brandColor: entry.brandColor,
        abbreviation: entry.abbreviation,
      };
    }
  }
  return null;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
  const partyInfo = getPartyInfo(initiative.author);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const gradientColor = partyInfo?.brandColor ?? null;

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
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: isDark ? "#171717" : "#ffffff",
              shadowColor: config.accentColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            <LinearGradient
              colors={
                gradientColor
                  ? [
                      hexToRgba(gradientColor, 0),
                      hexToRgba(gradientColor, 0),
                      hexToRgba(gradientColor, isDark ? 0.22 : 0.14),
                    ]
                  : ["transparent", "transparent", "transparent"]
              }
              locations={[0, 0.45, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View className="flex-row">
                <View
                  style={{ width: 4, backgroundColor: config.accentColor }}
                />
                <View className="flex-1 p-4">
                  {partyInfo && (
                    <Text
                      style={{
                        position: "absolute",
                        bottom: 52,
                        right: 10,
                        fontSize: 26,
                        fontWeight: "900",
                        color: partyInfo.brandColor,
                        opacity: 0.2,
                        letterSpacing: 2,
                      }}
                      numberOfLines={1}
                    >
                      {partyInfo.abbreviation}
                    </Text>
                  )}
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
                            backgroundColor:
                              VOTE_BADGE[votedChoice].color + "20",
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
                      <Ionicons
                        name="calendar-outline"
                        size={11}
                        color="#a3a3a3"
                      />
                      <Text className="text-xs text-neutral-400 dark:text-neutral-500">
                        {formatDate(initiative.presentedAt)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
