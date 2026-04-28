import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface FollowResult {
  following: boolean;
}

export function useIsFollowing(initiativeId: string) {
  return useQuery<FollowResult>({
    queryKey: ["follow", initiativeId],
    queryFn: () =>
      apiFetch<FollowResult>(`/initiatives/${initiativeId}/follow`),
    enabled: !!initiativeId,
  });
}

export function useToggleFollow(initiativeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<FollowResult>(`/initiatives/${initiativeId}/follow`, {
        method: "POST",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["follow", initiativeId],
      });
      void queryClient.invalidateQueries({ queryKey: ["follows"] });
    },
  });
}
