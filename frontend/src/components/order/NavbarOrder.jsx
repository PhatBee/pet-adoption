import { Tabs } from "antd";

const orderStatus = [
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "preparing", label: "Chuẩn bị hàng" },
  { key: "shipping", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
  { key: "cancelled", label: "Đã Hủy" }
];

// Component Tabs chọn trạng thái đơn hàng
const NavbarOrder = ({ currentStatus, onChange }) => {
  return (
    <Tabs
      activeKey={currentStatus}
      onChange={onChange}
      items={orderStatus.map((s) => ({
        key: s.key,
        label: s.label
      }))}
      className="bg-white rounded-xl shadow-md px-3"
    />
  );
};

export default NavbarOrder;
