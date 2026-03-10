// dataService.js
import api from './api.js';

export const dataService = {
    async getAll(deptCode, params = {}) {
        const response = await api.get(`/${deptCode}/data`, { params });
        return response.data.data || response.data || [];
    },

    async getById(deptCode, id) {
        const response = await api.get(`/${deptCode}/data/${id}`);
        return response.data.data;
    },

    async create(deptCode, data) {
        try {
            const response = await api.post(`/${deptCode}/data`, data);
            return response.data.data;
        } catch (error) {
            console.error('❌ Create error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });

            // Log the validation errors if any
            if (error.response?.data?.errors) {
                console.error('Validation errors:', error.response.data.errors);
            }

            throw error;
        }
    },

    async update(deptCode, id, data) {
        try {const response = await api.put(`/${deptCode}/data/${id}`, data);
            return response.data.data;
        } catch (error) {
            console.error('❌ Update error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    async delete(deptCode, id) {
        const response = await api.delete(`/${deptCode}/data/${id}`);
        return response.data;
    },

    async getStats(deptCode) {
        const response = await api.get(`/${deptCode}/data/stats`);
        return response.data;
    },

    async exportData(deptCode, params = {}) {
        const response = await api.get(`/${deptCode}/data/export`, {
            params,
            responseType: 'blob',
        });
        return response.data;
    },
};