import { useState } from "react";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth.store";

/**
 * Hook que encapsula el estado y la lógica del formulario de login.
 * Gestiona la validación local, la llamada directa al endpoint /auth/login
 * (sin pasar por apiFetch ya que aún no hay token) y la redirección
 * a la pantalla principal tras autenticarse correctamente.
 */
export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setTokens = useAuthStore((s) => s.setTokens);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Por favor, rellena todos los campos.");
      return;
    }
    setError(null);
    setLoading(true);
    const url = `${process.env.EXPO_PUBLIC_API_URL}/auth/login`;
    console.log(`[LOGIN] POST ${url}`);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      console.log(`[LOGIN] → ${res.status}`, data);
      if (!res.ok) {
        setError(data.message ?? "Credenciales incorrectas.");
        return;
      }
      await setTokens(
        data.accessToken,
        data.refreshToken,
        email.trim().toLowerCase(),
      );
      router.replace("/(tabs)");
    } catch (err) {
      console.error("[LOGIN] catch:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    loading,
    handleLogin,
  };
}
