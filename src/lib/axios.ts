import axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor (e.g., attaching tokens)
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token'); // Or get from a store like Zustand
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// 3. Response Interceptor (e.g., global error handling)
apiClient.interceptors.response.use(
  (response) => response.data, // Return data directly to avoid .data.data in components
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
    }
    return Promise.reject(error);
  }
);