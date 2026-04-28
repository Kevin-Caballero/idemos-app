import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useInitiative } from "@/hooks/use-initiative";
import { useCastVote, useUserVote, useVoteStats } from "@/hooks/use-vote";
import type { VoteChoice } from "@/hooks/use-vote";
import { useVoteStore } from "@/store/vote.store";
import { BrandColors } from "@/constants/theme";
import type { InitiativeType } from "@/hooks/use-feed";

const ALPHA_GRADIENT = "38";
const ALPHA_BADGE = "24";

const TYPE_CONFIG: Record<
  InitiativeType,
  { label: string; accent: string; gradientStart: string; badgeBg: string }
> = {
  Proyecto: {
    label: "Proyecto de Ley",
    accent: BrandColors.primary,
    gradientStart: BrandColors.primary + ALPHA_GRADIENT,
    badgeBg: BrandColors.primary + ALPHA_BADGE,
  },
  Proposicion: {
    label: "Proposición de Ley",
    accent: BrandColors.secondary,
    gradientStart: BrandColors.secondary + ALPHA_GRADIENT,
    badgeBg: BrandColors.secondary + ALPHA_BADGE,
  },
};

type StatusStyle = { dot: string; bg: string; text: string };

function getStatusStyle(status: string): StatusStyle {
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

function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      className="mx-4 mb-4 rounded-2xl bg-white dark:bg-neutral-900 overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      {children}
    </View>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}) {
  return (
    <View className="flex-row items-center gap-2 px-4 pt-4 pb-2">
      <Ionicons name={icon} size={16} color={BrandColors.primary} />
      <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
        {title}
      </Text>
    </View>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <View className="flex-row px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
      <Text className="text-xs text-neutral-400 dark:text-neutral-500 w-28 pt-0.5">
        {label}
      </Text>
      <Text
        className="flex-1 text-sm text-neutral-800 dark:text-neutral-200 font-medium"
        style={{ lineHeight: 20 }}
      >
        {value || "—"}
      </Text>
    </View>
  );
}

function VoteChart({
  si,
  no,
  abst,
  total,
}: {
  si: number;
  no: number;
  abst: number;
  total: number;
}) {
  if (total === 0) return null;
  const siPct = Math.round((si / total) * 100);
  const noPct = Math.round((no / total) * 100);
  const abstPct = 100 - siPct - noPct;

  return (
    <View className="mt-3">
      <View
        className="flex-row rounded-full overflow-hidden"
        style={{ height: 10 }}
      >
        {siPct > 0 && (
          <View style={{ flex: siPct, backgroundColor: "#10b981" }} />
        )}
        {noPct > 0 && (
          <View style={{ flex: noPct, backgroundColor: "#ef4444" }} />
        )}
        {abstPct > 0 && (
          <View style={{ flex: abstPct, backgroundColor: "#8b5cf6" }} />
        )}
      </View>
      <View className="flex-row justify-between mt-2">
        <View className="flex-row items-center gap-1">
          <View
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#10b981" }}
          />
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            Sí · {siPct}%
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#ef4444" }}
          />
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            No · {noPct}%
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#8b5cf6" }}
          />
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            Abst · {abstPct}%
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function InitiativeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: initiative, isLoading, isError } = useInitiative(id ?? "");
  const { data: userVote } = useUserVote(id ?? "");
  const { data: voteStats } = useVoteStats(id ?? "");
  const { mutate: castVote, isPending: isCasting } = useCastVote(id ?? "");
  const optimisticVote = useVoteStore((s) => s.optimisticVotes[id ?? ""]);

  const activeChoice: VoteChoice | null =
    optimisticVote ?? userVote?.choice ?? null;

  const config = initiative?.type
    ? (TYPE_CONFIG[initiative.type] ?? TYPE_CONFIG.Proyecto)
    : TYPE_CONFIG.Proyecto;
  const statusStyle = initiative
    ? getStatusStyle(initiative.currentStatus)
    : getStatusStyle("");

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-neutral-50 dark:bg-neutral-950"
        edges={["top"]}
      >
        <View className="flex-row items-center px-4 pt-2 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
            className="mr-3"
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={BrandColors.primary}
            />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BrandColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !initiative) {
    return (
      <SafeAreaView
        className="flex-1 bg-neutral-50 dark:bg-neutral-950"
        edges={["top"]}
      >
        <View className="flex-row items-center px-4 pt-2 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
            className="mr-3"
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={BrandColors.primary}
            />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={48} color="#d4d4d4" />
          <Text className="text-neutral-400 text-base text-center mt-3">
            No se pudo cargar la iniciativa.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 px-5 py-2.5 rounded-full"
            style={{ backgroundColor: BrandColors.primary }}
          >
            <Text className="text-white font-semibold text-sm">Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-neutral-50 dark:bg-neutral-950"
      edges={["top"]}
    >
      <LinearGradient
        colors={[config.gradientStart, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="px-4 pt-2 pb-4"
      >
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={BrandColors.primary}
            />
          </TouchableOpacity>

          <Text className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
            {initiative.expediente}
          </Text>

          <TouchableOpacity hitSlop={8}>
            <Ionicons
              name="star-outline"
              size={22}
              color={BrandColors.primary}
            />
          </TouchableOpacity>
        </View>

        <View
          className="self-start rounded-full px-3 py-1 mb-2"
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
          className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-3"
          style={{ lineHeight: 26 }}
        >
          {initiative.title}
        </Text>

        <View className="flex-row items-center gap-2">
          <View
            className="flex-row items-center gap-1.5 rounded-full px-3 py-1"
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
              {initiative.currentStatus}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        <SectionCard>
          <SectionHeader icon="sparkles" title="Resumen IA" />
          <View className="px-4 pb-4">
            <View
              className="rounded-xl p-4"
              style={{ backgroundColor: BrandColors.primary + "10" }}
            >
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={BrandColors.primary}
                />
                <Text
                  className="text-xs font-medium"
                  style={{ color: BrandColors.primary }}
                >
                  Resumen neutral generado por IA
                </Text>
              </View>
              {initiative.summary?.content ? (
                <Text className="text-sm text-neutral-700 dark:text-neutral-300 leading-5">
                  {initiative.summary.content}
                </Text>
              ) : (
                <Text className="text-sm text-neutral-400 dark:text-neutral-500 italic">
                  El resumen automático estará disponible próximamente.
                </Text>
              )}
            </View>
          </View>
        </SectionCard>

        <SectionCard>
          <SectionHeader icon="document-text-outline" title="Datos clave" />
          <View className="pb-2">
            <InfoRow label="Autor" value={initiative.author} />
            <InfoRow label="Tipo de trámite" value={initiative.procedureType} />
            <InfoRow
              label="Comisión"
              value={initiative.committee ?? undefined}
            />
            <InfoRow label="Legislatura" value={initiative.legislature} />
            <InfoRow
              label="Presentado"
              value={formatDate(initiative.presentedAt)}
            />
            {initiative.qualifiedAt && (
              <InfoRow
                label="Calificado"
                value={formatDate(initiative.qualifiedAt)}
              />
            )}
            {initiative.closedAt && (
              <InfoRow
                label="Cerrado"
                value={formatDate(initiative.closedAt)}
              />
            )}
          </View>
        </SectionCard>

        <SectionCard>
          <SectionHeader icon="git-branch-outline" title="Tramitación" />
          <View className="px-4 pb-4">
            {initiative.steps.length === 0 ? (
              <Text className="text-sm text-neutral-400 dark:text-neutral-500 italic">
                No hay fases de tramitación registradas.
              </Text>
            ) : (
              initiative.steps.map((step, idx) => {
                const isLast = idx === initiative.steps.length - 1;
                return (
                  <View key={step.id} className="flex-row">
                    <View className="items-center mr-3" style={{ width: 20 }}>
                      <View
                        className="w-3 h-3 rounded-full mt-1"
                        style={{
                          backgroundColor: isLast
                            ? BrandColors.primary
                            : "#d4d4d4",
                          borderWidth: isLast ? 2 : 0,
                          borderColor: BrandColors.primary,
                        }}
                      />
                      {!isLast && (
                        <View className="w-px flex-1 bg-neutral-200 dark:bg-neutral-700 mt-1" />
                      )}
                    </View>
                    <View className="flex-1 pb-4">
                      <Text
                        className="text-xs font-semibold uppercase tracking-wide mb-0.5"
                        style={{ color: BrandColors.primary }}
                      >
                        {step.stepType}
                      </Text>
                      <Text className="text-sm text-neutral-800 dark:text-neutral-200">
                        {step.description}
                      </Text>
                      {(step.startDate ?? step.endDate) && (
                        <Text className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                          {formatDate(step.startDate)}
                          {step.endDate && step.endDate !== step.startDate
                            ? ` → ${formatDate(step.endDate)}`
                            : ""}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </SectionCard>

        <SectionCard>
          <SectionHeader icon="link-outline" title="Fuentes oficiales" />
          <View className="pb-2">
            {initiative.links.length === 0 ? (
              <View className="px-4 pb-4">
                <Text className="text-sm text-neutral-400 dark:text-neutral-500 italic">
                  No hay fuentes registradas.
                </Text>
              </View>
            ) : (
              initiative.links.map((link, idx) => {
                const isLast = idx === initiative.links.length - 1;
                const badgeColor =
                  link.linkType === "BOCG"
                    ? BrandColors.secondary
                    : link.linkType === "DS"
                      ? BrandColors.primary
                      : "#8b5cf6";
                return (
                  <TouchableOpacity
                    key={link.id}
                    onPress={() => Linking.openURL(link.url)}
                    className={`flex-row items-center px-4 py-3 ${
                      !isLast
                        ? "border-b border-neutral-100 dark:border-neutral-800"
                        : ""
                    }`}
                    activeOpacity={0.7}
                  >
                    <View
                      className="rounded px-2 py-0.5 mr-3"
                      style={{ backgroundColor: badgeColor + "20" }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{ color: badgeColor }}
                      >
                        {link.linkType}
                      </Text>
                    </View>
                    <Text
                      className="flex-1 text-sm text-neutral-800 dark:text-neutral-200"
                      numberOfLines={1}
                    >
                      {link.label ?? link.url}
                    </Text>
                    <Ionicons name="open-outline" size={15} color="#a3a3a3" />
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </SectionCard>

        <SectionCard>
          <SectionHeader icon="bar-chart-outline" title="Tu voto" />
          <View className="px-4 pb-4">
            <Text className="text-xs text-neutral-400 dark:text-neutral-500 mb-3">
              Voto ciudadano no vinculante. Un voto por usuario.
            </Text>
            <View className="flex-row gap-3">
              {[
                {
                  label: "Sí",
                  icon: "thumbs-up-outline" as const,
                  color: "#10b981",
                  choice: "SI" as VoteChoice,
                },
                {
                  label: "No",
                  icon: "thumbs-down-outline" as const,
                  color: "#ef4444",
                  choice: "NO" as VoteChoice,
                },
                {
                  label: "Abstención",
                  icon: "remove-circle-outline" as const,
                  color: "#8b5cf6",
                  choice: "ABST" as VoteChoice,
                },
              ].map(({ label, icon, color, choice }) => {
                const isSelected = activeChoice === choice;
                return (
                  <TouchableOpacity
                    key={label}
                    onPress={() => {
                      if (isCasting) return;
                      castVote(choice);
                    }}
                    disabled={isCasting}
                    className="flex-1 items-center rounded-xl py-3"
                    style={{
                      backgroundColor: isSelected ? color + "28" : color + "12",
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? color : color + "40",
                      opacity: isCasting && !isSelected ? 0.5 : 1,
                    }}
                  >
                    <Ionicons name={icon} size={20} color={color} />
                    <Text
                      className="text-xs font-semibold mt-1"
                      style={{ color }}
                    >
                      {label}
                    </Text>
                    {voteStats && (
                      <Text
                        className="text-xs mt-0.5"
                        style={{ color: color + "aa" }}
                      >
                        {choice === "SI"
                          ? voteStats.si
                          : choice === "NO"
                            ? voteStats.no
                            : voteStats.abst}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {voteStats && voteStats.total > 0 && (
              <>
                <Text className="text-xs text-neutral-400 dark:text-neutral-500 text-center mt-3">
                  {voteStats.total}{" "}
                  {voteStats.total === 1
                    ? "voto ciudadano"
                    : "votos ciudadanos"}
                </Text>
                <VoteChart
                  si={voteStats.si}
                  no={voteStats.no}
                  abst={voteStats.abst}
                  total={voteStats.total}
                />
              </>
            )}
          </View>
        </SectionCard>

        {voteStats?.officialYes != null && (
          <SectionCard>
            <SectionHeader
              icon="people-outline"
              title="Votación parlamentaria"
            />
            <View className="px-4 pb-4">
              {voteStats.officialVotedAt && (
                <Text className="text-xs text-neutral-400 dark:text-neutral-500 mb-3">
                  Votado el {formatDate(voteStats.officialVotedAt)}
                </Text>
              )}
              <View className="flex-row justify-around">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-emerald-600">
                    {voteStats.officialYes}
                  </Text>
                  <Text className="text-xs text-neutral-400 mt-0.5">
                    A favor
                  </Text>
                </View>
                <View className="w-px" style={{ backgroundColor: "#e5e5e5" }} />
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-red-500">
                    {voteStats.officialNo}
                  </Text>
                  <Text className="text-xs text-neutral-400 mt-0.5">
                    En contra
                  </Text>
                </View>
                <View className="w-px" style={{ backgroundColor: "#e5e5e5" }} />
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-violet-500">
                    {voteStats.officialAbst}
                  </Text>
                  <Text className="text-xs text-neutral-400 mt-0.5">
                    Abstención
                  </Text>
                </View>
              </View>
              <VoteChart
                si={voteStats.officialYes ?? 0}
                no={voteStats.officialNo ?? 0}
                abst={voteStats.officialAbst ?? 0}
                total={
                  (voteStats.officialYes ?? 0) +
                  (voteStats.officialNo ?? 0) +
                  (voteStats.officialAbst ?? 0)
                }
              />
            </View>
          </SectionCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
