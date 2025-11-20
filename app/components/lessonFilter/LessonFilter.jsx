import { useEffect, useRef, useState } from "react";
import styles from "./LessonFilter.module.css";

export default function LessonFilter({
    activeFilters,
    onFilterChange = () => { },
    onReset = () => { },
    hasActiveFilters = false,
    activeFilterCount = 0,
    isLoading = false,
    disabledFilters = []
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchValue, setSearchValue] = useState(activeFilters.searchText || "");
    const [ownerValue, setOwnerValue] = useState(activeFilters.owner || "");
    const searchInputRef = useRef(null);
    const isFirstSearchRender = useRef(true);
    const isFirstOwnerRender = useRef(true);

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleOwnerChange = (e) => {
        setOwnerValue(e.target.value);
    };

    // Sync local state when activeFilters is reset (e.g. via Reset button)
    useEffect(() => {
        if (activeFilters.searchText === "" && searchValue !== "") {
            setSearchValue("");
        }
        if (activeFilters.owner === "" && ownerValue !== "") {
            setOwnerValue("");
        }
    }, [activeFilters]);

    const isDisabled = (filter) => {
        // Don't disable text inputs during loading to prevent focus loss
        if (filter === 'searchText' || filter === 'owner') {
            return disabledFilters.includes(filter);
        }
        return isLoading || disabledFilters.includes(filter);
    };

    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        // Skip first render to avoid unnecessary API call on mount
        if (isFirstSearchRender.current) {
            isFirstSearchRender.current = false;
            return;
        }

        const handler = setTimeout(() => {
            onFilterChange({
                ...activeFilters,
                searchText: searchValue,
            });
        }, 500);

        return () => clearTimeout(handler);
    }, [searchValue]);

    useEffect(() => {
        // Skip first render to avoid unnecessary API call on mount
        if (isFirstOwnerRender.current) {
            isFirstOwnerRender.current = false;
            return;
        }

        const handler = setTimeout(() => {
            onFilterChange({
                ...activeFilters,
                owner: ownerValue,
            });
        }, 500);

        return () => clearTimeout(handler);
    }, [ownerValue]);

    const checkActiveFilterCount = () => {
        let count = 0;
        if (activeFilters.searchText.trim() && !disabledFilters.includes('searchText')) count++;
        if (activeFilters.dateRange !== "all" && !disabledFilters.includes('dateRange')) count++;
        if (activeFilters.dateFrom || activeFilters.dateTo && !disabledFilters.includes('dateFrom') && !disabledFilters.includes('dateTo')) count++;
        if (activeFilters.sortBy !== "createdAt-desc" && !disabledFilters.includes('sortBy')) count++;
        if (activeFilters.owner && activeFilters.owner.trim() && !disabledFilters.includes('owner')) count++;
        return count;
    };

    return (
        <div className={styles.filterContainer}>
            <div className={styles.filterHeader}>
                <div className={styles.filterHeaderLeft}>
                    <button
                        className={styles.toggleButton}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? "▼" : "▶"} Bộ lọc
                        {activeFilterCount > 0 && (
                            <span className={styles.activeCount}>{activeFilterCount}</span>
                        )}
                    </button>

                    <div className={styles.searchWrapper}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Tìm kiếm bài giảng..."
                            value={searchValue}
                            onChange={handleSearchChange}
                            ref={searchInputRef}
                        />
                        {activeFilters.searchText && (
                            <button
                                className={styles.clearSearch}
                                onClick={() => setSearchValue("")}
                                disabled={isDisabled('searchText')}
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {checkActiveFilterCount() > 0 && (
                    <button
                        className={styles.resetButton}
                        onClick={onReset}
                        disabled={isDisabled('reset')}
                    >
                        🔄 Đặt lại bộ lọc
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className={styles.filterBody}>
                    <div className={styles.filterGrid}>
                        {/* Người sở hữu */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>👤 Người tạo</label>
                            <input
                                type="text"
                                className={styles.filterSelect}
                                placeholder="Nhập tên người tạo..."
                                value={ownerValue}
                                onChange={handleOwnerChange}
                                disabled={isDisabled('owner')}
                            />
                        </div>

                        {/* Khoảng thời gian */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>📅 Khoảng thời gian</label>
                            <select
                                className={styles.filterSelect}
                                value={activeFilters.dateRange || "all"}
                                onChange={(e) => onFilterChange({ ...activeFilters, dateRange: e.target.value })}
                                disabled={isDisabled('dateRange')}
                            >
                                <option value="all">Tất cả thời gian</option>
                                <option value="today">Hôm nay</option>
                                <option value="week">7 ngày qua</option>
                                <option value="month">30 ngày qua</option>
                                <option value="3months">3 tháng qua</option>
                                <option value="year">1 năm qua</option>
                            </select>
                        </div>

                        {/* Sắp xếp */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>↕️ Sắp xếp theo</label>
                            <select
                                className={styles.filterSelect}
                                value={activeFilters.sortBy || "createdAt-desc"}
                                onChange={(e) => onFilterChange({ ...activeFilters, sortBy: e.target.value })}
                                disabled={isDisabled('sortBy')}
                            >
                                <option value="createdAt-desc">Mới nhất trước</option>
                                <option value="createdAt-asc">Cũ nhất trước</option>
                                <option value="updatedAt-desc">Cập nhật gần đây</option>
                                <option value="title-asc">Tên A → Z</option>
                                <option value="title-desc">Tên Z → A</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className={styles.loadingIndicator}>
                    🔄 Đang lọc dữ liệu...
                </div>
            )}
        </div>
    );
}
