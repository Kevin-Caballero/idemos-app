import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock("@/store/auth.store", () => ({
  useAuthStore: { getState: jest.fn() },
}));

const mockGetState = (useAuthStore as unknown as { getState: jest.Mock })
  .getState;

const mockFetch = jest.fn();
global.fetch = mockFetch;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeResponse(
  ok: boolean,
  status: number,
  body: unknown,
): Partial<Response> {
  const bodyText = typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(bodyText),
  };
}

function makeAuthState(
  accessToken: string | null,
  refreshToken: string | null,
  overrides: Partial<{ setTokens: jest.Mock; clearTokens: jest.Mock }> = {},
) {
  return {
    accessToken,
    refreshToken,
    setTokens: overrides.setTokens ?? jest.fn().mockResolvedValue(undefined),
    clearTokens:
      overrides.clearTokens ?? jest.fn().mockResolvedValue(undefined),
    isAuthenticated: !!accessToken,
    isLoading: false,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockGetState.mockReturnValue(makeAuthState("valid-token", "refresh-token"));
});

describe("apiFetch", () => {
  describe("successful requests", () => {
    it("sends GET request to the correct URL", async () => {
      mockFetch.mockResolvedValueOnce(makeResponse(true, 200, { data: [] }));

      await apiFetch("/feed");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3100/feed",
        expect.any(Object),
      );
    });

    it("includes Authorization header when token is present", async () => {
      mockFetch.mockResolvedValueOnce(makeResponse(true, 200, { data: [] }));

      await apiFetch("/feed");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer valid-token",
          }),
        }),
      );
    });

    it("omits Authorization header when no token", async () => {
      mockGetState.mockReturnValueOnce(makeAuthState(null, null));
      mockFetch.mockResolvedValueOnce(makeResponse(true, 200, { data: [] }));

      await apiFetch("/feed");

      const headers = mockFetch.mock.calls[0][1].headers as Record<
        string,
        string
      >;
      expect(headers["Authorization"]).toBeUndefined();
    });

    it("returns parsed JSON response", async () => {
      const payload = { data: [{ id: "1" }], total: 1 };
      mockFetch.mockResolvedValueOnce(makeResponse(true, 200, payload));

      const result = await apiFetch("/feed");

      expect(result).toEqual(payload);
    });

    it("forwards custom HTTP method", async () => {
      mockFetch.mockResolvedValueOnce(makeResponse(true, 201, {}));

      await apiFetch("/auth/register", { method: "POST", body: "{}" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("error handling", () => {
    it("throws on non-401 error responses", async () => {
      mockFetch.mockResolvedValueOnce(
        makeResponse(false, 500, "Internal Server Error"),
      );

      await expect(apiFetch("/feed")).rejects.toThrow("500");
    });

    it("throws on 404 without attempting refresh", async () => {
      mockFetch.mockResolvedValueOnce(makeResponse(false, 404, "Not Found"));

      await expect(apiFetch("/feed")).rejects.toThrow("404");
      expect(mockFetch).toHaveBeenCalledTimes(1); // no refresh attempt
    });
  });

  describe("401 token refresh flow", () => {
    it("retries the request with a new token after successful refresh", async () => {
      const mockSetTokens = jest.fn().mockResolvedValue(undefined);
      mockGetState
        .mockReturnValueOnce(makeAuthState("expired-token", "refresh-token")) // initial request
        .mockReturnValueOnce(
          makeAuthState("expired-token", "refresh-token", {
            setTokens: mockSetTokens,
          }),
        ); // inside tryRefresh

      mockFetch
        .mockResolvedValueOnce(makeResponse(false, 401, "Token expired")) // original request
        .mockResolvedValueOnce(
          makeResponse(true, 200, {
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token",
          }),
        ) // refresh endpoint
        .mockResolvedValueOnce(makeResponse(true, 200, { data: ["item"] })); // retry

      const result = await apiFetch<{ data: string[] }>("/feed");

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(mockSetTokens).toHaveBeenCalledWith(
        "new-access-token",
        "new-refresh-token",
      );
      expect(result).toEqual({ data: ["item"] });
    });

    it("calls the refresh endpoint with the stored refreshToken", async () => {
      mockGetState
        .mockReturnValueOnce(makeAuthState("expired-token", "my-refresh-token"))
        .mockReturnValueOnce(
          makeAuthState("expired-token", "my-refresh-token"),
        );

      mockFetch
        .mockResolvedValueOnce(makeResponse(false, 401, "Expired"))
        .mockResolvedValueOnce(
          makeResponse(true, 200, {
            accessToken: "new-token",
            refreshToken: "new-refresh",
          }),
        )
        .mockResolvedValueOnce(makeResponse(true, 200, {}));

      await apiFetch("/feed");

      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "http://localhost:3100/auth/refresh",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ refreshToken: "my-refresh-token" }),
        }),
      );
    });

    it("throws and calls clearTokens when refresh endpoint returns error", async () => {
      const mockClearTokens = jest.fn().mockResolvedValue(undefined);
      mockGetState
        .mockReturnValueOnce(makeAuthState("expired-token", "refresh-token"))
        .mockReturnValueOnce(
          makeAuthState("expired-token", "refresh-token", {
            clearTokens: mockClearTokens,
          }),
        );

      mockFetch
        .mockResolvedValueOnce(makeResponse(false, 401, "Token expired")) // original
        .mockResolvedValueOnce(makeResponse(false, 401, "Refresh invalid")); // refresh fails

      await expect(apiFetch("/feed")).rejects.toThrow("401");
      expect(mockClearTokens).toHaveBeenCalled();
    });

    it("returns null from refresh when no refreshToken is stored", async () => {
      mockGetState
        .mockReturnValueOnce(makeAuthState("expired-token", null)) // initial: no refresh token
        .mockReturnValueOnce(makeAuthState(null, null)); // inside tryRefresh

      mockFetch.mockResolvedValueOnce(
        makeResponse(false, 401, "Token expired"),
      );

      await expect(apiFetch("/feed")).rejects.toThrow("401");
      // refresh endpoint should NOT have been called
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
