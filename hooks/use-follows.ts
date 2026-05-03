import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { InitiativeType } from "@/hooks/use-feed";

export interface FollowedInitiative {
  id: string;
  title: string;
  type: InitiativeType;
  expediente: string;
  currentStatus: string;
  presentedAt: string;
  followedAt: string;
}

/**
 * Recupera la lista completa de iniciativas que sigue el usuario autenticado.
 */
export function useFollows() {
  return useQuery<FollowedInitiative[]>({
    queryKey: ["follows"],
    queryFn: () => apiFetch<FollowedInitiative[]>("/follows"),
  });
}
