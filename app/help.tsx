import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

// ─── data ────────────────────────────────────────────────────────────────────

const CARD_FIELDS = [
  {
    icon: "pricetag-outline" as const,
    label: "Tipo",
    description:
      "Indica si la iniciativa es un Proyecto de Ley (impulsado por el Gobierno) o una Proposición de Ley (presentada por grupos parlamentarios, el Senado, asambleas autonómicas o ciudadanos).",
  },
  {
    icon: "barcode-outline" as const,
    label: "Número de expediente",
    description:
      "Identificador único asignado por el Congreso al registrar la iniciativa. Permite localizarla en el Diario Oficial y en la web del Congreso. Formato: legislatura/número/año.",
  },
  {
    icon: "people-outline" as const,
    label: "Autor",
    description:
      "Grupo parlamentario, entidad o ciudadanos que presentan la iniciativa. En los proyectos de ley el autor siempre es el Gobierno.",
  },
  {
    icon: "git-branch-outline" as const,
    label: "Procedimiento",
    description:
      "Indica la vía de tramitación: Pleno (se debate ante todos los diputados), Comisión (grupo especializado), Lectura única, etc.",
  },
  {
    icon: "radio-button-on-outline" as const,
    label: "Estado",
    description:
      "Fase actual de la iniciativa dentro del proceso legislativo. Cambia a medida que avanza (o se detiene) su tramitación.",
  },
  {
    icon: "business-outline" as const,
    label: "Comisión",
    description:
      "Comisión parlamentaria encargada de estudiar la iniciativa. Cada comisión tiene competencias sobre una materia (Hacienda, Sanidad, Justicia, etc.).",
  },
  {
    icon: "calendar-outline" as const,
    label: "Fecha de presentación",
    description:
      "Día en que la iniciativa fue registrada en el Congreso. A partir de ese momento comienza el cómputo de plazos para su admisión.",
  },
];

const TYPES = [
  {
    name: "Proyecto de Ley",
    color: BrandColors.primary,
    description:
      "Elaborado por el Consejo de Ministros y enviado al Congreso. Tiene prioridad en el orden del día y suele contar con respaldo de la mayoría gubernamental.",
  },
  {
    name: "Proposición de Ley",
    color: BrandColors.secondary,
    description:
      "Presentada por un grupo parlamentario, el Senado, una asamblea autonómica o 500.000 firmas ciudadanas. Para tramitarse necesita que el Pleno la tome en consideración.",
  },
  {
    name: "Proposición No de Ley",
    color: "#F59E0B",
    description:
      "Declaración de intenciones o insta al Gobierno a actuar. No crea obligaciones jurídicas: si se aprueba, el Gobierno debe tenerla en cuenta pero no está obligado a cumplirla.",
  },
  {
    name: "Moción",
    color: "#8B5CF6",
    description:
      "Proposición presentada por un grupo parlamentario al finalizar el debate de una interpelación al Gobierno. Si se aprueba, obliga al Gobierno a pronunciarse.",
  },
];

const STATUSES = [
  {
    label: "Presentada / Registrada",
    dot: "#6B7280",
    description:
      "La iniciativa ha sido entregada en el Registro del Congreso pero aún no ha sido examinada por la Mesa.",
  },
  {
    label: "Calificada",
    dot: "#3B82F6",
    description:
      "La Mesa del Congreso ha admitido la iniciativa a trámite y la ha enviado a la comisión competente.",
  },
  {
    label: "Toma en consideración",
    dot: "#F59E0B",
    description:
      "El Pleno vota si la Cámara quiere tramitar la Proposición. Solo aplicable a proposiciones de ley; los proyectos del Gobierno no necesitan este paso.",
  },
  {
    label: "En Comisión / Ponencia",
    dot: "#F59E0B",
    description:
      "Un grupo reducido de diputados (ponencia) estudia el texto, valora las enmiendas y redacta un informe para la comisión.",
  },
  {
    label: "En Pleno",
    dot: "#8B5CF6",
    description:
      "El texto llega al hemiciclo para debate y votación final por todos los diputados.",
  },
  {
    label: "En el Senado",
    dot: "#8B5CF6",
    description:
      "El Congreso ha aprobado el texto y lo remite al Senado, que puede aprobarlo, enmendarlo o vetarlo.",
  },
  {
    label: "Aprobada",
    dot: "#10B981",
    description:
      "La iniciativa ha superado todos los trámites parlamentarios. Si es una ley, pasa a publicarse en el BOE.",
  },
  {
    label: "Rechazada",
    dot: "#EF4444",
    description: "El Pleno no ha obtenido mayoría suficiente para aprobarla.",
  },
  {
    label: "Caducada",
    dot: "#EF4444",
    description:
      "La legislatura ha terminado sin que la iniciativa concluyera su tramitación. Puede re-presentarse en la siguiente legislatura.",
  },
  {
    label: "Retirada",
    dot: "#EF4444",
    description:
      "El grupo proponente ha decidido retirarla antes de su votación.",
  },
  {
    label: "Inadmitida",
    dot: "#EF4444",
    description:
      "La Mesa ha rechazado su tramitación por razones de forma o competencia.",
  },
];

const GLOSSARY = [
  {
    term: "Expediente",
    definition:
      "Número de identificación único de cada iniciativa en el Congreso. Permite rastrearla en el Diario de Sesiones y la web oficial.",
  },
  {
    term: "Legislatura",
    definition:
      "Período de actividad parlamentaria que corresponde a cada mandato de las Cortes Generales (normalmente 4 años). Las iniciativas caducan al terminar la legislatura en que fueron presentadas.",
  },
  {
    term: "Mesa del Congreso",
    definition:
      "Órgano de gobierno del Congreso formado por el Presidente/a y varios vicepresidentes. Califica las iniciativas y decide si son admitidas a trámite.",
  },
  {
    term: "Pleno",
    definition:
      "Sesión en la que participan todos los diputados y diputadas en el hemiciclo. Es el máximo órgano decisorio de la Cámara.",
  },
  {
    term: "Comisión",
    definition:
      "Grupo de diputados especializados en una materia concreta (Hacienda, Sanidad, Justicia…). Estudia y debate los proyectos antes de que lleguen al Pleno.",
  },
  {
    term: "Ponencia",
    definition:
      "Subgrupo de la comisión designado para examinar en detalle el texto de una ley, valorar las enmiendas presentadas y redactar un informe.",
  },
  {
    term: "Enmienda",
    definition:
      "Propuesta de modificación al texto de una iniciativa. Puede ser a la totalidad (rechazo global) o parcial (cambios concretos en artículos).",
  },
  {
    term: "Veto del Senado",
    definition:
      "Rechazo del Senado a un proyecto aprobado por el Congreso. El Congreso puede levantarlo por mayoría absoluta, o por mayoría simple dos meses después.",
  },
  {
    term: "Grupo parlamentario",
    definition:
      "Agrupación de diputados con afinidad política. Se necesitan al menos 15 diputados para formar uno. Son los actores principales en la presentación de enmiendas y proposiciones.",
  },
  {
    term: "BOE",
    definition:
      "Boletín Oficial del Estado. Publicación oficial donde se promulgan las leyes aprobadas por las Cortes y sancionadas por el Rey.",
  },
  {
    term: "Interpelación",
    definition:
      "Pregunta formal de un grupo parlamentario al Gobierno sobre su política general en alguna materia. Puede dar lugar a una moción.",
  },
  {
    term: "Lectura única",
    definition:
      "Procedimiento abreviado para iniciativas poco conflictivas: se debate y vota directamente en Pleno sin pasar por comisión.",
  },
];

// ─── sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-4 mb-2 mt-2">
      {children}
    </Text>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden mx-4 mb-6">
      {children}
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-neutral-100 dark:bg-neutral-800 mx-4" />;
}

function AccordionItem({
  title,
  subtitle,
  accentColor,
  dotColor,
  children,
  iconColor,
}: {
  title: string;
  subtitle?: string;
  accentColor?: string;
  dotColor?: string;
  children: string;
  iconColor: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable onPress={() => setOpen((v) => !v)} className="active:opacity-70">
      <View className="flex-row items-center px-4 py-3.5 gap-3">
        {dotColor && (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: dotColor,
              flexShrink: 0,
            }}
          />
        )}
        {accentColor && (
          <View
            style={{
              width: 4,
              borderRadius: 2,
              alignSelf: "stretch",
              backgroundColor: accentColor,
              flexShrink: 0,
            }}
          />
        )}
        <View className="flex-1">
          <Text className="text-base font-medium text-neutral-900 dark:text-neutral-100">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-xs text-neutral-400 mt-0.5">{subtitle}</Text>
          )}
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={iconColor}
        />
      </View>
      {open && (
        <View className="px-4 pb-4">
          <Text className="text-sm text-neutral-600 dark:text-neutral-400 leading-5">
            {children}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── screen ──────────────────────────────────────────────────────────────────

export default function HelpScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <SafeAreaView
      className="flex-1 bg-neutral-100 dark:bg-neutral-950"
      edges={["top"]}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-4 gap-3">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 items-center justify-center active:opacity-70"
        >
          <Ionicons name="arrow-back" size={20} color={iconColor} />
        </Pressable>
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Guía de uso
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── ¿Qué es una iniciativa? ── */}
        <SectionTitle>¿Qué es una iniciativa?</SectionTitle>
        <Card>
          <View className="px-4 py-4">
            <Text className="text-sm text-neutral-600 dark:text-neutral-400 leading-5">
              Una iniciativa legislativa es cualquier propuesta de ley que entra
              en el Congreso de los Diputados. Puede provenir del Gobierno, de
              los grupos parlamentarios, del Senado, de las comunidades
              autónomas o de los propios ciudadanos mediante la Iniciativa
              Legislativa Popular.
            </Text>
          </View>
        </Card>

        {/* ── Campos de la tarjeta ── */}
        <SectionTitle>Qué significa cada campo</SectionTitle>
        <Card>
          {CARD_FIELDS.map((field, i) => (
            <View key={field.label}>
              <AccordionItem
                title={field.label}
                subtitle={undefined}
                iconColor={iconColor}
              >
                {field.description}
              </AccordionItem>
              {i < CARD_FIELDS.length - 1 && <Divider />}
            </View>
          ))}
        </Card>

        {/* ── Tipos de iniciativa ── */}
        <SectionTitle>Tipos de iniciativa</SectionTitle>
        <Card>
          {TYPES.map((t, i) => (
            <View key={t.name}>
              <AccordionItem
                title={t.name}
                accentColor={t.color}
                iconColor={iconColor}
              >
                {t.description}
              </AccordionItem>
              {i < TYPES.length - 1 && <Divider />}
            </View>
          ))}
        </Card>

        {/* ── Estados ── */}
        <SectionTitle>Estados del proceso legislativo</SectionTitle>
        <Card>
          {STATUSES.map((s, i) => (
            <View key={s.label}>
              <AccordionItem
                title={s.label}
                dotColor={s.dot}
                iconColor={iconColor}
              >
                {s.description}
              </AccordionItem>
              {i < STATUSES.length - 1 && <Divider />}
            </View>
          ))}
        </Card>

        {/* ── Glosario ── */}
        <SectionTitle>Glosario de términos</SectionTitle>
        <Card>
          {GLOSSARY.map((g, i) => (
            <View key={g.term}>
              <AccordionItem title={g.term} iconColor={iconColor}>
                {g.definition}
              </AccordionItem>
              {i < GLOSSARY.length - 1 && <Divider />}
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
