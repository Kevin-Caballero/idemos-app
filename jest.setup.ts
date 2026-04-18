// ── Environment ───────────────────────────────────────────────────────────────
process.env.EXPO_PUBLIC_API_URL = "http://localhost:3100";

// ── @expo/vector-icons ────────────────────────────────────────────────────────
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

// ── expo-secure-store ─────────────────────────────────────────────────────────
jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// ── expo-router ───────────────────────────────────────────────────────────────
jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  Redirect: () => null,
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useSegments: () => [],
  usePathname: () => "/",
  Stack: { Screen: () => null },
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// ── react-native-safe-area-context ────────────────────────────────────────────
jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    SafeAreaView: View,
    SafeAreaProvider: View,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});
