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
      className={`rounded-full border h-[34px] px-[14px] items-center justify-center ${
        active
          ? "bg-primary border-primary"
          : "bg-transparent border-neutral-300 dark:border-neutral-600"
      }`}
    >
      <Text
        className={`text-[13px] font-medium ${
          active ? "text-white" : "text-neutral-600 dark:text-neutral-300"
        }`}
      >
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
    hasApplied,
  } = useSearchScreen();

  const showResults =
    debouncedQuery.trim().length > 0 || hasActiveFilters || hasApplied;

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
              className={`w-11 h-11 rounded-xl border items-center justify-center ${
                filterOpen || hasActiveFilters
                  ? "bg-primary border-primary"
                  : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
              }`}
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
        <View className="bg-white dark:bg-neutral-900 px-4 pt-4 pb-5 border-b border-neutral-100 dark:border-neutral-800">
          <Text className="text-[11px] font-bold text-primary uppercase tracking-widest mb-[10px]">
            Tipo
          </Text>
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

          <Text className="text-[11px] font-bold text-primary uppercase tracking-widest mb-[10px]">
            Estado / Fase
          </Text>
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

          <Text className="text-[11px] font-bold text-primary uppercase tracking-widest mb-[10px]">
            Mis votos
          </Text>
          <View className="flex-row gap-2 mb-5">
            <PillButton
              label="Solo votadas"
              active={draftVotedOnly}
              onPress={() => setDraftVotedOnly((v) => !v)}
            />
          </View>

          <Text className="text-[11px] font-bold text-primary uppercase tracking-widest mb-[10px]">
            Fecha de presentación
          </Text>
          <View className="flex-row gap-3 mb-5">
            <View className="flex-1">
              <Text className="text-xs text-neutral-400 mb-1.5">Desde</Text>
              <TextInput
                className="border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 h-11 text-sm text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-800"
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
                className="border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 h-11 text-sm text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-800"
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
              className="flex-1 rounded-xl py-[14px] items-center bg-primary active:opacity-80"
            >
              <Text className="text-white text-sm font-semibold">Aplicar</Text>
            </Pressable>
            <Pressable
              onPress={handleClearFilters}
              className="flex-1 rounded-xl py-[14px] items-center border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 active:opacity-70"
            >
              <Text className="text-neutral-600 dark:text-neutral-300 text-sm font-medium">
                Limpiar
              </Text>
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
});
