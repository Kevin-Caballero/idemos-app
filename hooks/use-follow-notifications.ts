import { useCallback, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { AppState } from "react-native";
import { apiFetch } from "@/lib/api";
import { useFollowStatusStore } from "@/store/follow-status.store";
import type { FollowedInitiative } from "@/hooks/use-follows";
import { useAuthStore } from "@/store/auth.store";

// Show notifications while app is in foreground too
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function scheduleLocalNotification(
  title: string,
  body: string,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null, // fire immediately
  });
}

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

export function useFollowNotifications() {
  const { load } = useFollowStatusStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasPermission = useRef(false);
  const initialized = useRef(false);

  const init = useCallback(async () => {
    if (initialized.current || !isAuthenticated) return;
    initialized.current = true;
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
    if (!isAuthenticated) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && hasPermission.current) {
        void checkForStatusChanges();
      }
    });
    return () => sub.remove();
  }, [isAuthenticated]);
}
