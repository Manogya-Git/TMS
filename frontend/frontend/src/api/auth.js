import api from "./axios";

export const register = async (data) => {
  const res = await api.post("/auth/register/", data);
  return res.data;
};

export const login = async (username, password) => {
  const res = await api.post("/token/", { username, password });
  localStorage.setItem("access_token", res.data.access);
  localStorage.setItem("refresh_token", res.data.refresh);
  return res.data;
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};
