import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useVoteStore } from "@/store/vote.store";

export type VoteChoice = "SI" | "NO" | "ABST";

export interface UserVote {
  id: string;
  initiativeId: string;
  choice: VoteChoice;
  createdAt: string;
}

export interface VoteStats {
  si: number;
  no: number;
  abst: number;
  total: number;
  officialYes: number | null;
  officialNo: number | null;
  officialAbst: number | null;
  officialVotedAt: string | null;
}

/**
 * Recupera el voto actual del usuario para una iniciativa concreta.
 * `retry: false` evita reintentos innecesarios cuando el usuario aún no ha votado
 * (el servidor devuelve null, no un error).
 */
export function useUserVote(initiativeId: string) {
  return useQuery<UserVote | null>({
    queryKey: ["vote", initiativeId],
    queryFn: () =>
      apiFetch<UserVote | null>(`/initiatives/${initiativeId}/vote`),
    enabled: !!initiativeId,
    retry: false,
  });
}

/**
 * Recupera las estadísticas de votación ciudadana y el resultado oficial del Congreso
 * para una iniciativa, combinados en un único objeto `VoteStats`.
 */
export function useVoteStats(initiativeId: string) {
  return useQuery<VoteStats>({
    queryKey: ["vote-stats", initiativeId],
    queryFn: () =>
      apiFetch<VoteStats>(`/initiatives/${initiativeId}/vote/stats`),
    enabled: !!initiativeId,
  });
}

/**
 * Hook para emitir o cambiar un voto sobre una iniciativa.
 * Implementa UI optimista: actualiza el store local antes de recibir la respuesta
 * del servidor y lo revierte en caso de error. Al tener éxito, invalida las
 * queries de voto, estadísticas, feed y búsqueda para reflejar el cambio en toda la app.
 */
export function useCastVote(initiativeId: string) {
  const queryClient = useQueryClient();
  const { setOptimisticVote, clearOptimisticVote } = useVoteStore.getState();

  return useMutation({
    mutationFn: (choice: VoteChoice) =>
      apiFetch<UserVote>(`/initiatives/${initiativeId}/vote`, {
        method: "POST",
        body: JSON.stringify({ choice }),
      }),
    onMutate: (choice) => {
      setOptimisticVote(initiativeId, choice);
    },
    onError: (_err, _choice, _ctx) => {
      clearOptimisticVote(initiativeId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vote", initiativeId] });
      void queryClient.invalidateQueries({
        queryKey: ["vote-stats", initiativeId],
      });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["search"] });
    },
  });
}
