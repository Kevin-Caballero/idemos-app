import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface FollowResult {
  following: boolean;
}

/**
 * Comprueba si el usuario sigue una iniciativa concreta.
 */
export function useIsFollowing(initiativeId: string) {
  return useQuery<FollowResult>({
    queryKey: ["follow", initiativeId],
    queryFn: () =>
      apiFetch<FollowResult>(`/initiatives/${initiativeId}/follow`),
    enabled: !!initiativeId,
  });
}

/**
 * Activa o desactiva el seguimiento de una iniciativa.
 * Tras el toggle invalida la query de estado individual y la lista completa
 * de iniciativas seguidas para mantener la UI sincronizada.
 */
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
