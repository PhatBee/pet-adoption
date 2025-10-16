import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Users, MessageCircle, Tag, Bell } from "lucide-react";

const menuItems = [
  { icon: ShoppingBag, label: "Đơn hàng", to: "/admin/orders" },
  { icon: Package, label: "Sản phẩm", to: "/admin/products" },
  { icon: Users, label: "Người dùng", to: "/admin/users" },
  { icon: Tag, label: "Khuyến mãi", to: "/admin/vouchers" },
  { icon: Bell, label: "Thông báo", to: "/admin/notifications" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-52 bg-white h-screen border-r p-3 flex flex-col">
      <nav className="flex-1">
        <ul className="space-y-1">
          {menuItems.map(({ icon: Icon, label, to }) => (
            <li key={label}>
              <Link
                to={to}
                className="flex items-center gap-2 px-2 py-2 rounded-lg text-gray-700 no-underline hover:bg-[#4f46e5]/10 hover:text-[#4f46e5] font-medium transition-all"
              >
                <Icon className="w-5 h-5 text-[#4f46e5]" />
                <span className="text-base">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
