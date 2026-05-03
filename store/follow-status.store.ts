import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "idemos_follow_statuses";

/**
 * Mapa de initiativeId → último estado conocido de cada iniciativa seguida.
 * Se persiste en AsyncStorage para poder detectar cambios de estado entre sesiones
 * y mostrar notificaciones locales la próxima vez que la app queda en primer plano.
 */
// Map of initiativeId → last known currentStatus
type StatusMap = Record<string, string>;

interface FollowStatusState {
  statuses: StatusMap;
  load: () => Promise<void>;
  update: (id: string, status: string) => Promise<void>;
  updateMany: (entries: { id: string; status: string }[]) => Promise<void>;
}

/**
 * Store que persiste el último estado conocido de cada iniciativa seguida.
 * Lo usa `useFollowNotifications` para comparar contra el estado actual
 * y disparar notificaciones locales cuando una iniciativa cambia de estado.
 */
export const useFollowStatusStore = create<FollowStatusState>()((set, get) => ({
  statuses: {},

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) set({ statuses: JSON.parse(raw) as StatusMap });
    } catch {
      // ignore
    }
  },

  update: async (id, status) => {
    const next = { ...get().statuses, [id]: status };
    set({ statuses: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },

  updateMany: async (entries) => {
    const next = { ...get().statuses };
    for (const { id, status } of entries) next[id] = status;
    set({ statuses: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },
}));
