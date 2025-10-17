// src/services/api.ts
import axios from 'axios';

// Tạo một instance của axios với cấu hình cơ bản
// Giúp chúng ta không cần lặp lại baseURL mỗi lần gọi API
const apiClient = axios.create({
  baseURL: 'http://localhost:4000', // ⚠️ Cập nhật port nếu backend của bạn chạy ở port khác
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Hàm gọi API đăng nhập
 * @param email 
 * @param password 
 * @returns Promise chứa dữ liệu trả về từ server (bao gồm access_token)
 */
export const loginApi = async (email: string, password: string) => {
  // Gửi request POST đến endpoint /auth/login
  const response = await apiClient.post('/auth/login', {
    email,
    password,
  });
  // Trả về phần data của response
  return response.data;
};

// Bạn có thể thêm các hàm gọi API khác ở đây trong tương lai
// export const getProductsApi = async () => { ... };