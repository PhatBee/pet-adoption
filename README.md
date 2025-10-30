# Website Cửa Hàng Thú Cưng

![Banner dự án]()
*(Thay bằng ảnh banner thực tế của bạn)*

**Nội dung đề tài** – Xây dựng website bán và nhận nuôi thú cưng với hai vai trò chính: **Khách hàng (User)** và **Quản trị viên (Admin)**.

* **User**: Phát triển bằng **MERN Stack** (MongoDB, Express.js, React.js, Node.js).
* **Admin**: Phát triển bằng **NestJS (Backend)** và **NextJS (Frontend)**.

---

## 📌 Mục lục

* [Giới thiệu](#giới-thiệu)
* [Tính năng chính](#tính-năng-chính)
* [Biểu đồ Use Case](#biểu-đồ-use-case)
* [WebSocket & Realtime Notification](#websocket--realtime-notification)
* [Công nghệ sử dụng](#công-ngệ-sử-dụng)
* [Cấu trúc thư mục](#cấu-trúc-thư-mục)
* [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
* [Biến môi trường](#biến-môi-trường)
* [Giao diện minh họa](#giao-diện-minh-họa)
* [Kiểm thử & Triển khai](#kiểm-thử--triển-khai)
* [Đóng góp](#đóng-góp)
* [Tác giả](#tác-giả)
* [Giấy phép](#giấy-phép)

---

## 🐶 Giới thiệu

Dự án xây dựng một **hệ thống website cửa hàng thú cưng** cho phép:

* Người dùng **tìm kiếm, xem chi tiết, đặt mua hoặc nhận nuôi thú cưng**.
* Quản trị viên **quản lý sản phẩm, đơn hàng, người dùng, khuyến mãi và tồn kho**.

Ứng dụng độc lập 2 phần giao tiếp thông qua REST API và WebSocket.

---

## 🚀 Tính năng chính

### 👤 Guest (Khách vãng lai)

* Xem danh sách thú cưng/sản phẩm
* Tìm kiếm theo tên, loại, giá
* Xem chi tiết thú cưng
* Đăng ký tài khoản

### 🛒 User (Khách hàng đăng nhập)

* Đăng nhập / Đăng xuất / Quên mật khẩu
* Quản lý hồ sơ cá nhân & địa chỉ nhận hàng
* Giỏ hàng: Thêm / sửa số lượng / xóa
* Đặt hàng & Thanh toán online (VNPay / Momo)
* Lịch sử đơn hàng: xem, đánh giá, hủy
* Danh sách yêu thích
* **Nhận thông báo realtime qua WebSocket**

### 🛠️ Admin (Quản trị viên)

* Đăng nhập / Đăng xuất
* **Quản lý sản phẩm**: Thêm / sửa / xóa / tồn kho
* **Quản lý đơn hàng**: cập nhật trạng thái realtime
* **Quản lý người dùng**: khóa/mở tài khoản
* **Quản lý khuyến mãi**
* Dashboard thống kê: doanh thu, sản phẩm bán chạy
* **Gửi thông báo realtime đến khách hàng**

---

## 🔔 WebSocket & Realtime Notification

Hệ thống sử dụng Socket.IO để:

* Gửi và nhận thông báo trạng thái đơn hàng theo thời gian thực
* Gửi thông báo khuyến mãi
* Mở rộng chat hỗ trợ

Luồng hoạt động:

1. User kết nối WebSocket bằng Access Token
2. Khi Admin đổi trạng thái đơn hàng → backend phát event
3. User nhận thông báo ngay lập tức trên UI

---

## 🧱 Biểu đồ Use Case

*(Lưu hình tại thư mục `/docs/`)*

### 1️⃣ Use Case Tổng Quan

![Use Case Chung](./docs/usecase-general.png)

### 2️⃣ Use Case Khách hàng

![Use Case User](./docs/usecase-user.png)

### 3️⃣ Use Case Admin

![Use Case Admin](./docs/usecase-admin.png)

---

## 🛠 Công nghệ sử dụng

| Phần                 | Công nghệ                                     |
| -------------------- | --------------------------------------------- |
| **Frontend - User**  | React.js, Redux/Context, Axios, React Router  |
| **Backend - User**   | Node.js, Express.js, JWT, Bcrypt, Socket.IO   |
| **Frontend - Admin** | Next.js (App Router), TailwindCSS / AntDesign |
| **Backend - Admin**  | NestJS, TypeScript, JWT, Swagger, Socket.IO   |
| **Database**         | MongoDB + Mongoose                            |
| **Công cụ khác**     | Postman, Git, MongoDB Compass                 |

---

## 📁 Cấu trúc thư mục

```
pet-adoption/
├── frontend/               # User Frontend (React)
├── server/                 # User Backend (Express)
├── admin-frontend/         # Admin Frontend (Next.js)
├── admin-server/           # Admin Backend (NestJS)
├── docs/                   # Biểu đồ & tài liệu
└── README.md
```

---

## ⚙️ Cài đặt và chạy dự án

### ✅ Yêu cầu

* Node.js >= 16
* MongoDB (local hoặc Atlas)
* Git

### Cài đặt

```bash
# Clone source
$ git clone https://github.com/PhatBee/pet-adoption.git
$ cd pet-adoption

# Cài từng phần
cd client && npm install && cd ..
cd server && npm install && cd ..
cd admin-frontend && npm install && cd ..
cd admin-server && npm install && cd ..
```

### Khởi chạy

| Phần           | Lệnh                                   | URL                                            |
| -------------- | -------------------------------------- | ---------------------------------------------- |
| User Backend   | `cd server && npm run dev`             | [http://localhost:5000](http://localhost:5000) |
| User Frontend  | `cd client && npm start`               | [http://localhost:3000](http://localhost:3000) |
| Admin Backend  | `cd admin-server && npm run start:dev` | [http://localhost:4000](http://localhost:4000) |
| Admin Frontend | `cd admin-frontend && npm run dev`     | [http://localhost:6060](http://localhost:6060) |

---

## 🔑 Biến môi trường

Xem chi tiết trong file `.env.example`.

---

## 🖼 Giao diện minh họa

> Cần bổ sung ảnh màn hình thực tế của bạn vào thư mục `docs/screens/`

| Trang             | Ảnh minh họa      |
| ----------------- | ----------------- |
| User - Trang chủ  | *(đang cập nhật)* |
| User - Giỏ hàng   | *(đang cập nhật)* |
| Admin - Dashboard | *(đang cập nhật)* |

---

## ✅ Kiểm thử & Triển khai

* Test API bằng Postman
* Xử lý lỗi tập trung

---

## 🤝 Đóng góp

Vui lòng:

1. Fork repo
2. Tạo nhánh mới: `feature/<ten-tinh-nang>`
3. Commit & tạo Pull Request

---

## 👨‍💻 Tác giả

**Thành viên 1**

* Họ tên: Ong Vĩnh Phát
* MSSV: 22110394
* Email: [vinhphatst1235@gmail.com](mailto:vinhphatst1235@gmail.com)
* GitHub: [https://github.com/PhatBee](https://github.com/PhatBee)

**Thành viên 2**

* Họ tên: Huỳnh Thị Mỹ Tâm
* MSSV: 22110410
* Email: [mytamhuynhhmt@gmail.com](mailto:mytamhuynhhmt@gmail.com)
* GitHub: [https://github.com/TamaOwO](https://github.com/TamaOwO)

---

## 📝 Giấy phép

Dự án được xây dựng với mục đích học tập và nghiên cứu. Không sử dụng cho mục đích thương mại.

---
