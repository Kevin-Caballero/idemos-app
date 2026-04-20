import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Initiative } from "./use-feed";

export interface InitiativeStep {
  id: string;
  stepType: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  orderIndex: number;
}

export interface InitiativeLink {
  id: string;
  linkType: "BOCG" | "DS" | "OTHER";
  url: string;
  label: string | null;
}

export interface InitiativeDetail extends Initiative {
  steps: InitiativeStep[];
  links: InitiativeLink[];
}

export function useInitiative(id: string) {
  return useQuery<InitiativeDetail>({
    queryKey: ["initiative", id],
    queryFn: () => apiFetch<InitiativeDetail>(`/initiatives/${id}`),
    enabled: !!id,
  });
}
