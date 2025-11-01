# Website Cửa Hàng Thú Cưng



**Nội dung đề tài** – Xây dựng website bán hànghàng thú cưng với hai vai trò chính: **Khách hàng (User)** và **Quản trị viên (Admin)**.

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
* **Quản lý kho**
* **Quản lý loại thú cưng**
* **Quản lý thể loại**
* Dashboard thống kê: doanh thu, sản phẩm bán chạy
* **Gửi thông báo realtime đến khách hàng**
---

### Mô tả ngắn các chức năng
| STT | Chức năng                                 | Vai trò       | Mô tả                                                                                                                                                                      |
| --- | ----------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Đăng ký                                   | Guest         | Chức năng cho phép khách có thể tạo tài khoản mới bằng cách nhập email, họ tên, mật khẩu. Hệ thống gửi OTP xác nhận về email đã đăng ký.                                   |
| 2   | Đăng nhập                                 | Guest         | Người dùng đăng nhập để dùng các chức năng của web                                                                                                                         |
| 3   | Quên mật khẩu                             | Guest         | Chức năng cho phép khách đổi mật khẩu                                                                                                                                      |
| 4   | Đăng xuất                                 | Admin<br>User | Người dùng có thể đăng xuất khỏi hệ thống.                                                                                                                                 |
| 5   | Tìm kiếm sản phẩm                         | Guest<br>User | Chức năng cho phép Người dùng hoặc Khách thực hiện tìm kiếm sản phẩm theo tên hoặc từ khóa liên quan. Đồng thời có thể sử dụng bộ lọc (theo danh mục, khoảng giá, sắp xếp) |
| 6   | Xem chi tiết sản phẩm                     | Guest<br>User | Chức năng cho phép tác nhân xem chi tiết sản phẩm (tên sản phẩm, hình ảnh, giá, mô tả, danh mục, các sản phẩm tương tự, bình luận, đánh giá,…).                            |
| 7   | Cập nhật thông tin cá nhân                | User          | Người dùng có thể cập nhật thông tin cá nhân (họ và tên, ảnh đại diện, giới tính, số điện thoại).                                                                          |
| 8   | Thêm địa chỉ                              | User          | Người dùng thực hiện thêm thông tin địa chỉ cho thông tin cá nhân                                                                                                          |
| 9   | Cập nhật địa chỉ                          | User          | Người dùng cập nhật thông tin địa chỉ giao hàng.                                                                                                                           |
| 10  | Xóa địa chỉ                               | User          | Người dùng xóa địa chỉ theo nhu cầu.                                                                                                                                       |
| 11  | Xem giỏ hàng                              | User          | Người dùng xem sản phẩm trong giỏ hàng                                                                                                                                     |
| 12  | Thêm sản phẩm vào giỏ hàng                | User          | Người dùng thêm sản phẩm vào giỏ hàng từ trang chi tiết sản phẩm.                                                                                                          |
| 13  | Cập nhật số lượng sản phẩm trong giỏ hàng | User          | Người dùng điều chỉnh số lượng sản phẩm trong giỏ hàng                                                                                                                     |
| 14  | Xóa sản phẩm khỏi giỏ hàng                | User          | Người dùng có thể chọn một, nhiều hoặc tất cả sản phẩm trong giỏ hàng và nhấn chọn để xóa chúng.                                                                           |
| 15  | Đặt hàng                                  | User          | Mua sản phẩm từ trong mục giỏ hàng hoặc mua ngay từ trang chi tiết sản phẩm                                                                                                |
| 16  | Thanh toán                                | User          | Người dùng thực hiện thanh toán thông qua ví Momo hoặc COD                                                                                                                 |
| 17  | Xem danh sách lịch sử đơn hàng            | User          | Người dùng có thể xem danh sách lịch sử các đơn hàng                                                                                                                       |
| 18  | Xem chi tiết lịch sử đơn hàng             | User          | Xem chi chi tiết thông tin đơn hàng đã đặt (danh sách sản phẩm, giá tiền từng món, tổng giá, địa chỉ đặt hàng,…)                                                           |
| 19  | Đánh giá sản phẩm                         | User          | Đánh giá chất lượng sản phẩm cho đơn hàng đã giao, đã hoàn thành                                                                                                           |
| 20  | Hủy đơn hàng                              | User          | Người dùng có thể hủy một đơn hàng đã đặt khi đơn hàng đó đang ở trạng thái “Đang xử lý”.                                                                                  |
| 21  | Xem danh sách yêu thích                   | User          | Xem tất cả sản phẩm đã được thêm vào danh sách sản phẩm yêu thích                                                                                                          |
| 22  | Thêm sản phẩm vào danh sách yêu thích     | User          | Thêm sản phẩm yêu thích vào danh sách.                                                                                                                                     |
| 23  | Xóa sản phẩm khỏi danh sách yêu thích     | User          | Xóa sản phẩm khỏi danh sách yêu thích nếu không còn nhu cầu                                                                                                                |
| 24  | Xem thông báo                             | User          | Người dùng nhận và xem thông báo khi tạo đơn hàng mới hoặc trạng thái đơn hàng đã được thay đổi                                                                            |
| 25  | Xóa tất cả sản phẩm khỏi giỏ hàng         | User          | Người dùng xóa tất cả sản phẩm khỏi giỏ hàng                                                                                                                               |
| 26  | Thay đổi mật khẩu                         | User          | Người dùng thay đổi mật khẩu hiện có                                                                                                                                       |
| 27  | Xóa tài khoản                             | User          | Người dùng thực hiện xóa tài khoản khỏi hệ thống                                                                                                                           |
| 28  | Lưu mã khuyến mãi                         | User          | Người dùng thực hiện lưu mã khuyến mãi sử dụng trong đặt hàng                                                                                                              |
| 29  | Áp dụng mã khuyến mãi                     | User          | Người dùng áp dụng mã khuyến mãi trong quá trình đặt hàng                                                                                                                  |
| 30  | Mua lại sản phẩm từ đơn hàng              | User          | Người dùng mua lại các sản phẩm từ đơn hàng trước đó                                                                                                                       |
| 31  | Xem lại sản phẩm đã mua từ đơn hàng       | User          | Giúp người dùng xem lại thông tin sản phẩm tại thời điểm mua hàng và so sánh với thông tin sản phẩm hiện tại                                                               |
| 32  | Xem danh sách người dùng                  | Admin         | Quản trị viên xem danh sách tất cả người                                                                                                                                   |
| 33  | Quản lý trạng thái người dùng             | Admin         | Quản trị viên quản lý trạng thái của khách hàng                                                                                                                            |
| 34  | Xem danh sách sản phẩm                    | Admin         | Quản trị viên xem các sản phẩm đang có trên hệ thống                                                                                                                       |
| 35  | Thêm sản phẩm                             | Admin         | Quản trị viên thêm một sản phẩm mới vào hệ thống                                                                                                                           |
| 36  | Cập nhật thông tin sản phẩm               | Admin         | Chỉnh sửa thông tin sản phẩm có trong danh sách nếu có sai sót                                                                                                             |
| 37  | Quản lý trạng thái sản phẩm               | Admin         | Quản trị viên quản lý trạng thái của sản phẩm                                                                                                                              |
| 38  | Xem danh sách sản phẩm trong kho          | Admin         | Quản trị viên xem số lượng tồn kho của sản phẩm                                                                                                                            |
| 39  | Cập nhật số lượng trong kho               | Admin         | Quản trị viên cập nhật số lượng sản phẩm trong kho.                                                                                                                        |
| 40  | Xem danh sách đơn hàng                    | Admin         | Quản trị viên xem danh sách các đơn hàng trên hệ thống                                                                                                                     |
| 41  | Cập nhật trạng thái đơn hàng              | Admin         | Cập nhật trạng thái đơn hàng (Đang xử lý, Xác nhận, Đang chuẩn bị hàng, đang giao, Đã giao, Hủy đơn)                                                                       |
| 42  | Xem danh sách mã giảm giá                 | Admin         | Quản trị viên xem danh sách các mã khuyến mãi trên hệ thống                                                                                                                |
| 43  | Cập nhật mã giảm giá                      | Admin         | Quản trị viên cập nhật thông tin mã khuyến mãi                                                                                                                             |
| 44  | Thêm mã giảm giá                          | Admin         | Quản trị viên thêm một khuyến mãi mới vào hệ thống                                                                                                                         |
| 45  | Quản lý trạng thái mã giảm giá            | Admin         | Quản trị viên quản lý trạng thái của mã khuyến mãi                                                                                                                         |
| 46  | Xem danh sách thú cưng                    | Admin         | Quản trị viên xem danh sách loại thú cưng                                                                                                                                  |
| 47  | Thêm loại thú cưng                        | Admin         | Quản trị viên thêm loại thú cưng mới vào hệ thống                                                                                                                          |
| 48  | Cập nhật loại thú cưng                    | Admin         | Quản trị viên cập nhật thông tin của loại thú cưng                                                                                                                         |
| 49  | Xóa loại thú cưng                         | Admin         | Quản trị viên xóa loại thú cưng khỏi hệ thống                                                                                                                              |
| 50  | Xem danh sách thể loại                    | Admin         | Quản trị viên xem danh sách thể loại                                                                                                                                       |
| 51  | Thêm thể loại                             | Admin         | Quản trị viên thêm thể loại mới vào hệ thống                                                                                                                               |
| 52  | Cập nhật thể loại                         | Admin         | Quản trị viên cập nhật thông tin thể loại                                                                                                                                  |
| 53  | Xóa thể loại                              | Admin         | Quản trị viên xóa thể loại khỏi hệ thống                                                                                                                                   |
| 54  | Xem biểu đồ thống kê doanh thu            | Admin         | Quản trị viên và xem thống kê doanh thu theo tuần, tháng để đưa ra những báo cáo                                                                                           |


## 🔔 WebSocket & Realtime Notification

Hệ thống sử dụng Socket.IO để:

* Gửi và nhận thông báo trạng thái đơn hàng theo thời gian thực
* Gửi thông báo khuyến mãi (sắp phát triển)
* Mở rộng chat hỗ trợ (sắp phát triển)

Luồng hoạt động:

1. User kết nối WebSocket bằng Access Token
2. Khi Admin đổi trạng thái đơn hàng → backend phát event
3. User nhận thông báo ngay lập tức trên UI

---

## 🧱 Biểu đồ Use Case

*(Lưu hình tại thư mục `/docs/`)*

### 1️⃣ Use Case Tổng Quan

![Use Case Chung](./docs/All.png)

### 2️⃣ Use Case Khách hàng

![Use Case User](./docs/User.png)

### 3️⃣ Use Case Admin

![Use Case Admin](./docs/Admin.png)

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
