import * as SecureStore from "expo-secure-store";
import { colorScheme as nwColorScheme } from "nativewind";
import { create } from "zustand";

export type ThemePreference = "light" | "dark" | "system";

const THEME_KEY = "idemos_theme";
const NOTIFICATIONS_KEY = "idemos_notifications";

function applyColorScheme(theme: ThemePreference) {
  // NativeWind uses null to mean "follow system"
  nwColorScheme.set(theme === "system" ? "system" : theme);
}

interface PreferencesState {
  theme: ThemePreference;
  notifications: boolean;
  isLoaded: boolean;
  setTheme: (theme: ThemePreference) => Promise<void>;
  setNotifications: (enabled: boolean) => Promise<void>;
  loadPreferences: () => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>()((set) => ({
  theme: "system",
  notifications: true,
  isLoaded: false,

  setTheme: async (theme) => {
    await SecureStore.setItemAsync(THEME_KEY, theme);
    applyColorScheme(theme);
    set({ theme });
  },

  setNotifications: async (notifications) => {
    await SecureStore.setItemAsync(NOTIFICATIONS_KEY, String(notifications));
    set({ notifications });
  },

  loadPreferences: async () => {
    const storedTheme = (await SecureStore.getItemAsync(
      THEME_KEY,
    )) as ThemePreference | null;
    const storedNotif = await SecureStore.getItemAsync(NOTIFICATIONS_KEY);

    const theme = storedTheme ?? "system";
    applyColorScheme(theme);

    set({
      theme,
      notifications: storedNotif !== null ? storedNotif === "true" : true,
      isLoaded: true,
    });
  },
}));
