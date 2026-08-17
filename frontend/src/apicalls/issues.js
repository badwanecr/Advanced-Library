import { axiosInstance } from "./axiosInstance";

// issue a book
export const IssueBook = async (payload) => {
  const response = await axiosInstance.post("/api/issues/issue-new-book", payload);
  return response.data;
};

// get issues (optionally filtered by { bookId } and/or { userId })
export const GetIssues = async (payload) => {
  const response = await axiosInstance.post("/api/issues/get-issues", payload);
  return response.data;
};

// return a book
export const ReturnBook = async (payload) => {
  const response = await axiosInstance.post("/api/issues/return-book", payload);
  return response.data;
};

// delete an issue
export const DeleteIssue = async (payload) => {
  const response = await axiosInstance.post("/api/issues/delete-issue", payload);
  return response.data;
};

// edit / renew an issue
export const EditIssue = async (payload) => {
  const response = await axiosInstance.post("/api/issues/edit-issue", payload);
  return response.data;
};
