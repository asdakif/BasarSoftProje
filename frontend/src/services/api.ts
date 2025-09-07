import axios from 'axios';
import { FeatureReadDto, FeatureCreateDto, FeatureUpdateDto, ApiResponse, Paged } from '../types';

const envBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5160/api';
export const API_BASE_URL = envBase;
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/$/, '').replace(/\/api$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const featureService = {
  getAll: async (page: number = 1, pageSize: number = 100, name?: string): Promise<ApiResponse<Paged<FeatureReadDto>>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (name) params.append('name', name);
    
    const response = await api.get(`/features?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<FeatureReadDto>> => {
    const response = await api.get(`/features/${id}`);
    return response.data;
  },

  create: async (feature: FeatureCreateDto): Promise<ApiResponse<FeatureReadDto>> => {
    const response = await api.post('/features', feature);
    return response.data;
  },

  update: async (id: number, feature: FeatureUpdateDto): Promise<ApiResponse<FeatureReadDto>> => {
    const response = await api.put(`/features/${id}`, feature);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<object>> => {
    const response = await api.delete(`/features/${id}`);
    return response.data;
  },

  addRange: async (features: FeatureCreateDto[]): Promise<ApiResponse<object>> => {
    const response = await api.post('/features/addrange', features);
    return response.data;
  },

  uploadPhotos: async (
    id: number,
    files: File[],
    onProgress?: (percent: number) => void
  ): Promise<ApiResponse<{ id: number; photos: string[] }>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await api.post(`/features/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (evt.total) {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          onProgress?.(percent);
        }
      },
    });
    return response.data;
  },

  


};

export default api;


