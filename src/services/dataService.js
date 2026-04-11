// dataService.js
import api from './api.js';

const emitDataChanged = (deptCode) => {
    window.dispatchEvent(
        new CustomEvent('dataservice:changed', { detail: { deptCode } })
    );
};

export const dataService = {
   /* async getAll(deptCode, params = {}) {
        const response = await api.get(`/${deptCode}/data`, {
            params: {
                ...params,
                limit: params.limit || 1000,
                _t: Date.now(),   // cache-busting
            },
        });

        const payload = response.data;
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        return [];
    },*/

    async getAll(deptCode, params = {}) {
        try {
            const response = await api.get(`/${deptCode}/data`, {
                params: {
                    ...params,
                    limit: params.limit || 1000,
                    _t: Date.now(),
                },
            });

            // ✅ Gestion plus robuste des différents formats
            let result = [];

            // Cas 1: La réponse a une structure avec data et success
            if (response.data && response.data.success && response.data.data) {
                if (Array.isArray(response.data.data)) {
                    result = response.data.data;
                } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
                    result = response.data.data.data;
                } else if (response.data.data.items && Array.isArray(response.data.data.items)) {
                    result = response.data.data.items;
                } else {
                    result = [];
                }
            }
            // Cas 2: La réponse est directement un tableau
            else if (Array.isArray(response.data)) {
                result = response.data;
            }
            // Cas 3: La réponse a une propriété data qui est un tableau
            else if (response.data && Array.isArray(response.data.data)) {
                result = response.data.data;
            }
            // Cas 4: La réponse a une structure paginée
            else if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
                result = response.data.data.data;
            }
            // Cas 5: Format non standard mais avec des données
            else if (response.data && typeof response.data === 'object') {
                // Chercher le premier tableau dans l'objet
                for (let key in response.data) {
                    if (Array.isArray(response.data[key])) {
                        result = response.data[key];
                        break;
                    }
                }
            }
            return result;
        } catch (error) {
            throw error;
        }
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