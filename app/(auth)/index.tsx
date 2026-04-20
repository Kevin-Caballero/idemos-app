import { router } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LandingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-between px-6 py-12">
        <View className="flex-1 items-center justify-center gap-3">
          <Image
            source={require("../../assets/images/1.png")}
            style={{ width: 400, height: 400 }}
            resizeMode="contain"
          />
          <Text className="text-sm text-gray-400 text-center tracking-widest uppercase">
            Democracia Informada
          </Text>
        </View>

        <View className="w-full gap-3">
          <Pressable
            className="w-full bg-secondary rounded-2xl py-4 items-center active:opacity-85"
            onPress={() => router.push("/(auth)/register")}
          >
            <Text className="text-white text-base font-semibold">
              Registrarse
            </Text>
          </Pressable>

          <Pressable
            className="w-full border-2 border-tertiary rounded-2xl py-4 items-center active:opacity-85"
            onPress={() => router.push("/(auth)/login")}
          >
            <Text className="text-primary text-base font-semibold">
              Iniciar sesión
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
