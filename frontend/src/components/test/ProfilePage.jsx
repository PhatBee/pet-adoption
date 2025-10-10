import ProfileForm from "../../pages/ProfileForm";
import AddressManagementLink from "./AddressManagementLink";

export default function ProfilePage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Tài khoản của bạn</h1>
        
        {/* Bố cục 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cột chính: Form thông tin */}
          <div className="lg:col-span-2">
            <ProfileForm />
          </div>

          {/* Cột phụ: Quản lý địa chỉ */}
          <div className="lg:col-span-1">
            <AddressManagementLink />
            {/* Bạn có thể thêm các mục khác ở đây, ví dụ: Đổi mật khẩu, Lịch sử đơn hàng... */}
          </div>

        </div>
      </div>
    </div>
  );
}
