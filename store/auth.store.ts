import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const ACCESS_TOKEN_KEY = "idemos_access_token";
const REFRESH_TOKEN_KEY = "idemos_refresh_token";
const USER_EMAIL_KEY = "idemos_user_email";

/**
 * Decodifica el campo `email` del payload de un JWT sin verificar la firma.
 * Se usa como fallback para recuperar el email en sesiones iniciadas antes de que
 * se introdujera el almacenamiento explícito de email en SecureStore.
 */
function decodeJwtEmail(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload)) as { email?: string };
    return decoded.email ?? null;
  } catch {
    return null;
  }
}

/**
 * Estado global de autenticación gestionado con Zustand.
 * Los tokens se persisten en SecureStore (almacenamiento cifrado del dispositivo)
 * para sobrevivir reinicios de la app. `isLoading` se usa en el layout raíz
 * para evitar redirigir al usuario antes de que se hayan cargado los tokens.
 */
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setTokens: (
    accessToken: string,
    refreshToken: string,
    email?: string,
  ) => Promise<void>;
  clearTokens: () => Promise<void>;
  loadTokens: () => Promise<void>;
}

/**
 * Store principal de autenticación. Expone los tokens JWT, el estado de sesión
 * y las acciones para iniciar/cerrar sesión y restaurar la sesión al arrancar.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  refreshToken: null,
  userEmail: null,
  isAuthenticated: false,
  isLoading: true,

  setTokens: async (accessToken, refreshToken, email) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    if (email) await SecureStore.setItemAsync(USER_EMAIL_KEY, email);
    set({
      accessToken,
      refreshToken,
      isAuthenticated: true,
      ...(email ? { userEmail: email } : {}),
    });
  },

  clearTokens: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
    set({
      accessToken: null,
      refreshToken: null,
      userEmail: null,
      isAuthenticated: false,
    });
  },

  loadTokens: async () => {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    let userEmail = await SecureStore.getItemAsync(USER_EMAIL_KEY);

    // Fallback: decode email from JWT for users logged in before email storage was added
    if (!userEmail && accessToken) {
      userEmail = decodeJwtEmail(accessToken);
      if (userEmail) {
        await SecureStore.setItemAsync(USER_EMAIL_KEY, userEmail);
      }
    }

    set({
      accessToken,
      refreshToken,
      userEmail,
      isAuthenticated: !!accessToken,
      isLoading: false,
    });
  },
}));
