import { useState } from "react";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth.store";

export function useRegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setTokens = useAuthStore((s) => s.setTokens);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Por favor, rellena todos los campos.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!acceptedTerms) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }
    setError(null);
    setLoading(true);
    const url = `${process.env.EXPO_PUBLIC_API_URL}/auth/register`;
    console.log(`[REGISTER] POST ${url}`);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await res.json();
      console.log(`[REGISTER] → ${res.status}`, data);
      if (!res.ok) {
        setError(data.message ?? "Error al crear la cuenta.");
        return;
      }
      await setTokens(data.accessToken, data.refreshToken);
      router.replace("/(tabs)");
    } catch (err) {
      console.error("[REGISTER] catch:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    acceptedTerms,
    setAcceptedTerms,
    error,
    loading,
    handleRegister,
  };
}
