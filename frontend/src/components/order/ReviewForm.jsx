import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function ReviewForm({ initial = null, onSubmit }) {
  const [rating, setRating] = useState(initial?.rating || 0);
  const [comment, setComment] = useState(initial?.comment || "");
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRating(initial?.rating || 0);
    setComment(initial?.comment || "");
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ rating, comment });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4 pt-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Chọn sao */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Đánh giá của bạn
        </label>
        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <motion.label
                key={index}
                whileHover={{ scale: 1.2, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                className="cursor-pointer"
              >
                <input
                  type="radio"
                  name="rating"
                  value={ratingValue}
                  onClick={() => setRating(ratingValue)}
                  className="hidden"
                />
                <FaStar
                  color={ratingValue <= (hover || rating) ? "#facc15" : "#e4e5e9"}
                  size={30}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-all duration-200 drop-shadow"
                />
              </motion.label>
            );
          })}
        </div>
      </div>

      {/* Bình luận */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Viết bình luận (không bắt buộc)
        </label>
        <motion.textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          placeholder="Sản phẩm này tuyệt vời như thế nào?"
          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
          whileFocus={{ scale: 1.02 }}
        />
      </div>

      {/* Nút gửi */}
      <div className="text-right">
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition disabled:opacity-50"
        >
          {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
        </motion.button>
      </div>
    </motion.form>
  );
}
