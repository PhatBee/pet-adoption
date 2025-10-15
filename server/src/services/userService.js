const User = require("../models/User");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const Review = require("../models/Review");
const RefreshToken = require("../models/RefreshToken"); // 1. Import RefreshToken model
const { comparePassword, hashPassword } = require("./passwordService"); // 2. Import password helpers
const fs = require("fs").promises;
const path = require("path");

// Lấy thông tin user
const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw { status: 404, message: "Người dùng không tồn tại" };
  }
  return user;
};

// Lấy thông tin profile user
const getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cập nhật profile user
const updateProfile = async (userId, { name, email, phone }) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw { status: 404, message: "Người dùng không tồn tại" };

    // Nếu email thay đổi -> kiểm tra unique
  if (email && email.toLowerCase().trim() !== user.email) {
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists)         
        throw { status: 400, message: "Email đã được sử dụng" };

    user.email = email.toLowerCase().trim();
  }
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;

  await user.save();
  return user.toObject();

  } catch (error) {
 if (error.status) throw error;
    throw { status: 500, message: error.message || "Lỗi cập nhật thông tin" };
    }
};

// Xoá file avatar cũ (helper)
const removeFileIfExists = async (filePath) => {
  try {
    if (!filePath) return;
    const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    await fs.stat(abs); // kiểm tra có tồn tại
    await fs.unlink(abs);
  } catch (err) {
    // nếu file không tồn tại -> bỏ qua
  }
};

// Cập nhật avatar: filePath là đường dẫn được lưu bởi multer (relative)
const updateAvatar = async (userId, fileRelativePath) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "Người dùng không tồn tại" };

  // Xoá avatar cũ (nếu có và không phải default)
  if (user.avatarUrl) {
    // nếu avatarUrl lưu dạng '/uploads/avatars/....'
    await removeFileIfExists(path.join("uploads", path.basename(user.avatarUrl)));
  }

  user.avatarUrl = fileRelativePath;
  await user.save();
  return user.toObject();
};

// Xóa avatar (nếu user muốn remove)
const clearAvatar = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "Người dùng không tồn tại" };
  if (user.avatarUrl) {
    await removeFileIfExists(path.join("uploads", path.basename(user.avatarUrl)));
    user.avatarUrl = null;
    await user.save();
  }
  return user.toObject();
}

// Add a new address to a user's address book
const addAddress = async (userId, addressData) => {
  // 1. Find the user by their ID
  const user = await User.findById(userId);
  if (!user) {
    throw { status: 404, message: "Người dùng không tồn tại" };
  }

  // Optional: If you want to limit the number of addresses
  if (user.addresses.length >= 5) {
      throw { status: 400, message: "Bạn đã đạt đến số lượng địa chỉ tối đa." };
  }

  // 2. Add the new address to the array
  user.addresses.push(addressData);

  // 3. Save the updated user document
  await user.save();
  return user.toObject(); // Return the updated user
};

// Cập nhật một địa chỉ cụ thể
const updateAddress = async (userId, addressId, addressData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw { status: 404, message: "Người dùng không tồn tại" };
  }

  // Tìm địa chỉ con (subdocument) trong mảng addresses
  const address = user.addresses.id(addressId);
  if (!address) {
    throw { status: 404, message: "Không tìm thấy địa chỉ" };
  }
  
  // Nếu địa chỉ mới được set là mặc định, hãy bỏ mặc định ở các địa chỉ khác
  if (addressData.isDefault) {
    user.addresses.forEach(addr => {
      if (addr._id.toString() !== addressId) {
        addr.isDefault = false;
      }
    });
  }

  // Cập nhật các trường cho địa chỉ đó
  address.set(addressData);
  
  await user.save();
  return user.toObject();
};

// Xóa một địa chỉ cụ thể
const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw { status: 404, message: "Người dùng không tồn tại" };
  }
  
  // Tìm và xóa địa chỉ con khỏi mảng
  user.addresses.pull({ _id: addressId });

  await user.save();
  return user.toObject();
};

// Thay đổi mật khẩu của người dùng
const changePassword = async (userId, oldPassword, newPassword) => {
  // 3. Tìm người dùng trong DB
  const user = await User.findById(userId);
  if (!user) {
    throw { status: 404, message: "Không tìm thấy người dùng." };
  }

  // 4. Xác thực mật khẩu cũ
  const isMatch = await comparePassword(oldPassword, user.password);
  if (!isMatch) {
    throw { status: 400, message: "Mật khẩu cũ không chính xác." };
  }

  // Kiểm tra mật khẩu mới không được trùng mật khẩu cũ
  if (oldPassword === newPassword) {
    throw { status: 400, message: "Mật khẩu mới không được trùng với mật khẩu cũ." };
  }

  // 5. Băm và lưu mật khẩu mới
  user.password = await hashPassword(newPassword);
  await user.save();

  // 6. Vô hiệu hóa tất cả các phiên đăng nhập cũ (Rất quan trọng!)
  // Bằng cách xóa tất cả các refresh token của người dùng này
  await RefreshToken.deleteMany({ userId: user._id });

  return; // Không cần trả về gì cả
};

const deleteAccount = async (userId) => {
  // Bắt đầu một transaction để đảm bảo tất cả các thao tác đều thành công hoặc thất bại cùng nhau
  const session = await User.startSession();
  session.startTransaction();

  try {
    // 1. Xóa tất cả các refresh tokens của người dùng
    await RefreshToken.deleteMany({ userId: userId }, { session });

    // 2. Xóa giỏ hàng của người dùng
    await Cart.deleteOne({ user: userId }, { session });

    // 3. Xóa danh sách yêu thích của người dùng
    await Wishlist.deleteMany({ user: userId }, { session });
    
    // 4. Xóa tất cả các bài đánh giá của người dùng
    await Review.deleteMany({ user: userId }, { session });

    // 5. Cuối cùng, xóa chính người dùng đó
    const deletionResult = await User.deleteOne({ _id: userId }, { session });

    if (deletionResult.deletedCount === 0) {
      throw { status: 404, message: "Không tìm thấy người dùng để xóa." };
    }

    // Nếu tất cả thành công, commit transaction
    await session.commitTransaction();
  } catch (error) {
    // Nếu có bất kỳ lỗi nào, hủy bỏ tất cả các thay đổi
    await session.abortTransaction();
    throw error; // Ném lỗi ra để controller có thể bắt
  } finally {
    // Luôn luôn kết thúc session
    session.endSession();
  }
};

module.exports = { getUserById, getProfile, updateProfile, removeFileIfExists, updateAvatar, clearAvatar, addAddress, updateAddress, deleteAddress, changePassword, deleteAccount };
