import { create } from "zustand";
import type { VoteChoice } from "@/hooks/use-vote";

interface VoteState {
  optimisticVotes: Record<string, VoteChoice>;

  setOptimisticVote: (initiativeId: string, choice: VoteChoice) => void;
  clearOptimisticVote: (initiativeId: string) => void;
}

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
