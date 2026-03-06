import api from '../../../../services/api.js';

export const dataService = {
    async getAll(deptCode, params = {}) {
        // Remove the leading /api - just use /${deptCode}/data
        const response = await api.get(`/${deptCode}/data`, { params });
        return response.data.data || response.data || [];
    },

    async getById(deptCode, id) {
        const response = await api.get(`/${deptCode}/data/${id}`);
        return response.data.data;
    },

    async create(deptCode, data) {
        const response = await api.post(`/${deptCode}/data`, data);
        return response.data.data;
    },

    async update(deptCode, id, data) {
        const response = await api.put(`/${deptCode}/data/${id}`, data);
        return response.data.data;
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