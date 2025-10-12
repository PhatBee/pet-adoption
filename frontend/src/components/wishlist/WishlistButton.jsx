import { useDispatch, useSelector } from "react-redux";
import { addWishlist, removeWishlist } from "../../store/wishlistSlice";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";

export default function WishlistButton({ product }) {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items);

  const isWishlist = wishlist.some((p) => p.product._id === product._id);

  const toggleWishlist = () => {
    if (isWishlist) {
      dispatch(removeWishlist(product._id));
    } else {
      dispatch(addWishlist(product._id)); 
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      className="p-2 rounded-full border border-gray-300 hover:bg-red-100 hover:text-red-600 transition-colors"
    >
      {isWishlist ? (
        <HeartFilled className="text-sky-500 text-lg" />
      ) : (
        <HeartOutlined className="text-sky-500 text-lg" />
      )}
    </button>
  );
}
