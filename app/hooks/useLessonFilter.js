import { useState, useEffect } from "react";
import { useFetcherWithReset } from "./useFetcherWithReset";
import { deepEqual } from "../helper/dataHelper";

export default function useDocumentFilter(
  initialData = null,
  endpoint = null,
  initialPage = 1,
  initialLimit = 20,
  initialFilters = {},
  key = ""
) {
  const fetcher = useFetcherWithReset();

  // initData là bản gốc (loader)
  const [initData, setInitData] = useState(initialData);

  // data là bản hiển thị (sẽ cập nhật khi fetcher có dữ liệu mới)
  const [data, setData] = useState(initialData);

  const [activeFilters, setActiveFilters] = useState({
    searchText: initialFilters.searchText || "",
    dateRange: initialFilters.dateRange || "all",
    dateFrom: initialFilters.dateFrom || "",
    dateTo: initialFilters.dateTo || "",
    sortBy: initialFilters.sortBy || "createdAt-desc",
    owner: initialFilters.owner || "",
  });

  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
  });

  const isLoading = fetcher.state !== "idle";

  // ⚡ Khi initialData thay đổi (VD: điều hướng Remix)
  useEffect(() => {
    setInitData(initialData);
    setData(initialData);
    setActiveFilters({
      searchText: initialFilters.searchText || "",
      dateRange: initialFilters.dateRange || "all",
      dateFrom: initialFilters.dateFrom || "",
      dateTo: initialFilters.dateTo || "",
      sortBy: initialFilters.sortBy || "createdAt-desc",
      owner: initialFilters.owner || "",
    });
    setPagination({ page: initialPage, limit: initialLimit });
  }, [key]);

  // ✅ Khi fetcher có data mới -> cập nhật vào state + reset fetcher
  useEffect(() => {
    if (fetcher.data !== undefined && fetcher.data !== null) {
      setData(fetcher.data);
      fetcher.reset();
    }
  }, [fetcher]);

  // 🔎 Gửi request filter lên server
  const filter = (filters, resetPage = true) => {
    if (!endpoint) return console.warn("No endpoint provided for filter");
    console.log('🔍 LESSON filter() called with:', filters);
    console.log('Current activeFilters:', activeFilters);
    console.log('initialFilters:', initialFilters);
    const newFilters = { ...activeFilters, ...filters };
    console.log(newFilters, initialFilters);

    // Nếu filter giống với initial -> trả về data gốc
    if (deepEqual(newFilters, initialFilters)) {
      setData(initialData);
      setActiveFilters(newFilters);
      return;
    }

    setActiveFilters(newFilters);

    const newPagination = resetPage
      ? { page: 1, limit: pagination.limit }
      : pagination;

    if (resetPage) setPagination(newPagination);

    fetcher.submit(
      {
        intent: "filter",
        ...newFilters,
        page: newPagination.page,
        limit: newPagination.limit,
      },
      { method: "post", action: endpoint }
    );
  };

  // 🔄 Quick filter - chỉ cập nhật một field
  const quickFilter = (key, value) => {
    filter({ [key]: value }, true);
  };

  // 📄 Pagination helpers
  const goToPage = (page) => {
    if (!endpoint) return;
    setPagination((prev) => ({ ...prev, page }));
    fetcher.submit(
      {
        intent: "filter",
        ...activeFilters,
        page,
        limit: pagination.limit,
      },
      { method: "post", action: endpoint }
    );
  };

  const changeLimit = (limit) => {
    if (!endpoint) return;
    setPagination({ page: 1, limit });
    fetcher.submit(
      {
        intent: "filter",
        ...activeFilters,
        page: 1,
        limit,
      },
      { method: "post", action: endpoint }
    );
  };

  const nextPage = () => {
    const totalPages = Math.ceil((data?.total || 0) / pagination.limit);
    if (pagination.page < totalPages) goToPage(pagination.page + 1);
  };

  const previousPage = () => {
    if (pagination.page > 1) goToPage(pagination.page - 1);
  };

  // 🧹 Reset filters
  const resetFilters = () => {
    if (!endpoint) return;

    const emptyFilters = {
      searchText: "",
      dateRange: "all",
      dateFrom: "",
      dateTo: "",
      sortBy: "createdAt-desc",
      owner: "",
    };

    if (deepEqual(activeFilters, emptyFilters)) return;

    setActiveFilters(emptyFilters);
    setPagination({ page: 1, limit: pagination.limit });

    fetcher.submit(
      {
        intent: "filter",
        ...emptyFilters,
        page: 1,
        limit: pagination.limit,
      },
      { method: "post", action: endpoint }
    );
  };

  // 🔍 Check if has active filters
  const hasActiveFilters = () => {
    const empty = {
      searchText: "",
      dateRange: "all",
      dateFrom: "",
      dateTo: "",
      sortBy: "createdAt-desc",
      owner: "",
    };
    return !deepEqual(activeFilters, empty);
  };

  // 🔄 Re-fetch with current filters
  const reFetch = () => {
    if (!endpoint) return;
    fetcher.submit(
      {
        intent: "filter",
        ...activeFilters,
        page: pagination.page,
        limit: pagination.limit,
      },
      { method: "post", action: endpoint }
    );
  };

  // 📊 Pagination info
  const totalPages = Math.ceil((data?.total || 0) / pagination.limit);
  const hasNextPage = pagination.page < totalPages;
  const hasPreviousPage = pagination.page > 1;
  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, data?.total || 0);

  // 🎯 Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.searchText.trim()) count++;
    if (activeFilters.dateRange !== "all") count++;
    if (activeFilters.dateFrom || activeFilters.dateTo) count++;
    if (activeFilters.sortBy !== "createdAt-desc") count++;
    if (activeFilters.owner) count++;
    return count;
  };

  return {
    // 🔧 Filter methods
    filter,
    quickFilter,
    resetFilters,
    reFetch,

    // 📊 Data
    initData,
    lessons: data?.lessons || [],
    documents: data?.lessons || [],
    filtering: isLoading,
    error: data?.error || null,

    // 🎛️ Filter state
    activeFilters,
    hasActiveFilters: hasActiveFilters(),
    activeFilterCount: getActiveFilterCount(),

    // 📄 Pagination
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: data?.total || 0,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      startIndex,
      endIndex,
    },
    goToPage,
    nextPage,
    previousPage,
    changeLimit,
  };
}