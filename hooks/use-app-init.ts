import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

/**
 * Hook de inicialización de la app. Carga los tokens desde SecureStore al montar
 * y expone `isLoading` e `isAuthenticated` para que el layout raíz pueda
 * decidir si redirigir al usuario al área autenticada o al login.
 */
export function useAppInit() {
  const { isAuthenticated, isLoading, loadTokens } = useAuthStore();

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  return { isAuthenticated, isLoading };
}
