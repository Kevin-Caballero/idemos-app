import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack, useSegments } from "expo-router";
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
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAppInit();
  const { theme, hasSeenOnboarding, isLoaded, loadPreferences } =
    usePreferencesStore();
  useFollowNotifications();

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const effectiveScheme =
    theme === "system" ? (systemScheme ?? "light") : theme;
  const firstSegment = segments[0];
  const isOnboardingRoute = firstSegment === "onboarding";
  const isAuthRoute = firstSegment === "(auth)";
  const shouldRedirectToOnboarding = !hasSeenOnboarding && !isOnboardingRoute;
  const shouldRedirectToAuth =
    hasSeenOnboarding && !isAuthenticated && !isAuthRoute;
  const shouldRedirectToTabs =
    hasSeenOnboarding && isAuthenticated && (isAuthRoute || !firstSegment);

  if (isLoading || !isLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        value={effectiveScheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="help"
            options={{ animation: "slide_from_right" }}
          />
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
        {shouldRedirectToOnboarding ? (
          <Redirect href="/onboarding" />
        ) : shouldRedirectToTabs ? (
          <Redirect href="/(tabs)" />
        ) : shouldRedirectToAuth ? (
          <Redirect href="/(auth)" />
        ) : null}
        <StatusBar style={effectiveScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
