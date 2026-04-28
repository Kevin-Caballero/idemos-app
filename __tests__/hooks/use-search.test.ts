import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useSearch } from "@/hooks/use-search";
import { apiFetch } from "@/lib/api";
import type { FeedPage } from "@/hooks/use-feed";
import { mockInitiative } from "../fixtures/initiative";

jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
}));

const mockApiFetch = apiFetch as jest.Mock;

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockPage: FeedPage = {
  data: [mockInitiative],
  total: 1,
  page: 1,
  limit: 20,
};

describe("useSearch", () => {
  beforeEach(() => jest.clearAllMocks());

  it("does not fetch when query is empty and no filters", () => {
    renderHook(() => useSearch({ query: "" }), { wrapper: makeWrapper() });
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it("does not fetch when query is only whitespace and no filters", () => {
    renderHook(() => useSearch({ query: "   " }), { wrapper: makeWrapper() });
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it("fetches when only a type filter is set (no query)", async () => {
    mockApiFetch.mockResolvedValueOnce(mockPage);

    const { result } = renderHook(
      () => useSearch({ query: "", type: "Proyecto" }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("type=Proyecto"),
    );
  });

  it("fetches when only a status filter is set (no query)", async () => {
    mockApiFetch.mockResolvedValueOnce(mockPage);

    const { result } = renderHook(
      () => useSearch({ query: "", status: "aprobad" }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("status=aprobad"),
    );
  });

  it("fetches with correct URL when query is provided", async () => {
    mockApiFetch.mockResolvedValueOnce(mockPage);

    const { result } = renderHook(() => useSearch({ query: "presupuestos" }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("q=presupuestos"),
    );
  });

  it("includes page and limit params in URL", async () => {
    mockApiFetch.mockResolvedValueOnce(mockPage);

    const { result } = renderHook(() => useSearch({ query: "ley" }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("page=1"),
    );
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("limit=20"),
    );
  });

  it("includes type filter in URL when provided", async () => {
    mockApiFetch.mockResolvedValueOnce(mockPage);

    const { result } = renderHook(
      () => useSearch({ query: "ley", type: "Proyecto" }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("type=Proyecto"),
    );
  });

  it("does not include type in URL when not provided", async () => {
    mockApiFetch.mockResolvedValueOnce(mockPage);

    const { result } = renderHook(() => useSearch({ query: "ley" }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.not.stringContaining("type="),
    );
  });

  it("includes status filter in URL when provided", async () => {
    mockApiFetch.mockResolvedValueOnce(mockPage);

    const { result } = renderHook(
      () => useSearch({ query: "ley", status: "aprobad,rechazad" }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("status=aprobad"),
    );
  });

  it("includes dateFrom and dateTo in URL when provided", async () => {
    mockApiFetch.mockResolvedValueOnce(mockPage);

    const { result } = renderHook(
      () =>
        useSearch({
          query: "ley",
          dateFrom: "2024-01-01",
          dateTo: "2024-12-31",
        }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("dateFrom=2024-01-01"),
    );
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("dateTo=2024-12-31"),
    );
  });

  it("returns data on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockPage);

    const { result } = renderHook(() => useSearch({ query: "presupuestos" }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].data).toHaveLength(1);
    expect(result.current.data?.pages[0].data[0].id).toBe(mockInitiative.id);
  });

  it("returns empty data array when no results", async () => {
    const emptyPage: FeedPage = { data: [], total: 0, page: 1, limit: 20 };
    mockApiFetch.mockResolvedValueOnce(emptyPage);

    const { result } = renderHook(() => useSearch({ query: "xyznotfound" }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].data).toHaveLength(0);
  });

  it("sets isError on fetch failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useSearch({ query: "ley" }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("getNextPageParam returns undefined when all results fetched", async () => {
    const singlePage: FeedPage = {
      data: [mockInitiative],
      total: 1,
      page: 1,
      limit: 20,
    };
    mockApiFetch.mockResolvedValueOnce(singlePage);

    const { result } = renderHook(() => useSearch({ query: "ley" }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it("getNextPageParam returns next page when more results exist", async () => {
    const firstPage: FeedPage = {
      data: Array(20).fill(mockInitiative),
      total: 40,
      page: 1,
      limit: 20,
    };
    mockApiFetch.mockResolvedValueOnce(firstPage);

    const { result } = renderHook(() => useSearch({ query: "ley" }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });
});
