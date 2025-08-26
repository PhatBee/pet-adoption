// Quản lý phiên đăng nhập 

import React, { createContext, useContext, useEffect, useState } from "react";
import { loginApi, meApi, logoutApi, getProfileApi } from "../api/authApi";
import { getAccessToken, setAccessToken, clearAccessToken } from "../utils/tokenStorage";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Khởi động: nếu có accessToken -> thử /me
  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (getAccessToken()) {
          const res = await meApi();
          setUser(res.data.user || res.data);
          setIsAuthed(true);
        }
      } catch {
        clearAccessToken();
        setIsAuthed(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    const { accessToken, user } = res.data;
    setAccessToken(accessToken);
    setUser(user || null);
    setIsAuthed(true);
    return res.data;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfileApi();
        setUser(profile);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const logout = async () => {
    try { await logoutApi(); } catch {}
    clearAccessToken();
    setUser(null);
    setIsAuthed(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthed, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
