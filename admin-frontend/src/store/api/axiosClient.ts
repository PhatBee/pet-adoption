import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "../../utils/tokenStorage";

const axiosClient = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
  timeout: 10000,
});

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}

let isRefreshing = false;
let pendingQueue: PendingRequest[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  pendingQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      if (p.config.headers) { // Cần kiểm tra headers tồn tại
        p.config.headers.Authorization = `Bearer ${token}`;
      }
      p.resolve(axiosClient(p.config));
    }
  });
  pendingQueue = [];
};

axiosClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalConfig = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalConfig._retry && !originalConfig.url?.includes('/auth/refresh')) {
      originalConfig._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, config: originalConfig });
        });
      }

      isRefreshing = true;
      try {
        console.log("🔄 Refreshing token via POST...");

        const resp = await axiosClient.post("/auth/refresh");
        const { access_token } = resp.data;

        setAccessToken(access_token);
        processQueue(null, access_token);
        isRefreshing = false;

        if (originalConfig.headers) {
          originalConfig.headers.Authorization = `Bearer ${access_token}`;
        }

        return axiosClient(originalConfig);
      } catch (err: any) {
        processQueue(err, null);
        isRefreshing = false;
        clearAccessToken();

        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login'; 
        }

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;