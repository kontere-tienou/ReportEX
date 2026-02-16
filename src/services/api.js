import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://030b-154-118-146-238.ngrok-free.app/api';

// Instance Axios avec configuration
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Services API
export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
    changePassword: (data) => api.post('/auth/change-password', data),
};

export const reportService = {
    // Ensure that the params are sent correctly with GET
    getDepartmentStats: (departmentId, params) => {
        return api.get(`/reports/stats/${departmentId}`, { params });
    },

    // Example for other endpoints (create, get reports, etc.)
    getTemplates: (departmentId) => api.get(`/reports/templates/${departmentId}`),
    createReport: (data) => api.post('/reports', data),
    getMyReports: (params) => api.get('/reports/my-reports', { params }),
    getReport: (id) => api.get(`/reports/${id}`),
    updateReport: (id, data) => api.put(`/reports/${id}`, data),
    submitReport: (id) => api.post(`/reports/${id}/submit`),
    validateReport: (id, data) => api.post(`/reports/${id}/validate`, data),
};


export const departmentService = {
    getAll: () => api.get('/departments'),
    getById: (id) => api.get(`/departments/${id}`),
};

export const notificationService = {
    getAll: (params) => api.get('/notifications', { params }),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;