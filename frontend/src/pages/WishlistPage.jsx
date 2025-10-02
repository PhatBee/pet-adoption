import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist } from "../store/wishlistSlice";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  return (
    <div>
      <h2>Sản phẩm yêu thích</h2>
      <ul>
        {wishlist.map((p) => (
          <li key={p._id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
