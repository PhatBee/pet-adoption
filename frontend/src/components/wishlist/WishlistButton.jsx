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
      className="absolute top-2 right-2 flex items-center justify-center rounded-full border border-sky-500 bg-white p-2 shadow hover:bg-sky-50 transition"
    >
      {isWishlist ? (
        <HeartFilled className="text-sky-500 text-lg" />
      ) : (
        <HeartOutlined className="text-sky-500 text-lg" />
      )}
    </button>
  );
}
