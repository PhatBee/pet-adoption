"use client";
import React from "react";

export interface PaginationProps {
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { currentPage, totalPages, totalItems, limit } = pagination;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 3;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > showPages + 1) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - showPages) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 p-4 bg-white shadow rounded-lg border border-gray-200">
      <p className="text-sm text-gray-700">
        Hiển thị{" "}
        <span className="font-semibold text-indigo-600">
          {(currentPage - 1) * limit + 1}
        </span>{" "}
        đến{" "}
        <span className="font-semibold text-indigo-600">
          {Math.min(currentPage * limit, totalItems)}
        </span>{" "}
        trong tổng số{" "}
        <span className="font-semibold text-indigo-600">{totalItems}</span> kết quả
      </p>

      <nav className="inline-flex items-center space-x-1" aria-label="Pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          Trước
        </button>

        {pageNumbers.map((page, index) =>
          typeof page === "number" ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1.5 text-sm rounded-md border ${
                currentPage === page
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              } transition`}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="px-3 py-1.5 text-gray-400 select-none">
              {page}
            </span>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          Sau
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
