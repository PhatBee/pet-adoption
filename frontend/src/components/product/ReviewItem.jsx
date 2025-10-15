import Rating from "./Rating";
import { SERVER_BASE } from "../../config";

export default function ReviewItem({ review }) {
  // Định dạng lại ngày tháng cho dễ đọc
  const reviewDate = new Date(review.createdAt).toLocaleDateString("vi-VN");

  const avatar = review.user?.avatarUrl
      ? (review.user?.avatarUrl.startsWith("http") ? review.user?.avatarUrl : SERVER_BASE + review.user?.avatarUrl)
      : null;

  return (
    <div className="p-4 border-b">
      <div className="flex items-center mb-2">
        {/* Nếu có avatar thì hiển thị, nếu không thì dùng ảnh mặc định */}
        <img
          src={avatar || `https://ui-avatars.com/api/?name=${review.user?.name}&background=random`}
          alt={review.user?.name}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <p className="font-semibold">{review.user?.name || "Người dùng ẩn"}</p>
          <p className="text-xs text-gray-500">{reviewDate}</p>
        </div>
      </div>
      <Rating value={review.rating} />
      <p className="mt-2 text-gray-700">{review.comment}</p>
    </div>
  );
}