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
import { useAppInit } from "@/hooks/use-app-init";
import { usePreferencesStore } from "@/store/preferences.store";
import { useFollowNotifications } from "@/hooks/use-follow-notifications";

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: "(auth)",
};

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAppInit();
  const { theme, loadPreferences } = usePreferencesStore();
  useFollowNotifications();

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const effectiveScheme =
    theme === "system" ? (systemScheme ?? "light") : theme;

  if (isLoading) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        value={effectiveScheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="initiative/[id]"
            options={{ animation: "slide_from_right" }}
          />
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
        <StatusBar style={effectiveScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
