import api from "./axios";

export const register = (userData: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => {
  return api.post("/auth/register", userData);
};

export const login = (credentials: {
  email: string;
  password: string;
}) => {
  return api.post("/auth/login", credentials);
};