import { create } from "zustand";
import type { VoteChoice } from "@/hooks/use-vote";

/**
 * Cache de votos optimistas en memoria.
 * Cuando el usuario emite un voto, se registra aquí de forma inmediata
 * mientras la mutación viaja al servidor, evitando un parpadeo visual
 * en la UI hasta que React Query confirma o revierte el cambio.
 */
interface VoteState {
  optimisticVotes: Record<string, VoteChoice>;

  setOptimisticVote: (initiativeId: string, choice: VoteChoice) => void;
  clearOptimisticVote: (initiativeId: string) => void;
}

/**
 * Store de votos optimistas. Permite que la UI muestre la elección del usuario
 * antes de recibir confirmación del servidor.
 */
export const useVoteStore = create<VoteState>()((set) => ({
  optimisticVotes: {},

  setOptimisticVote: (initiativeId, choice) =>
    set((state) => ({
      optimisticVotes: { ...state.optimisticVotes, [initiativeId]: choice },
    })),

  clearOptimisticVote: (initiativeId) =>
    set((state) => {
      const next = { ...state.optimisticVotes };
      delete next[initiativeId];
      return { optimisticVotes: next };
    }),
}));
