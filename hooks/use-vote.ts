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

export function useUserVote(initiativeId: string) {
  return useQuery<UserVote | null>({
    queryKey: ["vote", initiativeId],
    queryFn: () =>
      apiFetch<UserVote | null>(`/initiatives/${initiativeId}/vote`),
    enabled: !!initiativeId,
    retry: false,
  });
}

export function useVoteStats(initiativeId: string) {
  return useQuery<VoteStats>({
    queryKey: ["vote-stats", initiativeId],
    queryFn: () =>
      apiFetch<VoteStats>(`/initiatives/${initiativeId}/vote/stats`),
    enabled: !!initiativeId,
  });
}

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
