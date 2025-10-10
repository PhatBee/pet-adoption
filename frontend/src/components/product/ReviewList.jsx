import ReviewItem from "./ReviewItem";

export default function ReviewList({ reviews = [] }) {
  if (reviews.length === 0) {
    return <div className="p-4 text-center text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</div>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Đánh giá từ khách hàng</h3>
      <div className="border rounded-lg bg-white">
        {reviews.map((review) => (
          <ReviewItem key={review._id} review={review} />
        ))}
      </div>
    </div>
  );
}