import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as wishlistApi from "../api/wishlistApi";

export const fetchWishlist = createAsyncThunk("wishlist/fetch", async () => {
  const res = await wishlistApi.getWishlist();
  return res.data;
});

export const addWishlist = createAsyncThunk("wishlist/add", async (productId) => {
 await wishlistApi.addWishlist(productId);
  // gọi lại fetch toàn bộ wishlist
  const res = await wishlistApi.getWishlist();
  return res.data; // backend trả về object mới thêm (nên bạn cần return nó)

});

export const removeWishlist = createAsyncThunk("wishlist/remove", async (productId) => {
  await wishlistApi.removeWishlist(productId);
  return productId;
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addWishlist.fulfilled, (state, action) => {
        console.log(action.payload)
        // state.items.push(action.payload);
          state.items = action.payload;

      })
      .addCase(removeWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (p) => p.product._id !== action.payload
        );
      });
  }
});

export default wishlistSlice.reducer;
