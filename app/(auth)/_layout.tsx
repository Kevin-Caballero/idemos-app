import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="index" options={{ animation: "fade" }} />
      <Stack.Screen
        name="login"
        options={{ animation: "fade", animationTypeForReplace: "push" }}
      />
      <Stack.Screen
        name="register"
        options={{ animation: "fade", animationTypeForReplace: "push" }}
      />
    </Stack>
  );
}
