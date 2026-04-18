import { router } from "expo-router";
import React from "react";
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
import { useRegisterForm } from "@/hooks/use-register-form";

export default function RegisterScreen() {
  const {
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
  } = useRegisterForm();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerClassName="px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900">
              Únete a IDemos
            </Text>
            <Text className="text-gray-500 text-base mt-1">
              Crea tu cuenta gratis
            </Text>
            <Image
              source={require("../../assets/images/1.png")}
              style={{ width: 160, height: 160, alignSelf: "center" }}
              resizeMode="contain"
            />
          </View>

          <View className="gap-4">
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-gray-700">
                Nombre completo
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
                placeholder="Pepe Viyuela"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                autoComplete="name"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-medium text-gray-700">
                Correo electrónico
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-medium text-gray-700">
                Contraseña
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50">
                <TextInput
                  className="flex-1 px-4 py-3.5 text-base text-gray-900"
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
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

            <View className="gap-1.5">
              <Text className="text-sm font-medium text-gray-700">
                Repite la contraseña
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <Pressable
              className="flex-row items-start gap-3 mt-1"
              onPress={() => setAcceptedTerms((v) => !v)}
            >
              <View
                className={`w-5 h-5 rounded border-2 items-center justify-center mt-0.5 ${
                  acceptedTerms
                    ? "bg-primary border-primary"
                    : "bg-white border-gray-300"
                }`}
              >
                {acceptedTerms && (
                  <Text className="text-white text-xs font-bold">✓</Text>
                )}
              </View>
              <Text className="text-sm text-gray-600 flex-1">
                Acepto los{" "}
                <Text className="text-primary font-medium">
                  términos y condiciones
                </Text>
              </Text>
            </Pressable>

            {error && <Text className="text-secondary text-sm">{error}</Text>}

            <Pressable
              className="w-full bg-secondary rounded-xl py-4 items-center active:opacity-80 mt-2"
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  Crear cuenta
                </Text>
              )}
            </Pressable>

            <View className="flex-row justify-center gap-1 pb-8">
              <Text className="text-gray-500 text-sm">¿Ya tienes cuenta?</Text>
              <Pressable onPress={() => router.replace("/(auth)/login")}>
                <Text className="text-primary text-sm font-semibold">
                  Inicia sesión
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
