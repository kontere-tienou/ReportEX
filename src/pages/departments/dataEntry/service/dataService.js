// dataService.js
import api from '../../../../services/api.js';

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
            console.log('📤 Creating data for department:', deptCode);
            console.log('📦 Payload:', JSON.stringify(data, null, 2));

            const response = await api.post(`/${deptCode}/data`, data);
            console.log('✅ Create successful:', response.data);
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
        try {
            console.log('📤 Updating data:', id, 'for department:', deptCode);
            console.log('📦 Payload:', JSON.stringify(data, null, 2));

            const response = await api.put(`/${deptCode}/data/${id}`, data);
            console.log('✅ Update successful:', response.data);
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