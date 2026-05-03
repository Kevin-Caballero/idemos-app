import { useState, useCallback } from "react";
import { useFeed, type Initiative, type InitiativeType } from "./use-feed";

/**
 * Hook de presentación para la pantalla del feed.
 * Separa la lógica de estado (tipo de filtro, paginación) del componente
 * de vista para facilitar el testeo y mantener los screens delgados.
 */
export function useFeedScreen() {
  const [type, setType] = useState<InitiativeType | undefined>(undefined);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useFeed(type);

  const initiatives: Initiative[] = data?.pages.flatMap((p) => p.data) ?? [];

  const handleTypeSelect = useCallback(
    (selected: InitiativeType | undefined) => {
      setType(selected);
    },
    [],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    type,
    initiatives,
    isLoading,
    isError,
    isFetchingNextPage,
    refetch,
    handleTypeSelect,
    handleEndReached,
  };
}
