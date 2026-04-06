import { Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "@/store/auth.store";

export default function HomeScreen() {
  const clearTokens = useAuthStore((s) => s.clearTokens);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "blue" }}>
        PEC1
      </Text>
      {/* just for testing, not a real logout button */}
      <TouchableOpacity
        onPress={clearTokens}
        style={{
          marginTop: 32,
          paddingHorizontal: 24,
          paddingVertical: 12,
          backgroundColor: "#ef4444",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
