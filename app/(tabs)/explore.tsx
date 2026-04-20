import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { InitiativeCard } from "@/components/initiative-card";
import { useSearchScreen, STATUS_OPTIONS } from "@/hooks/use-search-screen";
import { BrandColors } from "@/constants/theme";
import type { InitiativeType } from "@/hooks/use-feed";

function PillButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, active && styles.pillActive]}
    >
      <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function SearchScreen() {
  const {
    inputValue,
    setInputValue,
    debouncedQuery,
    filterOpen,
    toggleFilter,
    draftType,
    toggleDraftType,
    draftStatuses,
    toggleDraftStatus,
    draftDateFrom,
    setDraftDateFrom,
    draftDateTo,
    setDraftDateTo,
    draftVotedOnly,
    setDraftVotedOnly,
    handleApply,
    handleClearFilters,
    handleClear,
    handleEndReached,
    results,
    total,
    isLoading,
    isError,
    isFetchingNextPage,
    refetch,
    hasActiveFilters,
  } = useSearchScreen();

  const showResults = debouncedQuery.trim().length > 0 || hasActiveFilters;

  return (
    <SafeAreaView
      className="flex-1 bg-neutral-50 dark:bg-neutral-950"
      edges={["top"]}
    >
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          Buscar
        </Text>
        <View className="flex-row items-center gap-2">
          <View className="flex-1 flex-row items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 h-11">
            <Ionicons name="search-outline" size={18} color="#a3a3a3" />
            <TextInput
              className="flex-1 ml-2 text-base text-neutral-900 dark:text-neutral-100"
              placeholder="Buscar por título, expediente, tema..."
              placeholderTextColor="#a3a3a3"
              value={inputValue}
              onChangeText={setInputValue}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {inputValue.length > 0 && (
              <Pressable onPress={handleClear} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#a3a3a3" />
              </Pressable>
            )}
          </View>

          <View>
            <Pressable
              onPress={toggleFilter}
              style={[
                styles.filterBtn,
                (filterOpen || hasActiveFilters) && styles.filterBtnActive,
              ]}
            >
              <Ionicons
                name="options-outline"
                size={20}
                color={
                  filterOpen || hasActiveFilters
                    ? "#ffffff"
                    : BrandColors.primary
                }
              />
            </Pressable>
            {hasActiveFilters && !filterOpen && (
              <View style={styles.filterDot} />
            )}
          </View>
        </View>
      </View>

      {filterOpen && (
        <View style={styles.panel}>
          <Text style={styles.sectionLabel}>Tipo</Text>
          <View className="flex-row gap-2 mb-5">
            {(["Proyecto", "Proposicion"] as InitiativeType[]).map((t) => (
              <PillButton
                key={t}
                label={t === "Proyecto" ? "Proyectos" : "Proposiciones"}
                active={draftType === t}
                onPress={() => toggleDraftType(t)}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>Estado / Fase</Text>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {STATUS_OPTIONS.map((opt) => (
              <PillButton
                key={opt.pattern}
                label={opt.label}
                active={draftStatuses.has(opt.pattern)}
                onPress={() => toggleDraftStatus(opt.pattern)}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>Mis votos</Text>
          <View className="flex-row gap-2 mb-5">
            <PillButton
              label="Solo votadas"
              active={draftVotedOnly}
              onPress={() => setDraftVotedOnly((v) => !v)}
            />
          </View>

          <Text style={styles.sectionLabel}>Fecha de presentación</Text>
          <View className="flex-row gap-3 mb-5">
            <View className="flex-1">
              <Text className="text-xs text-neutral-400 mb-1.5">Desde</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="dd/mm/aaaa"
                placeholderTextColor="#a3a3a3"
                value={draftDateFrom}
                onChangeText={setDraftDateFrom}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-neutral-400 mb-1.5">Hasta</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="dd/mm/aaaa"
                placeholderTextColor="#a3a3a3"
                value={draftDateTo}
                onChangeText={setDraftDateTo}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <View className="flex-row gap-3">
            <Pressable
              onPress={handleApply}
              style={[styles.actionBtn, styles.actionBtnPrimary]}
            >
              <Text style={styles.actionBtnPrimaryText}>Aplicar</Text>
            </Pressable>
            <Pressable
              onPress={handleClearFilters}
              style={[styles.actionBtn, styles.actionBtnSecondary]}
            >
              <Text style={styles.actionBtnSecondaryText}>Limpiar</Text>
            </Pressable>
          </View>
        </View>
      )}

      {showResults && !isLoading && !isError && results.length > 0 && (
        <Text className="px-4 pt-3 pb-1 text-sm text-neutral-400">
          {total} resultado{total !== 1 ? "s" : ""}
        </Text>
      )}

      {!showResults ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="search-outline" size={40} color="#d4d4d4" />
          <Text className="text-neutral-400 mt-3 text-base text-center px-8">
            Introduce texto o aplica filtros para buscar
          </Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-500">
            Error al cargar los resultados.
          </Text>
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5C6CFA" />
        </View>
      ) : results.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="document-outline" size={40} color="#d4d4d4" />
          <Text className="text-neutral-400 mt-3 text-base">
            Sin resultados
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <InitiativeCard initiative={item} index={index} />
          )}
          contentContainerClassName="pb-8 pt-2"
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
              tintColor="#5C6CFA"
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#5C6CFA" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnActive: {
    backgroundColor: BrandColors.primary,
    borderWidth: 0,
  },
  filterDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BrandColors.secondary,
    borderWidth: 1.5,
    borderColor: "#f5f5f5",
  },
  panel: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: BrandColors.primary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    paddingHorizontal: 14,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  pillActive: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#525252",
  },
  pillLabelActive: {
    color: "#ffffff",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: "#171717",
    backgroundColor: "#fafafa",
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionBtnPrimary: {
    backgroundColor: BrandColors.primary,
  },
  actionBtnPrimaryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  actionBtnSecondary: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },
  actionBtnSecondaryText: {
    color: "#525252",
    fontSize: 14,
    fontWeight: "600",
  },
});
