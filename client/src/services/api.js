import axios from 'axios';

// Ensure API URL always ends with /api
const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // Remove trailing slash if exists
    url = url.replace(/\/$/, '');
    // Append /api if not present
    if (!url.endsWith('/api')) {
        url += '/api';
    }
    return url;
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
