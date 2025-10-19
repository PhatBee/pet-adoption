import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfileApi, updateProfileApi } from "../api/userApi";
import AvatarUploader from "../components/AvatarUploader";
import { toast } from "react-toastify";
import { selectUser, updateUser } from "../store/authSlice";
import { SERVER_BASE } from "../config";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9]{7,15}$/;
const nameRegex = /^[a-zA-ZàáâãèéêìíòóôõùúýăđĩũơưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĂĐĨŨƠƯ\s]+$/;

export default function ProfileForm() {
  const dispatch = useDispatch();
  const reduxUser = useSelector(selectUser);
  // const [form, setForm] = useState({ ...reduxUser });

  // local state: form fields
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // avatar
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null); // full url or null
  const [removeAvatar, setRemoveAvatar] = useState(false);


  // load profile: ưu tiên redux, nếu không có -> gọi API
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        if (reduxUser) {
          // populate fields by redux user
          setName(reduxUser.name || "");
          setEmail(reduxUser.email || "");
          setPhone(reduxUser.phone || "");
          setAvatarUrl(reduxUser.avatarUrl ? (reduxUser.avatarUrl.startsWith("http") ? reduxUser.avatarUrl : SERVER_BASE + reduxUser.avatarUrl) : null);
        } else {
          const res = await getProfileApi();
          const user = res.data.user || res.data;
          setName(user.name || "");
          setEmail(user.email || "");
          setPhone(user.phone || "");
          setAvatarUrl(user.avatarUrl ? (user.avatarUrl.startsWith("http") ? user.avatarUrl : SERVER_BASE + user.avatarUrl) : null);
          // Also update redux
          dispatch(updateUser(user));
        }
      } catch (err) {
        toast.error("Không lấy được profile. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxUser, dispatch]);

  const handleFileSelect = (file) => {
    setAvatarFile(file);
    setRemoveAvatar(false); // nếu chọn file thì không xóa
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarUrl(null);
    setRemoveAvatar(true);
  };

  const validate = () => {
    if (!name.trim()) return "Họ tên không được để trống";
    if (!nameRegex.test(name.trim())) return "Họ tên chỉ được chứa chữ cái và khoảng trắng.";
    if (!emailRegex.test(email)) return "Email không hợp lệ";
    if (phone && !phoneRegex.test(phone)) return "Số điện thoại không hợp lệ";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("email", email.trim().toLowerCase());
      fd.append("phone", phone.trim());
      if (avatarFile) fd.append("avatar", avatarFile);
      if (removeAvatar && !avatarFile) fd.append("removeAvatar", "true");

      const res = await updateProfileApi(fd);
      const updatedUser = res.data.user || res.data;
      toast.success(res.data.message || "Cập nhật thành công");

      // Cập nhật Redux user (giữ accessToken)
      dispatch(updateUser(updatedUser));
      // reset local state file
      setAvatarFile(null);
      setRemoveAvatar(false);
      setAvatarUrl(updatedUser.avatarUrl ? (updatedUser.avatarUrl.startsWith("http") ? updatedUser.avatarUrl : SERVER_BASE + updatedUser.avatarUrl) : null);
    } catch (err) {
      const msg = err.response?.data?.message || "Cập nhật thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center">Đang tải profile...</p>;

  return (
    <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Thông tin cá nhân</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col items-center">
          <AvatarUploader
            src={avatarUrl}
            onFileSelect={handleFileSelect}
            onRemove={handleRemoveAvatar}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-600">Họ tên</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-600">Số điện thoại</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition disabled:opacity-50"
          >
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
};
