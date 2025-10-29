// src/components/ProductSlider.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * ProductSlider với nút mũi tên trái/phải điều hướng ngang
 * props:
 *  - title: string
 *  - products: array
 *  - itemWidth: Tailwind width class or number px fallback (optional)
 */
export default function ProductSlider({ title, products = [], itemWidth = 256 }) {
  const scrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Kiểm tra xem có thể scroll được chiều trái/phải
  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    // dùng epsilon 5 để tránh số thập phân
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    // cập nhật khi scroll
    el.addEventListener('scroll', updateScrollState, { passive: true });
    // cập nhật khi resize (responsive)
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  // scroll step: 80% của vùng hiển thị (clientWidth)
  const scrollStep = () => {
    const el = scrollerRef.current;
    if (!el) return 0;
    return Math.round(el.clientWidth * 0.8);
  };

  const handlePrev = () => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: -scrollStep(), behavior: 'smooth' });
  };

  const handleNext = () => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: scrollStep(), behavior: 'smooth' });
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="mt-12 py-6 bg-gray-50 rounded-lg relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {/* Bạn có thể thêm link "Xem tất cả" ở đây nếu muốn */}
        </div>

        <div className="relative">
          {/* Left arrow */}
          <button
            aria-label="Previous"
            onClick={handlePrev}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full shadow-md transition-opacity duration-150
              ${canScrollLeft ? 'bg-white text-gray-700 hover:scale-105' : 'bg-white/60 text-gray-400 pointer-events-none opacity-50'}`}
            style={{ marginLeft: 6 }}
          >
            <FiChevronLeft size={20} />
          </button>

          {/* Right arrow */}
          <button
            aria-label="Next"
            onClick={handleNext}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full shadow-md transition-opacity duration-150
              ${canScrollRight ? 'bg-white text-gray-700 hover:scale-105' : 'bg-white/60 text-gray-400 pointer-events-none opacity-50'}`}
            style={{ marginRight: 6 }}
          >
            <FiChevronRight size={20} />
          </button>

          {/* Scroller */}
          <div
            ref={scrollerRef}
            className="flex overflow-x-auto gap-4 pb-4 scroll-smooth"
            style={{
              // hide native scrollbar on webkit browsers (optional)
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none' /* firefox */,
            }}
          >
            {/* thêm style để hide thanh cuộn trên chrome / safari nếu muốn */}
            <style jsx>{`
              .scroll-smooth::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {products.map((product) => (
              <div
                key={product._id}
                // Kích thước item: bạn có thể truyền itemWidth theo px hoặc dùng class tailwind
                className="flex-shrink-0"
                style={{
                  width: typeof itemWidth === 'number' ? itemWidth : undefined,
                  // support when user passes tailwind class string not used here; default px used
                }}
              >
                {/* Dùng scroll-snap để dừng gọn */}
                <div style={{ scrollSnapAlign: 'start' }}>
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>

          {/* Thêm wrapper để bật scroll-snap behavior */}
          <div style={{ height: 0 }} />
        </div>
      </div>
    </section>
  );
}
