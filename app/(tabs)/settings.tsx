import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { ScrollView, Switch, Text, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/auth.store";
import {
  ThemePreference,
  usePreferencesStore,
} from "@/store/preferences.store";

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: "Sistema", value: "system" },
  { label: "Claro", value: "light" },
  { label: "Oscuro", value: "dark" },
];

const appVersion = Constants.expoConfig?.version ?? "0.0.0";

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-4 mb-2">
      {title}
    </Text>
  );
}

function Separator() {
  return <View className="h-px bg-neutral-100 dark:bg-neutral-800 mx-4" />;
}

export default function SettingsScreen() {
  const userEmail = useAuthStore((s) => s.userEmail);
  const clearTokens = useAuthStore((s) => s.clearTokens);

  const theme = usePreferencesStore((s) => s.theme);
  const notifications = usePreferencesStore((s) => s.notifications);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const setNotifications = usePreferencesStore((s) => s.setNotifications);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <SafeAreaView
      className="flex-1 bg-neutral-100 dark:bg-neutral-950"
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="px-4 pt-4 pb-6">
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Ajustes
          </Text>
        </View>

        {/* CUENTA */}
        <View className="mb-6">
          <SectionHeader title="Cuenta" />
          <View className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden mx-4">
            <View className="flex-row items-center px-4 py-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: BrandColors.primary }}
              >
                <Ionicons name="person" size={20} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                  {userEmail ?? "—"}
                </Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                  <Text className="text-xs text-green-500">
                    Cuenta verificada
                  </Text>
                </View>
              </View>
            </View>

            <Separator />

            <Pressable
              onPress={clearTokens}
              className="flex-row items-center px-4 py-3.5 active:opacity-70"
            >
              <View className="w-10 h-10 rounded-full items-center justify-center bg-red-50 dark:bg-red-950/50 mr-3">
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              </View>
              <Text className="flex-1 text-base text-red-500 font-medium">
                Cerrar sesión
              </Text>
            </Pressable>
          </View>
        </View>

        {/* PREFERENCIAS */}
        <View className="mb-6">
          <SectionHeader title="Preferencias" />
          <View className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden mx-4">
            {/* Notificaciones */}
            <View className="flex-row items-center px-4 py-3.5">
              <View className="w-10 h-10 rounded-full items-center justify-center bg-neutral-100 dark:bg-neutral-800 mr-3">
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={iconColor}
                />
              </View>
              <Text className="flex-1 text-base text-neutral-900 dark:text-neutral-100">
                Notificaciones
              </Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#D1D5DB", true: BrandColors.primary }}
                thumbColor="#fff"
              />
            </View>

            <Separator />

            {/* Tema */}
            <View className="flex-row items-center px-4 py-3.5">
              <View className="w-10 h-10 rounded-full items-center justify-center bg-neutral-100 dark:bg-neutral-800 mr-3">
                <Ionicons
                  name="color-palette-outline"
                  size={20}
                  color={iconColor}
                />
              </View>
              <Text className="flex-1 text-base text-neutral-900 dark:text-neutral-100">
                Tema
              </Text>
              <View className="flex-row gap-1">
                {THEME_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setTheme(opt.value)}
                    className="px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        theme === opt.value
                          ? BrandColors.primary
                          : isDark
                            ? "#262626"
                            : "#F3F4F6",
                    }}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{
                        color:
                          theme === opt.value
                            ? "#fff"
                            : isDark
                              ? "#9CA3AF"
                              : "#6B7280",
                      }}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Separator />

            {/* Idioma */}
            <View className="flex-row items-center px-4 py-3.5">
              <View className="w-10 h-10 rounded-full items-center justify-center bg-neutral-100 dark:bg-neutral-800 mr-3">
                <Ionicons name="globe-outline" size={20} color={iconColor} />
              </View>
              <Text className="flex-1 text-base text-neutral-900 dark:text-neutral-100">
                Idioma
              </Text>
              <Text className="text-sm text-neutral-400 dark:text-neutral-500">
                Español
              </Text>
            </View>
          </View>
        </View>

        {/* ACERCA DE */}
        <View className="mb-6">
          <SectionHeader title="Acerca de" />
          <View className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden mx-4">
            <Pressable className="flex-row items-center px-4 py-3.5 active:opacity-70">
              <View className="w-10 h-10 rounded-full items-center justify-center bg-neutral-100 dark:bg-neutral-800 mr-3">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={iconColor}
                />
              </View>
              <Text className="flex-1 text-base text-neutral-900 dark:text-neutral-100">
                Acerca de IDemos
              </Text>
              <Ionicons name="chevron-forward" size={16} color={iconColor} />
            </Pressable>

            <Separator />

            <Pressable className="flex-row items-center px-4 py-3.5 active:opacity-70">
              <View className="w-10 h-10 rounded-full items-center justify-center bg-neutral-100 dark:bg-neutral-800 mr-3">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={iconColor}
                />
              </View>
              <Text className="flex-1 text-base text-neutral-900 dark:text-neutral-100">
                Política de privacidad
              </Text>
              <Ionicons name="chevron-forward" size={16} color={iconColor} />
            </Pressable>

            <Separator />

            <View className="flex-row items-center px-4 py-3.5">
              <View className="w-10 h-10 rounded-full items-center justify-center bg-neutral-100 dark:bg-neutral-800 mr-3">
                <Ionicons name="pricetag-outline" size={20} color={iconColor} />
              </View>
              <Text className="flex-1 text-base text-neutral-900 dark:text-neutral-100">
                Versión
              </Text>
              <Text className="text-sm text-neutral-400 dark:text-neutral-500">
                {appVersion}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
