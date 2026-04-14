// services/reportAccessApi.js (version complète avec support département)
import api from "./api.js";

export const reportAccessService = {
    // Méthodes standard
    requestAccess: (reportId, reason) =>
        api.post(`/report-access/report/${reportId}/request`, { reason }),

    getPending: () =>
        api.get('/report-access/pending'),

    approve: (id) =>
        api.post(`/report-access/${id}/approve`),

    reject: (id, reason) =>
        api.post(`/report-access/${id}/reject`, { reason }),

    getByReport: (reportId) =>
        api.get(`/report-access/report/${reportId}`),

    getMyRequests: () =>
        api.get('/report-access/my-requests'),

    cancel: (id) =>
        api.delete(`/report-access/${id}`),

    checkAccess: (reportId) =>
        api.get(`/report-access/report/${reportId}/check`),

    // Méthodes avec département (si votre backend les supporte)
    requestAccessWithDepartment: (departmentCode, reportId, reason) =>
        api.post(`/${departmentCode}/reports/${reportId}/access/request`, { reason }),

    checkAccessWithDepartment: (departmentCode, reportId) =>
        api.get(`/${departmentCode}/reports/${reportId}/access/check`),
};

export default reportAccessService;