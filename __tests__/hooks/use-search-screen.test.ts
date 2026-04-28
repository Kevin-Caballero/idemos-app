import { renderHook, act } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useSearchScreen } from "@/hooks/use-search-screen";

jest.mock("@/lib/api", () => ({
  apiFetch: jest
    .fn()
    .mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 }),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("useSearchScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("initializes with empty state", () => {
    const { result } = renderHook(() => useSearchScreen(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.inputValue).toBe("");
    expect(result.current.debouncedQuery).toBe("");
    expect(result.current.filterOpen).toBe(false);
    expect(result.current.draftType).toBeUndefined();
    expect(result.current.draftStatuses.size).toBe(0);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.results).toEqual([]);
  });

  it("updates inputValue immediately on setInputValue", () => {
    const { result } = renderHook(() => useSearchScreen(), {
      wrapper: makeWrapper(),
    });

    act(() => result.current.setInputValue("test"));

    expect(result.current.inputValue).toBe("test");
  });

  it("does not update debouncedQuery before debounce delay", () => {
    const { result } = renderHook(() => useSearchScreen(), {
      wrapper: makeWrapper(),
    });

    act(() => result.current.setInputValue("test"));
    act(() => jest.advanceTimersByTime(200));

    expect(result.current.debouncedQuery).toBe("");
  });

  it("updates debouncedQuery after debounce delay", () => {
    const { result } = renderHook(() => useSearchScreen(), {
      wrapper: makeWrapper(),
    });

    act(() => result.current.setInputValue("test"));
    act(() => jest.advanceTimersByTime(350));

    expect(result.current.debouncedQuery).toBe("test");
  });

  it("only debounces to the last value when typing quickly", () => {
    const { result } = renderHook(() => useSearchScreen(), {
      wrapper: makeWrapper(),
    });

    act(() => result.current.setInputValue("t"));
    act(() => jest.advanceTimersByTime(100));
    act(() => result.current.setInputValue("te"));
    act(() => jest.advanceTimersByTime(100));
    act(() => result.current.setInputValue("tes"));
    act(() => jest.advanceTimersByTime(350));

    expect(result.current.debouncedQuery).toBe("tes");
  });

  it("clears both inputValue and debouncedQuery on handleClear", () => {
    const { result } = renderHook(() => useSearchScreen(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.setInputValue("legislación");
      jest.advanceTimersByTime(350);
    });
    act(() => result.current.handleClear());

    expect(result.current.inputValue).toBe("");
    expect(result.current.debouncedQuery).toBe("");
  });

  it("toggles filterOpen on toggleFilter", () => {
    const { result } = renderHook(() => useSearchScreen(), {
      wrapper: makeWrapper(),
    });

    act(() => result.current.toggleFilter());
    expect(result.current.filterOpen).toBe(true);

    act(() => result.current.toggleFilter());
    expect(result.current.filterOpen).toBe(false);
  });

  it("toggleDraftType sets and unsets draft type", () => {
    const { result } = renderHook(() => useSearchScreen(), {
      wrapper: makeWrapper(),
    });

    act(() => result.current.toggleDraftType("Proyecto"));
    expect(result.current.draftType).toBe("Proyecto");

    act(() => result.current.toggleDraftType("Proyecto"));
    expect(result.current.draftType).toBeUndefined();
  });

  it("toggleDraftType switches between types", () => {
    const { result } = renderHook(() => useSearchScreen(), {
      wrapper: makeWrapper(),
    });

    act(() => result.current.toggleDraftType("Proyecto"));
    act(() => result.current.toggleDraftType("Proposicion"));

    expect(result.current.draftType).toBe("Proposicion");
  });

  it("toggleDraftStatus adds and removes status patterns", () => {
    const { result } = renderHook(() => useSearchScreen(), {
      wrapper: makeWrapper(),
    });

    act(() => result.current.toggleDraftStatus("aprobad"));
    expect(result.current.draftStatuses.has("aprobad")).toBe(true);

    act(() => result.current.toggleDraftStatus("aprobad"));
    expect(result.current.draftStatuses.has("aprobad")).toBe(false);
  });

  it("handleApply commits draft state and closes panel", () => {
    const { result } = renderHook(() => useSearchScreen(), {
      wrapper: makeWrapper(),
    });

    act(() => result.current.toggleFilter());
    act(() => result.current.toggleDraftType("Proyecto"));
    act(() => result.current.toggleDraftStatus("aprobad"));
    act(() => result.current.setDraftDateFrom("01/01/2024"));
    act(() => result.current.setDraftDateTo("31/12/2024"));
    act(() => result.current.handleApply());

    expect(result.current.filterOpen).toBe(false);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("handleClearFilters resets all draft and applied state", () => {
    const { result } = renderHook(() => useSearchScreen(), {
      wrapper: makeWrapper(),
    });

    act(() => result.current.toggleDraftType("Proposicion"));
    act(() => result.current.toggleDraftStatus("rechazad"));
    act(() => result.current.handleApply());
    act(() => result.current.handleClearFilters());

    expect(result.current.draftType).toBeUndefined();
    expect(result.current.draftStatuses.size).toBe(0);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filterOpen).toBe(false);
  });

  it("hasActiveFilters is false before applying any filters", () => {
    const { result } = renderHook(() => useSearchScreen(), {
      wrapper: makeWrapper(),
    });

    act(() => result.current.toggleDraftType("Proyecto"));

    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("hasActiveFilters is true after applying filters", () => {
    const { result } = renderHook(() => useSearchScreen(), {
      wrapper: makeWrapper(),
    });

    act(() => result.current.toggleDraftType("Proyecto"));
    act(() => result.current.handleApply());

    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("exposes all required fields", () => {
    const { result } = renderHook(() => useSearchScreen(), {
      wrapper: makeWrapper(),
    });

    expect(result.current).toMatchObject({
      inputValue: expect.any(String),
      debouncedQuery: expect.any(String),
      filterOpen: expect.any(Boolean),
      hasActiveFilters: expect.any(Boolean),
      results: expect.any(Array),
      isLoading: expect.any(Boolean),
      isError: expect.any(Boolean),
      isFetchingNextPage: expect.any(Boolean),
      toggleFilter: expect.any(Function),
      toggleDraftType: expect.any(Function),
      toggleDraftStatus: expect.any(Function),
      handleApply: expect.any(Function),
      handleClearFilters: expect.any(Function),
      handleEndReached: expect.any(Function),
      handleClear: expect.any(Function),
      setInputValue: expect.any(Function),
      refetch: expect.any(Function),
    });
  });
});
