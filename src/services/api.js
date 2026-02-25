import axios from 'axios';

// API Entry point
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5008/api';

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
        const status = error.response?.status;
        const requestUrl = error.config?.url || '';
        const isLoginRequest = requestUrl.includes('/auth/login');

        if (status === 401 && !isLoginRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// ==========================================
// AUTH SERVICE
// ==========================================
export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
    changePassword: (data) => api.post('/auth/change-password', data),
    logout: () => api.post('/auth/logout'),
};

// ==========================================
// ADMIN SERVICE
// ==========================================
export const adminService = {
    // USERS
    getUsers: (params) => api.get('/users', { params }),
    getUser: (id) => api.get(`/users/${id}`),
    createUser: (data) => api.post('/users', data),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    activateUser: (id) => api.put(`/users/${id}/activate`),
    deactivateUser: (id) => api.put(`/users/${id}/deactivate`),
    deleteUser: (id) => api.delete(`/users/${id}`),
    getUserStats: (params) => api.get('/users/stats', { params }),

    // DEPARTMENTS
    getDepartments: (params) => api.get('/departments', { params }),
    getDepartment: (id) => api.get(`/departments/${id}`),
    getDepartmentUsers: (id) => api.get(`/departments/${id}/users`),
    getDepartmentStats: (id) => api.get(`/departments/${id}/stats`),
    createDepartment: (data) => api.post('/departments', data),
    updateDepartment: (id, data) => api.put(`/departments/${id}`, data),
    deleteDepartment: (id) => api.delete(`/departments/${id}`),
};

// ==========================================
// REPORT SERVICE
// ==========================================
export const reportService = {
    createReport: (data) => api.post('/reports', data),
    getMyReports: (params) => api.get('/reports/my-reports', { params }),
    getAllReports: (params) => api.get('/reports', { params }),
    getReportDetails: (id) => api.get(`/reports/${id}`),
    updateReport: (id, payload) => api.put(`/reports/${id}`, payload),
    deleteReport: (id) => api.delete(`/reports/${id}`),
    submitReport: (id) => api.post(`/reports/${id}/submit`),
    validateReport: (id, data) => api.post(`/reports/${id}/validate`, data),
    getDepartmentStats: (departmentId, params) =>
        api.get(`/reports/stats/${departmentId}`, { params }),
    // Commentaires
    getReportComments: (id) => api.get(`/reports/${id}/comments`),
    addReportComment: (id, data) => api.post(`/reports/${id}/comments`, data),

    // Lectures
    markReportAsRead: (id) => api.post(`/reports/${id}/read`),
    getReportReaders: (id) => api.get(`/reports/${id}/readers`),

    // Annotations
    addReportAnnotation: (id, data) => api.post(`/reports/${id}/annotations`, data),

    // Obtenir les lecteurs d'un rapport
    getReaders: async (reportId) => {
        try {
            const response = await axios.get(`/api/reports/${reportId}/readers`);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des lecteurs", error);
            throw error;
        }
    },

    // Marquer un rapport comme lu
    markAsRead: async (reportId) => {
        try {
            const response = await axios.post(`/api/reports/${reportId}/mark-as-read`);
            return response.data;
        } catch (error) {
            console.error("Erreur lors du marquage du rapport comme lu", error);
            throw error;
        }
    },
    // Export PDF
    exportReportPdf: (id) =>
        api.get(`/reports/${id}/export/pdf`, { responseType: "blob" }),
};

// ==========================================
// DEPARTMENT SERVICE
// ==========================================
export const departmentService = {
    getAll: (params) => api.get('/departments', { params }),
    getById: (id) => api.get(`/departments/${id}`),
    getUsers: (id) => api.get(`/departments/${id}/users`),
    getStats: (id) => api.get(`/departments/${id}/stats`),
};

// ==========================================
// NOTIFICATION SERVICE
// ==========================================
export const notificationService = {
    getAll: (params) => api.get('/notifications', { params }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`),
    getStats: () => api.get('/notifications/stats'),
};

// ==========================================
// REPORT ACCESS SERVICE
// ==========================================
export const reportAccessService = {
    requestAccess: (reportId, reason) =>
        api.post(`/report-access/report/${reportId}/request`, { reason }),
    getPending: () => api.get('/report-access/pending'),
    approve: (id) => api.post(`/report-access/${id}/approve`),
    reject: (id, reason) => api.post(`/report-access/${id}/reject`, { reason }),
};

// ==========================================
// REPORT COMMENT SERVICE
// ==========================================
export const reportCommentService = {
    list: (reportId) => api.get(`/reports/${reportId}/comments`),
    create: (reportId, comment) =>
        api.post(`/reports/${reportId}/comments`, { comment }),
    delete: (commentId) => api.delete(`/reports/comments/${commentId}`),
};

export default api;