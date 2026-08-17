import { axiosInstance } from "./axiosInstance";

// register a user
export const RegisterUser = async (payload) => {
  const response = await axiosInstance.post("/api/users/register", payload);
  return response.data;
};

// login a user
export const LoginUser = async (payload) => {
  const response = await axiosInstance.post("/api/users/login", payload);
  return response.data;
};

// get logged in user details
export const GetLoggedInUserDetails = async () => {
  const response = await axiosInstance.get("/api/users/get-logged-in-user");
  return response.data;
};

// get all users by role (patron | librarian | admin)
export const GetAllUsers = async (role) => {
  const response = await axiosInstance.get(`/api/users/get-all-users/${role}`);
  return response.data;
};

// get user by id
export const GetUserById = async (id) => {
  const response = await axiosInstance.get(`/api/users/get-user-by-id/${id}`);
  return response.data;
};
