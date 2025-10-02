import * as wishlistService from "../services/wishlistService.js";

export const addWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    console.log(req.body);
    const userId = req.user.id; // lấy từ JWT
    console.log(userId);

    const result = await wishlistService.addWishlist(userId, productId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const removeWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const result = await wishlistService.removeWishlist(userId, productId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await wishlistService.getWishlist(userId);
    res.json(wishlist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
