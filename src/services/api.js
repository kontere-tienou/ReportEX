import axios from 'axios';

// API Entry point here
const API_URL = import.meta.env.VITE_API_URL1 || 'http://localhost:5008/api';

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
    createReport: (data) => api.post('/reports', data),
    getMyReports: (params) => api.get('/reports/my-reports', { params }),
    submitReport: (id) => api.post(`/reports/${id}/submit`),
    validateReport: (id, data) => api.post(`/reports/${id}/validate`, data),
    getAllReports: (params) => api.get("/reports", { params }),
    deleteReport: (id) => api.delete(`/reports/${id}`),
    getReportDetails: (params) => api.get(`/reports/${id}/details`),
    updateReport: (id, payload) => api.put(`/reports/${id}`, payload),
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


export const reportAccessService = {
    requestAccess: (reportId) => api.post(`/report-access/report/${reportId}/request`),
    getPending: () => api.get(`/report-access/pending`),
    approve: (id) => api.post(`/report-access/${id}/approve`),
    reject: (id) => api.post(`/report-access/${id}/reject`),
};

export const reportCommentService = {
    list: (reportId) => api.get(`/reports/${reportId}/comments`),
    create: (reportId, comment) => api.post(`/reports/${reportId}/comments`, { comment }),
    remove: (commentId) => api.delete(`/reports/comments/${commentId}`),
};

export default api;