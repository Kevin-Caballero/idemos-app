import * as SecureStore from "expo-secure-store";
import { colorScheme as nwColorScheme } from "nativewind";
import { create } from "zustand";

export type ThemePreference = "light" | "dark" | "system";

const THEME_KEY = "idemos_theme";
const NOTIFICATIONS_KEY = "idemos_notifications";
const ONBOARDING_KEY = "idemos_onboarding";

/**
 * Aplica el esquema de color en NativeWind.
 * Cuando la preferencia es "system" se pasa null para que NativeWind
 * delegue en las preferencias del sistema operativo.
 */
function applyColorScheme(theme: ThemePreference) {
  // NativeWind uses null to mean "follow system"
  nwColorScheme.set(theme === "system" ? "system" : theme);
}

interface PreferencesState {
  theme: ThemePreference;
  notifications: boolean;
  hasSeenOnboarding: boolean;
  isLoaded: boolean;
  setTheme: (theme: ThemePreference) => Promise<void>;
  setNotifications: (enabled: boolean) => Promise<void>;
  setHasSeenOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  loadPreferences: () => Promise<void>;
}

/**
 * Store de preferencias de usuario (tema visual y notificaciones).
 * Los valores se persisten en SecureStore para mantenerlos entre reinicios.
 * `isLoaded` previene un flash del tema por defecto antes de leer el valor guardado.
 */
export const usePreferencesStore = create<PreferencesState>()((set) => ({
  theme: "system",
  notifications: true,
  hasSeenOnboarding: false,
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

  setHasSeenOnboarding: async () => {
    await SecureStore.setItemAsync(ONBOARDING_KEY, "true");
    set({ hasSeenOnboarding: true });
  },

  resetOnboarding: async () => {
    await SecureStore.deleteItemAsync(ONBOARDING_KEY);
    set({ hasSeenOnboarding: false });
  },

  loadPreferences: async () => {
    const [storedTheme, storedNotif, storedOnboarding] = await Promise.all([
      SecureStore.getItemAsync(THEME_KEY),
      SecureStore.getItemAsync(NOTIFICATIONS_KEY),
      SecureStore.getItemAsync(ONBOARDING_KEY),
    ]);

    const theme = (storedTheme as ThemePreference | null) ?? "system";
    applyColorScheme(theme);

    set({
      theme,
      notifications: storedNotif !== null ? storedNotif === "true" : true,
      hasSeenOnboarding: storedOnboarding === "true",
      isLoaded: true,
    });
  },
}));
