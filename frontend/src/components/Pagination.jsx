import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) {
    return null;
  }

  // --- Logic để tạo danh sách số trang rút gọn ---
  const getPageNumbers = () => {
    if (pages <= 7) {
      // Nếu có 7 trang trở xuống, hiển thị tất cả
      return Array.from({ length: pages }, (_, i) => i + 1);
    }
    // Nếu có nhiều hơn 7 trang, hiển thị rút gọn
    if (page <= 4) {
      return [1, 2, 3, 4, 5, '...', pages];
    }
    if (page > pages - 4) {
      return [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages];
    }
    return [1, '...', page - 1, page, page + 1, '...', pages];
  };

  const pageNumbers = getPageNumbers();

  // --- Class CSS chung cho các nút ---
  const buttonClasses = "px-4 py-2 leading-tight border transition-colors duration-200";
  const activeClasses = "bg-blue-600 text-white border-blue-600";
  const inactiveClasses = "bg-white text-gray-500 border-gray-300 hover:bg-gray-100 hover:text-gray-700";
  const disabledClasses = "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed";

  return (
    <nav className="flex justify-center mt-8">
      <ul className="inline-flex items-center -space-x-px shadow-sm rounded-md">
        {/* Nút Trang Trước */}
        <li>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className={`${buttonClasses} rounded-l-md ${page === 1 ? disabledClasses : inactiveClasses}`}
          >
            <FaChevronLeft />
          </button>
        </li>
        
        {/* Các nút số trang */}
        {pageNumbers.map((number, index) => (
          <li key={index}>
            {number === '...' ? (
              <span className={`${buttonClasses} ${inactiveClasses}`}>...</span>
            ) : (
              <button
                onClick={() => onPageChange(number)}
                className={`${buttonClasses} ${page === number ? activeClasses : inactiveClasses}`}
              >
                {number}
              </button>
            )}
          </li>
        ))}

        {/* Nút Trang Sau */}
        <li>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === pages}
            className={`${buttonClasses} rounded-r-md ${page === pages ? disabledClasses : inactiveClasses}`}
          >
            <FaChevronRight />
          </button>
        </li>
      </ul>
    </nav>
  );
}