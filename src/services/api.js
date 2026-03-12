import axios from 'axios';

/* ==========================================================
   AXIOS INSTANCE CONFIGURATION
========================================================== */

const API_URL =
    import.meta.env.VITE_API_URL || 'https://reportex-back-end.up.railway.app/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/* ==========================================================
   REQUEST INTERCEPTOR (Attach JWT Token)
========================================================== */

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/* ==========================================================
   RESPONSE INTERCEPTOR (Auto Logout on 401)
========================================================== */

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const isLoginRequest =
            error.config?.url?.includes('/auth/login');

        if (status === 401 && !isLoginRequest) {
            localStorage.clear();

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

/* ==========================================================
   AUTH SERVICE
========================================================== */

export const authService = {
    login: (credentials) =>
        api.post('/auth/login', credentials),

    getProfile: () =>
        api.get('/auth/profile'),

    changePassword: (data) =>
        api.post('/auth/change-password', data),

    logout: () =>
        api.post('/auth/logout'),
};

/* ==========================================================
   ADMIN SERVICE
========================================================== */

export const adminService = {
    // USERS
    getUsers: (params) =>
        api.get('/users', { params }),

    getUser: (id) =>
        api.get(`/users/${id}`),

    createUser: (data) =>
        api.post('/users', data),

    updateUser: (id, data) =>
        api.put(`/users/${id}`, data),

    activateUser: (id) =>
        api.put(`/users/${id}/activate`),

    deactivateUser: (id) =>
        api.put(`/users/${id}/deactivate`),

    deleteUser: (id) =>
        api.delete(`/users/${id}`),

    getUserStats: (params) =>
        api.get('/users/stats', { params }),

    // DEPARTMENTS
    getDepartments: (params) =>
        api.get('/departments', { params }),

    getDepartment: (id) =>
        api.get(`/departments/${id}`),

    getDepartmentUsers: (id) =>
        api.get(`/departments/${id}/users`),

    getDepartmentStats: (id) =>
        api.get(`/departments/${id}/stats`),

    createDepartment: (data) =>
        api.post('/departments', data),

    updateDepartment: (id, data) =>
        api.put(`/departments/${id}`, data),

    deleteDepartment: (id) =>
        api.delete(`/departments/${id}`),
};



/* ==========================================================
   DEPARTMENT SERVICE
========================================================== */

export const departmentService = {
    getAll: (params) =>
        api.get('/departments', { params }),

    getById: (id) =>
        api.get(`/departments/${id}`),

    getUsers: (id) =>
        api.get(`/departments/${id}/users`),

    getStats: (id) =>
        api.get(`/departments/${id}/stats`),
};

/* ==========================================================
   NOTIFICATION SERVICE
========================================================== */

export const notificationService = {
    getAll: (params) =>
        api.get('/notifications', { params }),

    getUnreadCount: () =>
        api.get('/notifications/unread-count'),

    markAsRead: (id) =>
        api.put(`/notifications/${id}/read`),

    markAllAsRead: () =>
        api.put('/notifications/read-all'),

    delete: (id) =>
        api.delete(`/notifications/${id}`),

    getStats: () =>
        api.get('/notifications/stats'),
};



export default api;