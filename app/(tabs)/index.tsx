import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FeedTypeFilter } from "@/components/feed-type-filter";
import { InitiativeCard } from "@/components/initiative-card";
import { useFeedScreen } from "@/hooks/use-feed-screen";

export default function HomeScreen() {
  const {
    type,
    initiatives,
    isLoading,
    isError,
    isFetchingNextPage,
    refetch,
    handleTypeSelect,
    handleEndReached,
  } = useFeedScreen();

  return (
    <SafeAreaView
      className="flex-1 bg-neutral-50 dark:bg-neutral-950"
      edges={["top"]}
    >
      <View className="px-4 pt-4 pb-1">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Iniciativas
        </Text>
      </View>

      <FeedTypeFilter selected={type} onSelect={handleTypeSelect} />

      {isError && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-500">
            Error al cargar las iniciativas.
          </Text>
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5C6CFA" />
        </View>
      ) : (
        <FlatList
          data={initiatives}
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
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-neutral-400 text-base">
                No hay iniciativas disponibles.
              </Text>
            </View>
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
