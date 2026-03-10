// reportBuilderApi.js
import api from './api.js';

export const reportBuilderApi = {
    saveLayout: (reportId, data) =>
        api.put(`/reports/${reportId}/layout`, data),

    getLayout: (reportId) =>
        api.get(`/reports/${reportId}/layout`),

    initializeBuilder: () => api.get('/reports/builder'),
    saveTemplate: (data) => api.post('/reports/custom/generate', data),
    generateReport: (data) => api.post('/reports/generate', data),
};