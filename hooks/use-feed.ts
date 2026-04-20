import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type InitiativeType = "Proyecto" | "Proposicion";
export type VoteChoice = "SI" | "NO" | "ABST";

export interface Initiative {
  id: string;
  source: string;
  legislature: string;
  type: InitiativeType;
  expediente: string;
  title: string;
  author: string;
  procedureType: string;
  currentStatus: string;
  committee: string | null;
  presentedAt: string;
  qualifiedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  votedChoice: VoteChoice | null;
}

export interface FeedPage {
  data: Initiative[];
  total: number;
  page: number;
  limit: number;
}

const LIMIT = 20;

export function useFeed(type?: InitiativeType) {
  return useInfiniteQuery<FeedPage>({
    queryKey: ["feed", type],
    queryFn: ({ pageParam }) => {
      const page = (pageParam as number) ?? 1;
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      });
      if (type) params.set("type", type);
      return apiFetch<FeedPage>(`/feed?${params.toString()}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const fetched =
        (lastPage.page - 1) * lastPage.limit + lastPage.data.length;
      return fetched < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });
}
