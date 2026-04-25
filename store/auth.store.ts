import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const ACCESS_TOKEN_KEY = "idemos_access_token";
const REFRESH_TOKEN_KEY = "idemos_refresh_token";
const USER_EMAIL_KEY = "idemos_user_email";

function decodeJwtEmail(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload)) as { email?: string };
    return decoded.email ?? null;
  } catch {
    return null;
  }
}

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
