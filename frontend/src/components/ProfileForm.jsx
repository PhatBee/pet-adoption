import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfileApi, updateProfileApi } from "../api/userApi";
import AvatarUploader from "./AvatarUploader";
import { toast } from "react-toastify";
import { selectUser, updateUser } from "../store/authSlice";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9]{7,15}$/;
  
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

  const SERVER_BASE = "http://localhost:5000";


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
    <div className="card p-4" style={{ maxWidth: 720 }}>
      <h4 className="mb-3">Thông tin cá nhân</h4>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Ảnh đại diện</label>
          <div>
            <AvatarUploader src={avatarUrl} onFileSelect={handleFileSelect} onRemove={handleRemoveAvatar} />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Họ tên</label>
          <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div className="form-text">Thay đổi email có thể yêu cầu xác nhận lại theo cấu hình server.</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Số điện thoại</label>
          <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              // revert to redux values
              const u = reduxUser;
              if (u) {
                setName(u.name || "");
                setEmail(u.email || "");
                setPhone(u.phone || "");
                setAvatarFile(null);
                setAvatarUrl(u.avatarUrl ? (u.avatarUrl.startsWith("http") ? u.avatarUrl : SERVER_BASE + u.avatarUrl) : null);
                setRemoveAvatar(false);
              }
            }}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );

  // useEffect(() => {
  //   if (!profile) {
  //     dispatch(getMyProfile());
  //   } else {
  //     setForm({ ...profile });
  //   }
  // }, [profile, dispatch]);

  // if (!profile) return <p className="text-center">Loading...</p>;

  // return (
  //   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
  //     <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
  //       <h1 className="text-2xl font-bold mb-4 text-center">Profile</h1>
  //       <img
  //         src={profile.avatarUrl || "https://via.placeholder.com/100"}
  //         alt="avatar"
  //         className="w-24 h-24 rounded-full mx-auto mb-4"
  //       />
  //       <input
  //         type="text"
  //         value={form.fullName}
  //         onChange={(e) => setForm({ ...form, fullName: e.target.value })}
  //         placeholder="Full name"
  //         className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
  //       />
  //       <input
  //         type="text"
  //         value={form.avatarUrl}
  //         onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
  //         placeholder="Avatar URL"
  //         className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
  //       />
  //       <button
  //         onClick={onUpdate}
  //         className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md transition"
  //       >
  //         Update
  //       </button>
  //     </div>
  //   </div>
  // );
};
