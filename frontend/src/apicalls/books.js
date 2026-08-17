import { axiosInstance } from "./axiosInstance";

// add book
export const AddBook = async (payload) => {
  const response = await axiosInstance.post("/api/books/add-book", payload);
  return response.data;
};

// get all books
export const GetAllBooks = async () => {
  const response = await axiosInstance.get("/api/books/get-all-books");
  return response.data;
};

// update book
export const UpdateBook = async (payload) => {
  const response = await axiosInstance.put(`/api/books/update-book/${payload.id}`, payload);
  return response.data;
};

// delete book
export const DeleteBook = async (id) => {
  const response = await axiosInstance.delete(`/api/books/delete-book/${id}`);
  return response.data;
};

// get book by id
export const GetBookById = async (id) => {
  const response = await axiosInstance.get(`/api/books/get-book-by-id/${id}`);
  return response.data;
};
