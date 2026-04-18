import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "@/store/auth.store";

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

beforeEach(() => {
  // Reset store state between tests (preserve action functions)
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });
  jest.clearAllMocks();
});

describe("Auth Store", () => {
  describe("setTokens", () => {
    it("updates accessToken and refreshToken in state", async () => {
      await useAuthStore.getState().setTokens("access-abc", "refresh-xyz");

      const { accessToken, refreshToken } = useAuthStore.getState();
      expect(accessToken).toBe("access-abc");
      expect(refreshToken).toBe("refresh-xyz");
    });

    it("sets isAuthenticated to true", async () => {
      await useAuthStore.getState().setTokens("access-abc", "refresh-xyz");

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it("persists accessToken to SecureStore", async () => {
      await useAuthStore.getState().setTokens("access-abc", "refresh-xyz");

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        "idemos_access_token",
        "access-abc",
      );
    });

    it("persists refreshToken to SecureStore", async () => {
      await useAuthStore.getState().setTokens("access-abc", "refresh-xyz");

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        "idemos_refresh_token",
        "refresh-xyz",
      );
    });
  });

  describe("clearTokens", () => {
    beforeEach(async () => {
      // Start with authenticated state
      await useAuthStore.getState().setTokens("access-abc", "refresh-xyz");
      jest.clearAllMocks();
    });

    it("sets accessToken and refreshToken to null", async () => {
      await useAuthStore.getState().clearTokens();

      const { accessToken, refreshToken } = useAuthStore.getState();
      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
    });

    it("sets isAuthenticated to false", async () => {
      await useAuthStore.getState().clearTokens();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it("deletes accessToken from SecureStore", async () => {
      await useAuthStore.getState().clearTokens();

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "idemos_access_token",
      );
    });

    it("deletes refreshToken from SecureStore", async () => {
      await useAuthStore.getState().clearTokens();

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "idemos_refresh_token",
      );
    });
  });

  describe("loadTokens", () => {
    it("loads stored tokens from SecureStore into state", async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce("stored-access")
        .mockResolvedValueOnce("stored-refresh");

      await useAuthStore.getState().loadTokens();

      const { accessToken, refreshToken } = useAuthStore.getState();
      expect(accessToken).toBe("stored-access");
      expect(refreshToken).toBe("stored-refresh");
    });

    it("sets isAuthenticated to true when tokens exist in storage", async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce("stored-access")
        .mockResolvedValueOnce("stored-refresh");

      await useAuthStore.getState().loadTokens();

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it("sets isAuthenticated to false when no token in storage", async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      await useAuthStore.getState().loadTokens();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it("sets isLoading to false after loading", async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      await useAuthStore.getState().loadTokens();

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
