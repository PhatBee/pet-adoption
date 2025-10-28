const ACCESS_KEY = "accessToken";

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY) || null;
export const setAccessToken = (token) => localStorage.setItem(ACCESS_KEY, token);
export const clearAccessToken = () => localStorage.removeItem(ACCESS_KEY);
