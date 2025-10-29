# Website Cửa Hàng Thú Cưng & Nhận Nuôi Thú Cưng

![Banner dự án]()  
*(Thay bằng ảnh banner thực tế của bạn)*

**Nội dung đề tài** – Xây dựng website bán và nhận nuôi thú cưng với hai vai trò chính: **Khách hàng (User)** và **Quản trị viên (Admin)**.  
- **User**: Sử dụng **MERN Stack** (MongoDB, Express, React, Node.js).  
- **Admin**: Linh hoạt phát triển bằng **NestJS (Backend)** và **NextJS (Frontend)**.

---

## Mục lục
- [Giới thiệu](#giới-thiệu)
- [Tính năng chính](#tính-năng-chính)
- [Biểu đồ Use Case](#biểu-đồ-use-case)
- [Công nghệ sử dụng](#công-ngệ-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
- [Biến môi trường](#biến-môi-trường)
- [Đóng góp](#đóng-góp)
- [Tác giả](#tác-giả)
- [Giấy phép](#giấy-phép)

---

## Giới thiệu

Dự án xây dựng một **hệ thống website cửa hàng thú cưng** cho phép:
- Người dùng (khách vãng lai hoặc đã đăng ký) **tìm kiếm, xem chi tiết, đặt mua hoặc nhận nuôi thú cưng**.
- Quản trị viên **quản lý sản phẩm, đơn hàng, người dùng, khuyến mãi và tồn kho**.

Ứng dụng được chia thành **2 phần độc lập**:
1. **Phần người dùng (User)**: Giao diện thân thiện, tốc độ cao, trải nghiệm mượt mà.
2. **Phần quản trị (Admin)**: Giao diện hiện đại, bảo mật cao, dễ mở rộng.

---

## Tính năng chính

### Vai trò **Guest (Khách vãng lai)**
- Xem danh sách sản phẩm/thú cưng
- Tìm kiếm theo tên, loại, giá
- Xem chi tiết thú cưng
- Đăng ký tài khoản

### Vai trò **Khách hàng (User đã đăng nhập)**
- Đăng nhập / Đăng xuất / Quên mật khẩu
- Quản lý thông tin cá nhân (cập nhật, thêm/xóa địa chỉ)
- Quản lý giỏ hàng (thêm, xóa, xem)
- Đặt hàng & Thanh toán
- Xem lịch sử đơn hàng (xem chi tiết, đánh giá, hủy đơn)
- Quản lý danh sách yêu thích
- Xem thông báo, khuyến mãi

### Vai trò **Admin (Quản trị viên)**
- Đăng nhập / Đăng xuất
- **Quản lý sản phẩm**: Thêm, sửa, xóa, cập nhật tồn kho
- **Quản lý đơn hàng**: Xem, cập nhật trạng thái (đang xử lý, hoàn thành, hủy)
- **Quản lý người dùng**: Xem danh sách, vô hiệu hóa tài khoản
- **Quản lý khuyến mãi**: Tạo, sửa, xóa mã giảm giá
- **Thống kê**: Doanh thu, sản phẩm bán chạy

---

## Biểu đồ Use Case

Dưới đây là các biểu đồ Use Case mô tả chi tiết hành vi người dùng:

### 1. Use Case Chung
![Use Case Chung](./docs/usecase-general.png)

### 2. Use Case Khách hàng
![Use Case Khách hàng](./docs/usecase-user.png)

### 3. Use Case Admin
![Use Case Admin](./docs/usecase-admin.png)

> *(Lưu ý: Tạo thư mục `docs/` trong repo và đặt 3 file ảnh vào đó, sau đó cập nhật đường dẫn chính xác)*

---

## Công nghệ sử dụng

| Phần | Công nghệ |
|------|-----------|
| **Frontend (User)** | React.js, React Router, Axios, Context API / Redux |
| **Backend (User)** | Node.js, Express.js, JWT, Bcrypt |
| **Database** | MongoDB + Mongoose |
| **Frontend (Admin)** | Next.js (App Router), Tailwind CSS / Ant Design |
| **Backend (Admin)** | NestJS (TypeScript), TypeORM / Prisma, JWT |
| **Xác thực** | JWT + Refresh Token |
| **Công cụ khác** | Git, Postman, MongoDB Compass |

---

## Cấu trúc thư mục
pet-adoption/
├── frontend/                  # Frontend User (React)
├── server/                  # Backend User (Express)
├── admin-frontend/          # Frontend Admin (Next.js)
├── admin-server/           # Backend Admin (NestJS)
├── docs/                    # Biểu đồ, tài liệu
│   ├── usecase-general.png
│   ├── usecase-user.png
│   └── usecase-admin.png
├── .env.example
├── README.md


---

## Cài đặt và chạy dự án

### Yêu cầu
- Node.js (>= 16)
- MongoDB (local hoặc MongoDB Atlas)
- Git

### Các bước thực hiện

```bash
# 1. Clone dự án
git clone https://github.com/PhatBee/pet-adoption.git
cd pet-adoption

# 2. Cài đặt từng phần
# User - Frontend
cd client
npm install
cd ..

# User - Backend
cd server
npm install
cd ..

# Admin - Frontend
cd admin-frontend
npm install
cd ..

# Admin - Backend
cd admin-backend
npm install
cd ..

```

## Chạy dự án
Phần,Lệnh
User Backend,cd server && npm run dev → http://localhost:5000
User Frontend,cd frontend && npm start → http://localhost:3000
Admin Backend,cd admin-server && npm run start:dev → http://localhost:4000
Admin Frontend,cd admin-frontend && npm run dev → http://localhost:6060

## Biến môi trường
Tạo file .env trong từng backend:
server/.env
PORT=5000
DB_URI=
CLIENT_URL=http://localhost:3000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=
JWT_REFRESH_EXPIRES=

vnp_TmnCode=
vnp_HashSecret=
vnp_Url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
vnp_Api=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
vnp_ReturnUrl=

MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY= 
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz   
MOMO_API_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_REDIRECT_URL=
MOMO_IPN_URL=

INTERNAL_API_KEY=

frontend/.env
REACT_APP_BASE=http://localhost:5000

admin-server/.env
PORT=4000
DB_URI=

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=
JWT_REFRESH_EXPIRES=

INTERNAL_API_KEY=
USER_BACKEND_URL=http://localhost:5000

admin-fronend/.env
NEXT_PUBLIC_API_URL=http://localhost:4000

Xem file .env.example để biết thêm chi tiết.

## Đóng góp
Rất hoan nghênh mọi đóng góp! Vui lòng:

Fork repo
Tạo nhánh mới: feature/ten-tinh-nang
Commit và push
Tạo Pull Request

## Tác giả

Thông tin thành viên 1: 
Họ tên: [Ong Vĩnh Phát]
MSSV: [22110394]
Email: [vinhphatst1235@gmail.com]
GitHub: github.com/PhatBee

Thông tin thành viên 2:
Họ tên: [Huỳnh Thị Mỹ Tâm]
MSSV: [22110410]
Email: [mytamhuynhhmt@gmail.com]
GitHub: github.com/TamaOwO
