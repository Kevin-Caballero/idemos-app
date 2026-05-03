import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind resolviendo conflictos con tailwind-merge.
 * Envuelve clsx + twMerge para usarse como utilidad estándar en toda la app.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
