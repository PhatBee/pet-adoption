// src/components/ProductDetail.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper.min.css";

export default function ProductDetail({ product, qty, setQty }) {
  return (
    <div className="p-6 grid md:grid-cols-2 gap-8">
      {/* Swiper cho ảnh */}
      <Swiper spaceBetween={10} slidesPerView={1}>
        {product.images.map((img, i) => (
          <SwiperSlide key={i}>
            <img src={img} alt="" className="w-full h-96 object-cover" />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thông tin */}
      <div>
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        <p className="text-red-500 text-xl mb-4">{product.price}₫</p>
        <p className="mb-2">Danh mục: {product.category?.name}</p>
        <p className="mb-2">Hàng tồn: {product.stock}</p>

        {/* Số lượng */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="px-3 py-1 border"
          >
            -
          </button>
          <span>{qty}</span>
          <button
            onClick={() => setQty(qty + 1)}
            className="px-3 py-1 border"
          >
            +
          </button>
        </div>

        <button className="bg-blue-600 text-white px-6 py-2 rounded">
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
