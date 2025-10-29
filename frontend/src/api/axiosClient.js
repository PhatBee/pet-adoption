import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "../utils/tokenStorage";

const API = process.env.REACT_APP_BASE;

const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // QUAN TRỌNG: gửi/nhận HttpOnly cookie (refreshToken)
  timeout: 10000,
});

const refreshClient = axios.create({
  baseURL: `${API}/api`,
  withCredentials: true,
  timeout: 10000,
});

// Gắn Bearer access token
axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Hàng đợi khi đang refresh để tránh gọi refresh nhiều lần
let isRefreshing = false;
let pendingQueue = []; // { resolve, reject, config }

const processQueue = (error, token = null) => {
  pendingQueue.forEach((p) => {
    if (error) p.reject(error);
    else {
      p.config.headers.Authorization = `Bearer ${token}`;
      p.resolve(axiosClient(p.config));
    }
  });
  pendingQueue = [];
};

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalConfig = error.config;

    // Nếu không có response hoặc không phải lỗi 401/403 thì throw
    const status = error.response?.status;
    if (!status) return Promise.reject(error);

    // Fix precedence: chỉ chạy khi 401 hoặc 403 *và* chưa retry
    if ((status === 401 || status === 403) && !originalConfig?._retry) {
      originalConfig._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, config: originalConfig });
        });
      }

      isRefreshing = true;
      try {
        // GỌI /auth/refresh – server đọc refreshToken từ HttpOnly cookie
        const resp = await refreshClient.get("/auth/refresh");
        const { accessToken } = resp.data;

        setAccessToken(accessToken);
        processQueue(null, accessToken);
        isRefreshing = false;

        originalConfig.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalConfig);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        clearAccessToken(); // buộc đăng nhập lại

        // optional: redirect to login page (nếu muốn)
        // try {
        //   // If you're using react-router, do navigation in the app instead
        //   // fallback: force reload to login
        //   window.location.href = "/login";
        // } catch (e) {
        //   // ignore
        // }

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
