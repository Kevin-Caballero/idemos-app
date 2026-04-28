import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth.store";

export default function SettingsScreen() {
  const clearTokens = useAuthStore((s) => s.clearTokens);

  return (
    <SafeAreaView
      className="flex-1 bg-neutral-50 dark:bg-neutral-950"
      edges={["top"]}
    >
      <View className="px-4 pt-4">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Ajustes
        </Text>
      </View>
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="text-neutral-400">Próximamente (CU-008)</Text>
        <Pressable
          onPress={clearTokens}
          className="px-6 py-3 bg-red-500 rounded-xl active:opacity-80"
        >
          <Text className="text-white font-semibold">Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
