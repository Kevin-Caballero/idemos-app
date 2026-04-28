import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "./global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/auth.store";

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: "(auth)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading, loadTokens } = useAuthStore();

  useEffect(() => {
    loadTokens();
  }, []);

  if (isLoading) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              headerShown: true,
              title: "Modal",
            }}
          />
        </Stack>
        {isAuthenticated ? (
          <Redirect href="/(tabs)" />
        ) : (
          <Redirect href="/(auth)" />
        )}
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
