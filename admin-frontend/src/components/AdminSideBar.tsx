import Link from 'next/link';
import { useRouter } from 'next/router'; // Import useRouter
import { ShoppingBag, Package, Users, Tag, Bell, LayoutDashboard } from "lucide-react";
import LogoutButton from './LogoutButton';

// Thêm Dashboard vào menu
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: ShoppingBag, label: "Đơn hàng", href: "/admin/orders" },
  { icon: Package, label: "Sản phẩm", href: "/admin/products" },
  { icon: Users, label: "Người dùng", href: "/admin/users" },
  { icon: Tag, label: "Khuyến mãi", href: "/admin/vouchers" },
  { icon: Bell, label: "Thông báo", href: "/admin/notifications" },
];

export default function AdminSidebar() {
  // Lấy đường dẫn hiện tại
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <aside className="w-60 bg-white h-screen border-r p-4 flex flex-col shadow-sm">
      <div className="text-center mb-6">
        <Link href="/admin/dashboard">
          <span className="text-2xl font-bold text-indigo-600 cursor-pointer">
            PetShop Admin
          </span>
        </Link>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map(({ icon: Icon, label, href }) => {
            const isActive = currentPath === href;

            return (
              <li key={label}>
                <Link
                  href={href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg no-underline
                    font-medium transition-all duration-200
                    ${isActive
                      ? "bg-indigo-100 text-indigo-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-gray-500"}`} />
                  <span className="text-sm">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <LogoutButton />
      </div>

    </aside>
  );
}