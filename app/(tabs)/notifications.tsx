import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  return (
    <SafeAreaView
      className="flex-1 bg-neutral-50 dark:bg-neutral-950"
      edges={["top"]}
    >
      <View className="px-4 pt-4">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Notificaciones
        </Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-neutral-400">Próximamente (CU-007)</Text>
      </View>
    </SafeAreaView>
  );
}
