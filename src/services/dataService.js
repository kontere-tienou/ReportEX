// dataService.js
import api from './api.js';

// Événement custom émis après chaque mutation (create / update / delete)
// Le dashboard l'écoute pour se rafraîchir instantanément
const emitDataChanged = (deptCode) => {
    window.dispatchEvent(
        new CustomEvent('dataservice:changed', { detail: { deptCode } })
    );
};

export const dataService = {
    async getAll(deptCode, params = {}) {
        // On passe un timestamp pour forcer le backend à bypasser son cache
        // (le cache backend est de 30s — sans ce param, un refresh immédiat
        //  après une mutation retournerait les anciennes données)
        const response = await api.get(`/${deptCode}/data`, {
            params: {
                ...params,
                // Limite haute pour récupérer tout l'historique
                limit: params.limit || 1000,
                _t: Date.now(),   // cache-busting
            },
        });

        // Le backend renvoie { data: [...], pagination: {...} } via paginatedResponse
        // On extrait le tableau de données dans tous les cas
        const payload = response.data;
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        return [];
    },

    async getById(deptCode, id) {
        const response = await api.get(`/${deptCode}/data/${id}`);
        return response.data.data;
    },

    async create(deptCode, data) {
        try {
            const response = await api.post(`/${deptCode}/data`, data);
            emitDataChanged(deptCode);
            return response.data.data;
        } catch (error) {
            console.error('❌ Create error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
            });
            if (error.response?.data?.errors) {
                console.error('Validation errors:', error.response.data.errors);
            }
            throw error;
        }
    },

    async update(deptCode, id, data) {
        try {
            const response = await api.put(`/${deptCode}/data/${id}`, data);
            emitDataChanged(deptCode);
            return response.data.data;
        } catch (error) {
            console.error('❌ Update error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    async delete(deptCode, id) {
        const response = await api.delete(`/${deptCode}/data/${id}`);
        emitDataChanged(deptCode);
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