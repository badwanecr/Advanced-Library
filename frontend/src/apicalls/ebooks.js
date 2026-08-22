import { axiosInstance } from "./axiosInstance";

// add a title to the digital catalogue (librarians and admins)
export const AddEbook = async (payload) => {
  const response = await axiosInstance.post("/api/ebooks/add-ebook", payload);
  return response.data;
};

export const UpdateEbook = async (payload) => {
  const response = await axiosInstance.put(`/api/ebooks/update-ebook/${payload.id}`, payload);
  return response.data;
};

export const DeleteEbook = async (id) => {
  const response = await axiosInstance.delete(`/api/ebooks/delete-ebook/${id}`);
  return response.data;
};

// every ebook, with this user's access flags
export const GetAllEbooks = async () => {
  const response = await axiosInstance.get("/api/ebooks/get-ebooks");
  return response.data;
};

export const GetEbookById = async (id) => {
  const response = await axiosInstance.get(`/api/ebooks/get-ebook-by-id/${id}`);
  return response.data;
};

// subscription state + prices + what an upgrade would cost today
export const GetEbookAccess = async () => {
  const response = await axiosInstance.get("/api/ebooks/get-access");
  return response.data;
};

export const Subscribe = async (payload) => {
  const response = await axiosInstance.post("/api/ebooks/subscribe", payload);
  return response.data;
};

export const RentEbook = async (payload) => {
  const response = await axiosInstance.post("/api/ebooks/rent", payload);
  return response.data;
};

export const UploadEbookPdf = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post(`/api/ebooks/upload-pdf/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const DeleteEbookPdf = async (id) => {
  const response = await axiosInstance.delete(`/api/ebooks/delete-pdf/${id}`);
  return response.data;
};

/** How many pages this reader may page through. */
export const GetEbookPageCount = async (id) => {
  const response = await axiosInstance.get(`/api/ebooks/page-count/${id}`);
  return response.data;
};

/**
 * Fetches one page as a watermarked image. The PDF file itself is never sent to a patron, so
 * there is no file for the browser to offer as a download. Returns an object URL to revoke later.
 */
export const FetchEbookPage = async (id, page) => {
  const response = await axiosInstance.get(`/api/ebooks/page/${id}/${page}`, { responseType: "blob" });
  if (response.data.type === "application/json") {
    const text = await response.data.text();
    throw new Error(JSON.parse(text).message || "You cannot read this ebook");
  }
  return URL.createObjectURL(response.data);
};
