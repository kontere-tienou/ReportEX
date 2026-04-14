import axios from 'axios';

/* ==========================================================
   AXIOS INSTANCE CONFIGURATION
========================================================== */

// Détection intelligente de l'URL de l'API
const getBaseUrl = () => {
    // 1. Priorité à la variable d'environnement (Vite)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // 2. Si on est sur le domaine Railway en production, on utilise l'API Railway
    if (window.location.hostname.includes('railway.app')) {
        return 'https://reportex-back-end-production.up.railway.app/api';
    }

    // 3. Par défaut, mode local
    //return 'http://localhost:5008/api';
    return 'https://reportex-back-end-production.up.railway.app/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
    // Optionnel : timeout de 10 secondes pour éviter les requêtes infinies
    timeout: 10000,
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
        const isLoginRequest = error.config?.url?.includes('/auth/login');

        // Si 401 (Non autorisé) et que ce n'est pas une tentative de login
        if (status === 401 && !isLoginRequest) {
            console.warn("Session expirée ou non autorisée. Redirection...");
            localStorage.clear();

            // Évite les boucles de redirection
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // Centralisation des erreurs pour faciliter le débug
        const message = error.response?.data?.message || "Une erreur est survenue";
        return Promise.reject({ ...error, message });
    }
);

/* ==========================================================
   SERVICES (Export groupés)
========================================================== */

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
    changePassword: (data) => api.post('/auth/change-password', data),
    logout: () => {
        localStorage.clear();
        return api.post('/auth/logout');
    },
};

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

export const departmentService = {
    getAll: (params) => api.get('/departments', { params }),
    getById: (id) => api.get(`/departments/${id}`),
    getUsers: (id) => api.get(`/departments/${id}/users`),
    getStats: (id) => api.get(`/departments/${id}/stats`),
};

export const notificationService = {
    getAll: (params) => api.get('/notifications', { params }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`),
    getStats: () => api.get('/notifications/stats'),
};

export default api;