import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export default function Rating({ value = 0, text = "" }) {
  // Tạo một mảng 5 phần tử để render 5 ngôi sao
  const stars = Array.from({ length: 5 }, (_, index) => {
    const number = index + 0.5;
    return (
      <span key={index}>
        {value >= index + 1 ? (
          <FaStar className="text-yellow-400" />
        ) : value >= number ? (
          <FaStarHalfAlt className="text-yellow-400" />
        ) : (
          <FaRegStar className="text-yellow-400" />
        )}
      </span>
    );
  });

  return (
    <div className="flex items-center gap-2">
      <div className="flex">{stars}</div>
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
}