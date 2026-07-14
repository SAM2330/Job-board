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
export const getProfile = () => {
  return api.get("/profile");
};

export const getPublicProfile = (userId: string) => {
  return api.get(`/profile/${userId}`);
};

export const uploadProfilePic = (file: File) => {
  const formData = new FormData();
  formData.append('profile_pic', file);
  return api.post('/profile/upload-pic', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateProfile = (profileData: {
  name?: string;
  bio?: string;
  profile_pic?: string;
  skills?: string[];
  education?: string;
  experience_summary?: string;
  resume_url?: string;
  company_name?: string;
  company_website?: string;
  company_industry?: string;
  company_size?: string;
}) => {
  return api.put("/profile", profileData);
};