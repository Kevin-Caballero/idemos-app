import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

export function useAppInit() {
  const { isAuthenticated, isLoading, loadTokens } = useAuthStore();

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  return { isAuthenticated, isLoading };
}
