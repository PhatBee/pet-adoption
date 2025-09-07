"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

export default function ImageCarousel({ images = [], className = "" }) {
  const imgs = images.length ? images : ["https://img.freepik.com/premium-photo/orange-white-puppy-kitten_772720-333.jpg?w=1480"];
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  return (
    <div className={`w-full ${className}`}>
      {/* Swiper chính */}
      <Swiper
        modules={[Navigation, Thumbs]}
        navigation
        thumbs={{ swiper: thumbsSwiper }}
        className="rounded-lg shadow"
      >
        {imgs.map((src, i) => (
          <SwiperSlide key={i}>
            <img
              src={src}
              alt={`product-${i}`}
              className="w-full h-96 md:h-[480px] object-cover rounded-lg"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnails */}
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={5}
        watchSlidesProgress
        modules={[Thumbs]}
        className="mt-3"
      >
        {imgs.map((src, i) => (
          <SwiperSlide key={i} className="!w-20 !h-20 md:!w-24 md:!h-24">
            <img
              src={src}
              alt={`thumb-${i}`}
              className="w-full h-full object-cover rounded border"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
