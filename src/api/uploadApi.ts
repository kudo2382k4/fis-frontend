import api from './axios';

export const uploadApi = {
  /**
   * Upload 1 file ảnh lên server.
   * @returns URL công khai của ảnh (ví dụ: http://localhost:8081/files/xxx.jpg)
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<{ url: string; filename: string }>(
      '/upload/image',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data.url;
  },
};
