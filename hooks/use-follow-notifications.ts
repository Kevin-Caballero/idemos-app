import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import Constants from "expo-constants";
import { apiFetch } from "@/lib/api";
import { useFollowStatusStore } from "@/store/follow-status.store";
import type { FollowedInitiative } from "@/hooks/use-follows";
import { useAuthStore } from "@/store/auth.store";

// expo-notifications registers push tokens at import time, which is not
// supported in Expo Go since SDK 53. We lazy-require it at runtime so the
// module initialisation code never runs in Expo Go.
const IS_EXPO_GO = Constants.appOwnership === "expo";

type NotificationsModule = typeof import("expo-notifications");

function getNotifications(): NotificationsModule {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-notifications") as NotificationsModule;
}

let notificationHandlerSet = false;
function ensureNotificationHandler(): void {
  if (notificationHandlerSet) return;
  notificationHandlerSet = true;
  getNotifications().setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowList: true,
    }),
  });
}

async function requestPermissions(): Promise<boolean> {
  const { status } = await getNotifications().requestPermissionsAsync();
  return status === "granted";
}

async function scheduleLocalNotification(
  title: string,
  body: string,
): Promise<void> {
  await getNotifications().scheduleNotificationAsync({
    content: { title, body },
    trigger: null, // fire immediately
  });
}

/**
 * Compara el estado actual de cada iniciativa seguida con el último estado
 * conocido y lanza una notificación local para cada cambio detectado.
 * Actualiza el store tras la comprobación para que la próxima vez
 * se use el nuevo estado como referencia.
 */
async function checkForStatusChanges(): Promise<void> {
  const { statuses, updateMany } = useFollowStatusStore.getState();
  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  if (!isAuthenticated) return;

  let follows: FollowedInitiative[];
  try {
    follows = await apiFetch<FollowedInitiative[]>("/follows");
  } catch {
    return;
  }

  if (!follows || follows.length === 0) return;

  const changed: { id: string; status: string }[] = [];

  for (const initiative of follows) {
    const previous = statuses[initiative.id];
    const current = initiative.currentStatus;

    if (previous !== undefined && previous !== current) {
      await scheduleLocalNotification(
        initiative.title.length > 60
          ? initiative.title.slice(0, 57) + "…"
          : initiative.title,
        `Estado actualizado: ${current}`,
      );
    }
    changed.push({ id: initiative.id, status: current });
  }

  if (changed.length > 0) {
    await updateMany(changed);
  }
}

/**
 * Hook que detecta cambios de estado en las iniciativas seguidas y muestra
 * notificaciones locales al usuario. Se ejecuta al montar la app (mount)
 * y cada vez que la app vuelve al primer plano (AppState: active).
 * Las notificaciones requieren permiso explícito del usuario; si no se concede,
 * la comprobación de cambios no se realiza.
 */
export function useFollowNotifications() {
  const { load } = useFollowStatusStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasPermission = useRef(false);
  const initialized = useRef(false);

  const init = useCallback(async () => {
    if (IS_EXPO_GO || initialized.current || !isAuthenticated) return;
    initialized.current = true;
    ensureNotificationHandler();
    await load();
    hasPermission.current = await requestPermissions();
    if (hasPermission.current) {
      await checkForStatusChanges();
    }
  }, [isAuthenticated, load]);

  // Run on mount (app open)
  useEffect(() => {
    void init();
  }, [init]);

  // Run when app comes back to foreground
  useEffect(() => {
    if (IS_EXPO_GO || !isAuthenticated) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && hasPermission.current) {
        void checkForStatusChanges();
      }
    });
    return () => sub.remove();
  }, [isAuthenticated]);
}
