import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { FeedPage, InitiativeType } from "./use-feed";

const LIMIT = 20;

export interface SearchParams {
  query: string;
  type?: InitiativeType;
  status?: string; // comma-separated ILIKE patterns
  dateFrom?: string; // ISO yyyy-mm-dd
  dateTo?: string; // ISO yyyy-mm-dd
}

export function useSearch(params: SearchParams) {
  const { query, type, status, dateFrom, dateTo } = params;
  const hasQuery = query.trim().length > 0;
  const hasFilters = !!(type || status || dateFrom || dateTo);

  return useInfiniteQuery<FeedPage>({
    queryKey: ["search", query, type, status, dateFrom, dateTo],
    queryFn: ({ pageParam }) => {
      const page = (pageParam as number) ?? 1;
      const urlParams = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      });
      if (query.trim()) urlParams.set("q", query.trim());
      if (type) urlParams.set("type", type);
      if (status) urlParams.set("status", status);
      if (dateFrom) urlParams.set("dateFrom", dateFrom);
      if (dateTo) urlParams.set("dateTo", dateTo);
      return apiFetch<FeedPage>(`/search?${urlParams.toString()}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const fetched =
        (lastPage.page - 1) * lastPage.limit + lastPage.data.length;
      return fetched < lastPage.total ? lastPage.page + 1 : undefined;
    },
    enabled: hasQuery || hasFilters,
  });
}
