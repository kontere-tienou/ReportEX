import api from './api.js';

export const departmentDataApi = {
    getStats: (deptCode) =>
        api.get(`/${deptCode}/data/stats`),

    getAllData: (deptCode, params) =>
        api.get(`/${deptCode}/data`, { params }),

    getAggregated: (deptCode, params) =>
        api.get(`/${deptCode}/data/aggregated`, { params }),

    getBatchData: (deptCode, data) =>
        api.post(`/${deptCode}/data/batch`, data),

    getBatchChartData: (deptCode, data) =>
        api.post(`/${deptCode}/data/batch-chart`, data),

    getPieData: (deptCode, data) =>
        api.post(`/${deptCode}/data/pie`, data),

    exportData: (deptCode, params) =>
        api.get(`/${deptCode}/data/export`, {
            params,
            responseType: "blob",
        }),
};