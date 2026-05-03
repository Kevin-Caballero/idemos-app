import { useAuthStore } from "@/store/auth.store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

console.log(
  `[API] Base URL: ${BASE_URL || "(empty — check EXPO_PUBLIC_API_URL)"}`,
);

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Intenta renovar el access token usando el refresh token almacenado.
 * Si la renovación falla (token expirado o red caída) limpia la sesión.
 * Se serializa mediante `refreshPromise` para que múltiples llamadas
 * simultáneas con 401 solo generen una única petición de renovación.
 */
async function tryRefresh(): Promise<string | null> {
  const { refreshToken, setTokens, clearTokens } = useAuthStore.getState();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await clearTokens();
      return null;
    }

    const data = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
    };
    await setTokens(data.accessToken, data.refreshToken);
    console.log("[API] Token refreshed successfully.");
    return data.accessToken;
  } catch {
    await clearTokens();
    return null;
  }
}

/**
 * Función central de llamadas a la API del gateway.
 * Inyecta automáticamente el Authorization header con el access token actual.
 * Si el servidor responde 401, intenta renovar el token una sola vez y reintenta
 * la petición original. Si la renovación falla, lanza el error para que el
 * AuthContext redirigir al usuario al login.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const method = options.method ?? "GET";
  const url = `${BASE_URL}${path}`;

  console.log(`[API] ${method} ${url}`);

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  console.log(`[API] ${method} ${url} → ${res.status}`);

  if (res.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefresh().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    if (!newToken) {
      const body = await res.text();
      throw new Error(`401: ${body}`);
    }

    const retryRes = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newToken}`,
        ...options.headers,
      },
    });

    if (!retryRes.ok) {
      const body = await retryRes.text();
      console.error(`[API] ${method} ${url} → RETRY ERROR: ${body}`);
      throw new Error(`${retryRes.status}: ${body}`);
    }

    return retryRes.json() as Promise<T>;
  }

  if (!res.ok) {
    const body = await res.text();
    console.error(`[API] ${method} ${url} → ERROR: ${body}`);
    throw new Error(`${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}
