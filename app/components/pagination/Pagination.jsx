import React from "react";
import styles from "./Pagination.module.css";

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onLimitChange,
  isLoading = false,
  showLimitSelector = true,
  showPageInfo = true,
  showItemInfo = true,
  limitOptions = [10, 20, 50, 100],
  maxPageButtons = 5,
}) {
  // Calculate display info
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    if (totalPages <= maxPageButtons) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate range around current page
      let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
      let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
      
      // Adjust if we're near the end
      if (endPage - startPage < maxPageButtons - 1) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
      }
      
      // Add first page
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add last page
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const handlePageClick = (page) => {
    if (page !== currentPage && !isLoading && page !== '...') {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLimitChange = (e) => {
    if (!isLoading) {
      const newLimit = parseInt(e.target.value);
      onLimitChange(newLimit);
    }
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const input = e.target.elements.pageInput;
    const pageNum = parseInt(input.value);
    
    if (pageNum >= 1 && pageNum <= totalPages && !isLoading) {
      onPageChange(pageNum);
      input.value = '';
    }
  };

  // Don't render if there's no data
  if (totalItems === 0 || totalPages === 0) {
    return null;
  }

  return (
    <div className={styles.paginationContainer}>
      {/* Top Info Bar */}
      {showItemInfo && (
        <div className={styles.infoBar}>
          <span className={styles.itemInfo}>
            Hiển thị <strong>{startIndex}</strong> - <strong>{endIndex}</strong> trong tổng số <strong>{totalItems}</strong> mục
          </span>
          
          {showLimitSelector && (
            <div className={styles.limitSelector}>
              <label htmlFor="itemsPerPage">Số mục mỗi trang:</label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleLimitChange}
                disabled={isLoading}
                className={styles.limitSelect}
              >
                {limitOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Main Pagination Controls */}
      <div className={styles.paginationControls}>
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={!hasPrevious || isLoading}
          className={`${styles.navButton} ${styles.previousButton}`}
          title="Trang trước"
        >
          ← Trước
        </button>

        {/* Page Numbers */}
        <div className={styles.pageNumbers}>
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className={styles.ellipsis}>...</span>
              ) : (
                <button
                  onClick={() => handlePageClick(page)}
                  disabled={isLoading}
                  className={`${styles.pageButton} ${
                    page === currentPage ? styles.activePage : ''
                  }`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!hasNext || isLoading}
          className={`${styles.navButton} ${styles.nextButton}`}
          title="Trang sau"
        >
          Sau →
        </button>
      </div>

      {/* Go to Page Form */}
      {showPageInfo && totalPages > maxPageButtons && (
        <div className={styles.goToPage}>
          <form onSubmit={handleGoToPage} className={styles.goToPageForm}>
            <label htmlFor="pageInput">Đi đến trang:</label>
            <input
              type="number"
              id="pageInput"
              name="pageInput"
              min="1"
              max={totalPages}
              placeholder="Nhập số trang"
              disabled={isLoading}
              className={styles.pageInput}
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className={styles.goButton}
            >
              Đi
            </button>
          </form>
          <span className={styles.pageInfo}>
            Trang {currentPage} / {totalPages}
          </span>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <span className={styles.loadingSpinner}>🔄</span>
          Đang tải...
        </div>
      )}
    </div>
  );
}