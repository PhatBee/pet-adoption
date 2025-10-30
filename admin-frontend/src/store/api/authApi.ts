import { setAccessToken } from '../../utils/tokenStorage';
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
/**
 * Gọi API đăng nhập Admin
 * @param credentials email & password
 * @returns dữ liệu token và user nếu thành công
 */
export const loginAdminApi = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Đăng nhập thất bại');
  }

  setAccessToken(data.access_token);

  return data;
};
