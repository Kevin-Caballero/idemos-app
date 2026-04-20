import { useState, useCallback, useEffect } from "react";
import { useSearch, type SearchParams } from "./use-search";
import type { Initiative, InitiativeType } from "./use-feed";

const DEBOUNCE_MS = 350;

export const STATUS_OPTIONS = [
  { label: "En tramitación", pattern: "trámite" },
  { label: "En comisión", pattern: "comis" },
  { label: "En pleno", pattern: "pleno" },
  { label: "Aprobado", pattern: "aprobad" },
  { label: "Rechazado", pattern: "rechazad" },
] as const;

export type StatusPattern = (typeof STATUS_OPTIONS)[number]["pattern"];

function toISO(ddmmyyyy: string): string | undefined {
  const match = ddmmyyyy.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

interface AppliedFilters {
  type: InitiativeType | undefined;
  statuses: Set<string>;
  dateFrom: string;
  dateTo: string;
  votedOnly: boolean;
}

const EMPTY_FILTERS: AppliedFilters = {
  type: undefined,
  statuses: new Set(),
  dateFrom: "",
  dateTo: "",
  votedOnly: false,
};

export function useSearchScreen() {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const [draftType, setDraftType] = useState<InitiativeType | undefined>(
    undefined,
  );
  const [draftStatuses, setDraftStatuses] = useState<Set<string>>(new Set());
  const [draftDateFrom, setDraftDateFrom] = useState("");
  const [draftDateTo, setDraftDateTo] = useState("");
  const [draftVotedOnly, setDraftVotedOnly] = useState(false);

  const [applied, setApplied] = useState<AppliedFilters>(EMPTY_FILTERS);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(inputValue), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const appliedStatus =
    applied.statuses.size > 0
      ? Array.from(applied.statuses).join(",")
      : undefined;

  const searchParams: SearchParams = {
    query: debouncedQuery,
    type: applied.type,
    status: appliedStatus,
    dateFrom: applied.dateFrom ? toISO(applied.dateFrom) : undefined,
    dateTo: applied.dateTo ? toISO(applied.dateTo) : undefined,
    votedOnly: applied.votedOnly || undefined,
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useSearch(searchParams);

  const results: Initiative[] = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const toggleFilter = useCallback(() => setFilterOpen((v) => !v), []);

  const toggleDraftType = useCallback((t: InitiativeType) => {
    setDraftType((prev) => (prev === t ? undefined : t));
  }, []);

  const toggleDraftStatus = useCallback((pattern: string) => {
    setDraftStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(pattern)) next.delete(pattern);
      else next.add(pattern);
      return next;
    });
  }, []);

  const handleApply = useCallback(() => {
    setApplied({
      type: draftType,
      statuses: new Set(draftStatuses),
      dateFrom: draftDateFrom,
      dateTo: draftDateTo,
      votedOnly: draftVotedOnly,
    });
    setFilterOpen(false);
  }, [draftType, draftStatuses, draftDateFrom, draftDateTo, draftVotedOnly]);

  const handleClearFilters = useCallback(() => {
    setDraftType(undefined);
    setDraftStatuses(new Set());
    setDraftDateFrom("");
    setDraftDateTo("");
    setDraftVotedOnly(false);
    setApplied(EMPTY_FILTERS);
    setFilterOpen(false);
  }, []);

  const handleClear = useCallback(() => {
    setInputValue("");
    setDebouncedQuery("");
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const hasActiveFilters =
    !!applied.type ||
    applied.statuses.size > 0 ||
    !!applied.dateFrom ||
    !!applied.dateTo ||
    applied.votedOnly;

  return {
    inputValue,
    setInputValue,
    debouncedQuery,
    filterOpen,
    toggleFilter,
    draftType,
    toggleDraftType,
    draftStatuses,
    toggleDraftStatus,
    draftDateFrom,
    setDraftDateFrom,
    draftDateTo,
    setDraftDateTo,
    draftVotedOnly,
    setDraftVotedOnly,
    handleApply,
    handleClearFilters,
    handleClear,
    handleEndReached,
    results,
    total,
    isLoading,
    isError,
    isFetchingNextPage,
    refetch,
    hasActiveFilters,
  };
}
