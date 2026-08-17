import { axiosInstance } from "./axiosInstance";

// get dashboard reports
export const GetReports = async () => {
  const response = await axiosInstance.get("/api/reports/get-reports");
  return response.data;
};
