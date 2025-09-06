const Order = require("../models/Order");

exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate("items.product", "name price images");
  res.json(orders);
};
