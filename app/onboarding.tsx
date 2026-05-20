import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePreferencesStore } from "@/store/preferences.store";

interface Slide {
  image: ReturnType<typeof require>;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    image: require("@/assets/images/1.png"),
    title: "Bienvenido a iDemos",
    description:
      "Tu ventana al Congreso de los Diputados. Sigue las iniciativas parlamentarias en tiempo real y mantente informado.",
  },
  {
    image: require("@/assets/onboarding-feed.png"),
    title: "Explora el feed",
    description:
      "Consulta proyectos de ley y proposiciones en tramitación. Filtra por tipo de iniciativa para ver solo lo que te interesa.",
  },
  {
    image: require("@/assets/onboarding-vote.png"),
    title: "Vota y opina",
    description:
      "Expresa tu posición en cada iniciativa: Sí, No o Abstención, igual que tus representantes. Tu opinión importa.",
  },
  {
    image: require("@/assets/onboarding-notify.png"),
    title: "Sigue iniciativas legislativas",
    description:
      "Suscríbete a las iniciativas legislativas que te interesan y recibe notificaciones cuando haya novedades. Mantente al día sin esfuerzo.",
  },
];

const BRAND = "#5C6CFA";

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { setHasSeenOnboarding } = usePreferencesStore();

  const isLast = currentIndex === SLIDES.length - 1;

  async function handleNext() {
    if (isLast) {
      await setHasSeenOnboarding();
      router.replace("/(auth)");
    } else {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    }
  }

  async function handleSkip() {
    await setHasSeenOnboarding();
    router.replace("/(auth)");
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      {/* Skip button */}
      <View className="h-10 justify-center items-end px-6">
        {!isLast && (
          <Pressable onPress={handleSkip} className="active:opacity-60">
            <Text className="text-neutral-400 text-sm">Omitir</Text>
          </Pressable>
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View
            style={{ width }}
            className="flex-1 items-center justify-center px-10"
          >
            {/* Visual area */}
            <Image
              source={item.image}
              style={{ width: width * 0.78, height: width * 0.78 }}
              resizeMode="contain"
            />

            <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 text-center mt-6 mb-3">
              {item.title}
            </Text>
            <Text className="text-base text-neutral-500 dark:text-neutral-400 text-center leading-6">
              {item.description}
            </Text>
          </View>
        )}
      />

      {/* Dots + CTA */}
      <View className="px-6 pb-10 gap-6">
        {/* Pagination dots */}
        <View className="flex-row justify-center items-center gap-2">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === currentIndex ? BRAND : "#D1D5DB",
              }}
            />
          ))}
        </View>

        {/* Main button */}
        <Pressable
          onPress={handleNext}
          className="w-full rounded-2xl py-4 items-center active:opacity-85"
          style={{ backgroundColor: BRAND }}
        >
          <Text className="text-white text-base font-semibold">
            {isLast ? "Empezar" : "Siguiente"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
