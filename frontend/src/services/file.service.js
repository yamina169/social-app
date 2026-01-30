// src/services/file.service.js
import { api } from "./api"; // your Axios instance

const FileService = {
  /**
   * Upload a file to backend
   * @param {File} file - file object from input
   * @param {Object} metadata - e.g. { title: 'My File', uploadedBy: 'username' }
   * @returns {Promise<Object>} uploaded file info { key, name, bucket, title, uploadedBy }
   */
  uploadFile: async (file, metadata) => {
    if (!file) throw new Error("File is required");

    const formData = new FormData();
    formData.append("file", file);
    if (metadata?.title) formData.append("title", metadata.title);
    if (metadata?.uploadedBy)
      formData.append("uploadedBy", metadata.uploadedBy);

    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data; // will include 'name' and 'key'
  },

  /**
   * Get a file from backend
   * @param {string} key - file key (filename)
   * @param {boolean} download - if true, triggers browser download
   * @returns {Promise<Blob>} file blob
   */
  getFile: async (key, download = false) => {
    const response = await api.get(`/files/${key}`, {
      params: { download },
      responseType: "blob", // important to get file content
    });

    if (download) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", key); // use key as filename
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    return response.data;
  },
};

export default FileService;
