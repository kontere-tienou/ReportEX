/* ==========================================================
   REPORT SERVICE
========================================================== */

import api from "./api.js";

export const reportService = {

    /* ---------- OFFICIAL REPORTS ---------- */

    create: (data) =>
        api.post('/reports', data),

    /*update: (id, payload) =>
        api.put(`/reports/${id}`, payload),*/
    update: (id, payload) => api.patch(`/reports/${id}`, payload),

    delete: (id) =>
        api.delete(`/reports/${id}`),

    getMy: (params) =>
        api.get('/reports/my-reports', { params }),

    getAll: (params) =>
        api.get('/reports', { params }),

    getById: (id) =>
        api.get(`/reports/${id}`),

    submit: (id) =>
        api.post(`/reports/${id}/submit`),

    validate: (id, data) =>
        api.post(`/reports/${id}/validate`, data),

    getDepartmentStats: (departmentId) =>
        api.get(`/reports/stats/${departmentId}`),

    /* ---------- COMMENTS ---------- */

    getComments: (id) =>
        api.get(`/reports/${id}/comments`),

    addComment: (id, data) =>
        api.post(`/reports/${id}/comments`, data),

    deleteComment: (commentId) =>
        api.delete(`/reports/comments/${commentId}`),

    /* ---------- READ TRACKING ---------- */

    markAsRead: (id) =>
        api.post(`/reports/${id}/read`),

    getReaders: (id) =>
        api.get(`/reports/${id}/readers`),

    /* ---------- ANNOTATIONS ---------- */

    addAnnotation: (id, data) =>
        api.post(`/reports/${id}/annotations`, data),

    /* ---------- PDF ---------- */

    exportPdf: (id) =>
        api.get(`/reports/${id}/export/pdf`, {
            responseType: 'blob',
        }),



    generateCustom: (data) =>
        api.post('/reports/custom/generate', data),

    saveCustomTemplate: (data) =>
        api.post('/reports/custom/template', data),

    getCustomTemplates: () =>
        api.get('/reports/custom/templates'),

    deleteCustomTemplate: (id) =>
        api.delete(`/reports/custom/template/${id}`),



};

/* ==========================================================
REPORT ACCESS SERVICE
========================================================== */

export const reportAccessService = {
    requestAccess: (reportId, reason) =>
        api.post(`/report-access/report/${reportId}/request`, {
            reason,
        }),

    getPending: () =>
        api.get('/report-access/pending'),

    approve: (id) =>
        api.post(`/report-access/${id}/approve`),

    reject: (id, reason) =>
        api.post(`/report-access/${id}/reject`, { reason }),
};