// services/reportApi.js
import api from "./api.js";

export const reportService = {
    /* ==========================================
       NOUVEAU PATTERN AVEC CODE DÉPARTEMENT
    ========================================== */

    // Récupérer tous les rapports d'un département
    getByDepartment: (departmentCode, params) =>
        api.get(`/${departmentCode}/reports`, { params }),

    // Créer un rapport pour un département
    createForDepartment: (departmentCode, data) =>
        api.post(`/${departmentCode}/reports`, data),

    // Statistiques du département
    getDepartmentStatsByCode: (departmentCode) =>
        api.get(`/${departmentCode}/reports/stats`),

    // Récupérer un rapport spécifique avec departmentCode
    getByIdWithDepartment: (departmentCode, reportId) =>
        api.get(`/${departmentCode}/reports/${reportId}`),

    // Mettre à jour un rapport
    updateWithDepartment: (departmentCode, reportId, data) =>
        api.patch(`/${departmentCode}/reports/${reportId}`, data),

    // Supprimer un rapport
    deleteWithDepartment: (departmentCode, reportId) =>
        api.delete(`/${departmentCode}/reports/${reportId}`),

    // Soumettre un rapport
    submitWithDepartment: (departmentCode, reportId) =>
        api.post(`/${departmentCode}/reports/${reportId}/submit`),

    // Valider un rapport (DG seulement)
    validateWithDepartment: (departmentCode, reportId, data) =>
        api.post(`/${departmentCode}/reports/${reportId}/validate`, data),

    // Commentaires avec departmentCode
    getCommentsWithDepartment: (departmentCode, reportId) =>
        api.get(`/${departmentCode}/reports/${reportId}/comments`),

    addCommentWithDepartment: (departmentCode, reportId, data) =>
        api.post(`/${departmentCode}/reports/${reportId}/comments`, data),

    // Suivi de lecture avec departmentCode
    markAsReadWithDepartment: (departmentCode, reportId) =>
        api.post(`/${departmentCode}/reports/${reportId}/read`),

    getReadersWithDepartment: (departmentCode, reportId) =>
        api.get(`/${departmentCode}/reports/${reportId}/readers`),

    // Annotations avec departmentCode
    addAnnotationWithDepartment: (departmentCode, reportId, data) =>
        api.post(`/${departmentCode}/reports/${reportId}/annotations`, data),

    // Export PDF avec departmentCode
    exportPdfWithDepartment: (departmentCode, reportId) =>
        api.get(`/${departmentCode}/reports/${reportId}/export/pdf`, {
            responseType: 'blob',
        }),

    /* ==========================================
       MÉTHODES LEGACY (sans departmentCode)
    ========================================== */

    // Récupérer un rapport spécifique
    getById: (id) =>
        api.get(`/reports/${id}`),

    // Mettre à jour un rapport
    update: (id, data) =>
        api.patch(`/reports/${id}`, data),

    // Supprimer un rapport
    delete: (id) =>
        api.delete(`/reports/${id}`),

    // Soumettre un rapport
    submit: (id) =>
        api.post(`/reports/${id}/submit`),

    // Valider un rapport
    validate: (id, data) =>
        api.post(`/reports/${id}/validate`, data),

    // Commentaires
    getComments: (id) =>
        api.get(`/reports/${id}/comments`),

    addComment: (id, data) =>
        api.post(`/reports/${id}/comments`, data),

    deleteComment: (commentId) =>
        api.delete(`/reports/comments/${commentId}`),

    // Suivi de lecture
    markAsRead: (id) =>
        api.post(`/reports/${id}/read`),

    getReaders: (id) =>
        api.get(`/reports/${id}/readers`),

    // Annotations
    addAnnotation: (id, data) =>
        api.post(`/reports/${id}/annotations`, data),

    // Export PDF
    exportPdf: (id) =>
        api.get(`/reports/${id}/export/pdf`, {
            responseType: 'blob',
        }),

    /* ==========================================
       TEMPLATES
    ========================================== */
    generateCustom: (data) =>
        api.post('/reports/custom/generate', data),

    saveCustomTemplate: (data) =>
        api.post('/reports/custom/template', data),

    getCustomTemplates: () =>
        api.get('/reports/custom/templates'),

    deleteCustomTemplate: (id) =>
        api.delete(`/reports/custom/template/${id}`),

    /* ==========================================
       AUTRES MÉTHODES LEGACY
    ========================================== */
    create: (data) => api.post('/reports', data),
    getMy: (params) => api.get('/reports/my-reports', { params }),
    getAll: (params) => api.get('/reports', { params }),
    getDepartmentStats: (departmentId) =>
        api.get(`/reports/stats/${departmentId}`),
};

export default reportService;