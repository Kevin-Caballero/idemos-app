import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth.store";

export default function LoginScreen() {
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
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Credenciales incorrectas.");
        return;
      }
      await setTokens(data.accessToken, data.refreshToken);
      router.replace("/(tabs)");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerClassName="flex-1 px-6 py-8 justify-between"
          keyboardShouldPersistTaps="handled"
        >
          {/* Cabecera */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900">
              Bienvenido de nuevo
            </Text>
            <Text className="text-gray-500 text-base mt-1">
              Inicia sesión en tu cuenta
            </Text>
            <Image
              source={require("../../assets/images/1.png")}
              style={{ width: 160, height: 160, alignSelf: "center" }}
              resizeMode="contain"
            />
          </View>

          {/* Formulario */}
          <View className="gap-4 flex-1">
            {/* Email */}
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-gray-700">
                Correo electrónico
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50 focus:border-primary"
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Contraseña */}
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-gray-700">
                Contraseña
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50 focus:border-primary">
                <TextInput
                  className="flex-1 px-4 py-3.5 text-base text-gray-900"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  className="px-4 py-3.5"
                  onPress={() => setShowPassword((v) => !v)}
                >
                  <Text className="text-sm text-primary font-medium">
                    {showPassword ? "Ocultar" : "Ver"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Error */}
            {error && <Text className="text-secondary text-sm">{error}</Text>}
          </View>

          {/* Footer */}
          <View className="gap-4 mt-8">
            <Pressable
              className="w-full border-2 border-tertiary rounded-xl py-4 items-center active:opacity-80"
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-primary text-base font-semibold">
                  Iniciar sesión
                </Text>
              )}
            </Pressable>

            <View className="flex-row justify-center gap-1">
              <Text className="text-gray-500 text-sm">¿No tienes cuenta?</Text>
              <Pressable onPress={() => router.replace("/(auth)/register")}>
                <Text className="text-primary text-sm font-semibold">
                  Regístrate
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
