import React, { useState } from 'react';
import { FontAwesomeIcon, icons } from '../utils/icons';
import '../styles/Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage = 12,
  showPageInfo = true 
}) => {
  const [inputPage, setInputPage] = useState('');

  if (totalPages <= 1) {
    return null; // Không hiển thị phân trang nếu chỉ có 1 trang
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      // Scroll to top khi chuyển trang
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Chỉ cho phép nhập số
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 1 && parseInt(value) <= totalPages)) {
      setInputPage(value);
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    const page = parseInt(inputPage);
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setInputPage('');
    }
  };

  const handleInputBlur = () => {
    setInputPage('');
  };

  return (
    <div className="pagination-container">
      {showPageInfo && (
        <div className="pagination-info">
          Trang {currentPage} / {totalPages}
        </div>
      )}
      
      <div className="pagination">
        {/* Nút Previous */}
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Trang trước"
        >
          <FontAwesomeIcon icon={icons.chevronLeft} />
        </button>

        {/* Trang trước */}
        {currentPage > 1 && (
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label={`Trang ${currentPage - 1}`}
          >
            {currentPage - 1}
          </button>
        )}

        {/* Trang hiện tại */}
        <button
          className="pagination-btn active"
          aria-label={`Trang ${currentPage}`}
          aria-current="page"
        >
          {currentPage}
        </button>

        {/* Trang kế tiếp */}
        {currentPage < totalPages && (
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label={`Trang ${currentPage + 1}`}
          >
            {currentPage + 1}
          </button>
        )}

        {/* Input nhập trang */}
        <form onSubmit={handleInputSubmit} className="pagination-input-form">
          <input
            type="text"
            className="pagination-input"
            placeholder="Trang"
            value={inputPage}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            aria-label="Nhập số trang"
          />
          <button
            type="submit"
            className="pagination-go-btn"
            aria-label="Đi đến trang"
          >
            Đến
          </button>
        </form>

        {/* Nút Next */}
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Trang sau"
        >
          <FontAwesomeIcon icon={icons.chevronRight} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

