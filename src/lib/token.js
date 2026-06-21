// JWT persistence (MVP: localStorage; documented trade-off vs httpOnly cookie).
const KEY = "pt_token";

export const getToken = () => localStorage.getItem(KEY);
export const setToken = (token) => localStorage.setItem(KEY, token);
export const clearToken = () => localStorage.removeItem(KEY);
