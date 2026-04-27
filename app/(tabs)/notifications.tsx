import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFollows } from "@/hooks/use-follows";
import type { FollowedInitiative } from "@/hooks/use-follows";
import { useFollowStatusStore } from "@/store/follow-status.store";
import { BrandColors } from "@/constants/theme";
import type { InitiativeType } from "@/hooks/use-feed";

const ALPHA_BADGE = "24";

const TYPE_CONFIG: Record<
  InitiativeType,
  { label: string; accent: string; badgeBg: string }
> = {
  Proyecto: {
    label: "Proyecto de Ley",
    accent: BrandColors.primary,
    badgeBg: BrandColors.primary + ALPHA_BADGE,
  },
  Proposicion: {
    label: "Proposición de Ley",
    accent: BrandColors.secondary,
    badgeBg: BrandColors.secondary + ALPHA_BADGE,
  },
};

function getStatusStyle(status: string) {
  const s = status.toLowerCase();
  if (
    s.includes("aprobad") ||
    s.includes("publicad") ||
    s.includes("promulgad")
  )
    return { dot: "#10b981", bg: "rgba(16,185,129,0.12)", text: "#059669" };
  if (
    s.includes("rechazad") ||
    s.includes("caducad") ||
    s.includes("retirad") ||
    s.includes("inadmitid")
  )
    return { dot: "#ef4444", bg: "rgba(239,68,68,0.12)", text: "#dc2626" };
  if (
    s.includes("comisión") ||
    s.includes("ponencia") ||
    s.includes("tramit") ||
    s.includes("debate")
  )
    return { dot: "#f59e0b", bg: "rgba(245,158,11,0.12)", text: "#d97706" };
  return { dot: "#8b5cf6", bg: "rgba(139,92,246,0.12)", text: "#7c3aed" };
}

function FollowCard({
  item,
  hasChange,
}: {
  item: FollowedInitiative;
  hasChange: boolean;
}) {
  const router = useRouter();
  const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.Proyecto;
  const statusStyle = getStatusStyle(item.currentStatus);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/initiative/${item.id}`)}
      activeOpacity={0.75}
      className="mx-4 mb-3 rounded-2xl bg-white dark:bg-neutral-900 px-4 py-3"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: hasChange ? 1.5 : 0,
        borderColor: hasChange ? "#ef4444" : "transparent",
      }}
    >
      <View className="flex-row items-center gap-2 mb-2">
        <View
          className="rounded-full px-2.5 py-0.5"
          style={{ backgroundColor: config.badgeBg }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: config.accent }}
          >
            {config.label}
          </Text>
        </View>
        <Text
          className="text-xs text-neutral-400 dark:text-neutral-500 flex-1"
          numberOfLines={1}
        >
          {item.expediente}
        </Text>
        {hasChange && (
          <View
            className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
            style={{ backgroundColor: "#ef4444" }}
          >
            <Ionicons name="notifications" size={12} color="#fff" />
            <Text className="text-xs font-bold" style={{ color: "#fff" }}>
              Nuevo
            </Text>
          </View>
        )}
      </View>

      <Text
        className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2"
        numberOfLines={2}
        style={{ lineHeight: 20 }}
      >
        {item.title}
      </Text>

      <View
        className="self-start flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
        style={{ backgroundColor: statusStyle.bg }}
      >
        <View
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: statusStyle.dot }}
        />
        <Text
          className="text-xs font-medium"
          style={{ color: statusStyle.text }}
        >
          {item.currentStatus}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const {
    data: follows,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useFollows();
  const { statuses, updateMany } = useFollowStatusStore();

  // After a successful refresh, mark all current statuses as seen
  const handleRefresh = async () => {
    await refetch();
    if (follows && follows.length > 0) {
      await updateMany(
        follows.map((f) => ({ id: f.id, status: f.currentStatus })),
      );
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-neutral-50 dark:bg-neutral-950"
      edges={["top"]}
    >
      <View className="px-4 pt-4 pb-3">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Seguimientos
        </Text>
        <Text className="text-sm text-neutral-400 dark:text-neutral-500 mt-0.5">
          Iniciativas que sigues
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BrandColors.primary} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={48} color="#d4d4d4" />
          <Text className="text-neutral-400 text-base text-center mt-3">
            No se pudieron cargar los seguimientos.
          </Text>
        </View>
      ) : !follows || follows.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="star-outline" size={52} color="#d4d4d4" />
          <Text className="text-neutral-700 dark:text-neutral-300 text-base font-semibold text-center mt-4">
            Aún no sigues ninguna iniciativa
          </Text>
          <Text className="text-neutral-400 dark:text-neutral-500 text-sm text-center mt-2">
            Pulsa la <Ionicons name="star-outline" size={13} color="#a3a3a3" />{" "}
            en el detalle de cualquier iniciativa para seguirla.
          </Text>
        </View>
      ) : (
        <FlatList
          data={follows}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FollowCard
              item={item}
              hasChange={
                statuses[item.id] !== undefined &&
                statuses[item.id] !== item.currentStatus
              }
            />
          )}
          contentContainerClassName="pt-2 pb-10"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={BrandColors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
