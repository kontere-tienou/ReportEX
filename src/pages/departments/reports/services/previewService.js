// pages/departments/reports/builder/services/previewDataService.js
import api from '../../../../services/api';

export const previewDataService = {
    /**
     * Fetch data for preview based on department and period
     */
    async fetchPreviewData(deptCode, period, options = {}) {
        try {
            const params = {
                limit: options.limit || 10,
                sortBy: 'date',
                sortOrder: 'DESC'
            };

            // Add date filters based on period
            if (options.dateRange) {
                if (options.dateRange.start) params.dateFrom = options.dateRange.start;
                if (options.dateRange.end) params.dateTo = options.dateRange.end;
            }

            const response = await api.get(`/${deptCode}/data`, { params });

            // Handle different response structures
            return response.data.data || response.data || [];
        } catch (error) {
            console.error('Error fetching preview data:', error);
            return [];
        }
    },

    /**
     * Fetch aggregated metrics (sum, avg, min, max, etc.)
     */
    async fetchMetrics(deptCode, field, calculation, period, options = {}) {
        try {
            // Build metrics array for aggregation
            const metrics = [{
                field,
                aggregation: calculation
            }];

            const params = {
                groupBy: 'date',
                metrics: JSON.stringify(metrics)
            };

            // Add date filters
            if (options.dateRange) {
                if (options.dateRange.start) params.dateFrom = options.dateRange.start;
                if (options.dateRange.end) params.dateTo = options.dateRange.end;
            }

            const response = await api.get(`/${deptCode}/data/aggregated`, { params });

            // Calculate total from aggregated data
            const aggregatedData = response.data.data || [];
            let total = 0;

            if (calculation === 'sum') {
                total = aggregatedData.reduce((sum, item) => sum + (Number(item[`${field}_sum`]) || 0), 0);
            } else if (calculation === 'avg') {
                const sum = aggregatedData.reduce((acc, item) => acc + (Number(item[`${field}_sum`]) || 0), 0);
                const count = aggregatedData.reduce((acc, item) => acc + (Number(item[`${field}_count`]) || 0), 0);
                total = count > 0 ? sum / count : 0;
            } else if (calculation === 'max') {
                total = Math.max(...aggregatedData.map(item => Number(item[`${field}_max`]) || 0));
            } else if (calculation === 'min') {
                total = Math.min(...aggregatedData.map(item => Number(item[`${field}_min`]) || 0));
            } else if (calculation === 'count') {
                total = aggregatedData.reduce((acc, item) => acc + (Number(item[`${field}_count`]) || 0), 0);
            }

            return { value: total };
        } catch (error) {
            console.error('Error fetching metrics:', error);
            return null;
        }
    },

    /**
     * Fetch chart data
     */
    async fetchChartData(deptCode, config, period, options = {}) {
        try {
            const { yAxis, aggregation = 'sum' } = config;

            // Handle both single yAxis and array of yAxis
            const metrics = Array.isArray(yAxis)
                ? yAxis.map(axis => ({ field: axis, aggregation }))
                : [{ field: yAxis, aggregation }];

            const params = {
                groupBy: 'date',
                metrics: JSON.stringify(metrics)
            };

            // Add date filters
            if (options.dateRange) {
                if (options.dateRange.start) params.dateFrom = options.dateRange.start;
                if (options.dateRange.end) params.dateTo = options.dateRange.end;
            }

            const response = await api.get(`/${deptCode}/data/aggregated`, { params });
            const aggregatedData = response.data.data || [];

            // Transform data for charts
            return aggregatedData.map(item => {
                const chartItem = { date: item.date };

                if (Array.isArray(yAxis)) {
                    yAxis.forEach(axis => {
                        chartItem[axis] = Number(item[`${axis}_${aggregation}`]) || 0;
                    });
                } else {
                    chartItem[yAxis] = Number(item[`${yAxis}_${aggregation}`]) || 0;
                }

                return chartItem;
            });
        } catch (error) {
            console.error('Error fetching chart data:', error);
            return [];
        }
    },

    /**
     * Fetch pie chart data
     */
    async fetchPieData(deptCode, fields, period, options = {}) {
        try {
            const metrics = fields.map(field => ({ field, aggregation: 'sum' }));

            const params = {
                groupBy: 'date',
                metrics: JSON.stringify(metrics)
            };

            // Add date filters
            if (options.dateRange) {
                if (options.dateRange.start) params.dateFrom = options.dateRange.start;
                if (options.dateRange.end) params.dateTo = options.dateRange.end;
            }

            const response = await api.get(`/${deptCode}/data/aggregated`, { params });
            const aggregatedData = response.data.data || [];

            // Calculate totals for each field
            const totals = {};
            fields.forEach(field => {
                totals[field] = aggregatedData.reduce(
                    (sum, item) => sum + (Number(item[`${field}_sum`]) || 0),
                    0
                );
            });

            // Transform to pie chart format
            return Object.entries(totals).map(([name, value]) => ({
                name,
                value
            }));
        } catch (error) {
            console.error('Error fetching pie data:', error);
            return [];
        }
    }
};