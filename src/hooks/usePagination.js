import { useState, useEffect, useMemo } from 'react';

/**
 * Custom hook để xử lý logic phân trang
 * @param {Array} items - Mảng các item cần phân trang
 * @param {Number} itemsPerPage - Số lượng item mỗi trang (mặc định: 12)
 * @param {Boolean} resetOnItemsChange - Tự động reset về trang 1 khi items thay đổi (mặc định: true)
 * @returns {Object} - { currentPage, totalPages, paginatedItems, handlePageChange }
 */
export const usePagination = (items = [], itemsPerPage = 12, resetOnItemsChange = true) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset về trang 1 khi items thay đổi
  useEffect(() => {
    if (resetOnItemsChange) {
      setCurrentPage(1);
    }
  }, [items.length, resetOnItemsChange]);

  // Tính toán các item cần hiển thị ở trang hiện tại
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  // Tính tổng số trang
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Hàm chuyển trang
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top khi chuyển trang
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset về trang 1 (có thể gọi từ component)
  const resetPage = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    paginatedItems,
    handlePageChange,
    resetPage,
    itemsPerPage
  };
};

