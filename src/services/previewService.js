// frontend/src/services/previewDataService.js
import api from './api.js';

class PreviewDataService {
    constructor() {
        this.requestCache = new Map();
        this.abortControllers = new Map();
        this.CACHE_TTL = 30 * 1000;
        this.pendingRequests = new Map();
    }

    async fetchBatchMetrics(department, metricRequests, options = {}) {
        const cacheKey = `batch_${department}_${JSON.stringify(metricRequests)}_${JSON.stringify(options.dateRange)}`;

        // Check cache
        const cached = this._getCached(cacheKey);
        if (cached) return cached;

        // Debounce
        return this._debounce(cacheKey, async () => {
            this._cancelPreviousRequest(cacheKey);

            const controller = new AbortController();
            this.abortControllers.set(cacheKey, controller);

            try {
                const response = await api.post(`/${department}/data/batch`, {
                    metrics: metricRequests,
                    dateFrom: options.dateRange?.start,
                    dateTo: options.dateRange?.end,
                    groupBy: options.groupBy
                }, {
                    signal: controller.signal
                });

                this.abortControllers.delete(cacheKey);
                this._setCache(cacheKey, response.data.data);
                return response.data.data;
            } catch (error) {
                if (error.name === 'AbortError') {
                    return null;
                }
                throw error;
            }
        });
    }
    async fetchPreviewData(department, options = {}) {
        const cacheKey = `preview_${department}_${JSON.stringify(options)}`;

        // Check cache
        const cached = this._getCached(cacheKey);
        if (cached) return cached;

        // Debounce
        return this._debounce(cacheKey, async () => {
            this._cancelPreviousRequest(cacheKey);

            const controller = new AbortController();
            this.abortControllers.set(cacheKey, controller);

            try {
                // FIX: Remove the extra /api/ from the URL
                const response = await api.get(`/${department}/data`, {
                    params: {
                        limit: options.limit || 10,
                        sortBy: 'date',
                        sortOrder: 'DESC',
                        dateFrom: options.dateRange?.start,
                        dateTo: options.dateRange?.end,
                    },
                    signal: controller.signal
                });

                this.abortControllers.delete(cacheKey);

                // Cache the result
                this._setCache(cacheKey, response.data);

                return response.data;
            } catch (error) {
                if (error.name === 'AbortError') {
                    return null;
                }
                throw error;
            }
        });
    }
    async fetchPieData(department, fields, period, options = {}) {
        const cacheKey = `pie_${department}_${JSON.stringify(fields)}_${JSON.stringify(options.dateRange)}`;

        const cached = this._getCached(cacheKey);
        if (cached) return cached;

        return this._debounce(cacheKey, async () => {
            this._cancelPreviousRequest(cacheKey);

            const controller = new AbortController();
            this.abortControllers.set(cacheKey, controller);

            try {
                const response = await api.post(`/${department}/data/pie`, {
                    fields,
                    dateFrom: options.dateRange?.start,
                    dateTo: options.dateRange?.end
                }, {
                    signal: controller.signal
                });

                this.abortControllers.delete(cacheKey);

                const result = response.data.data || [];

                this._setCache(cacheKey, result);

                return result;
            } catch (error) {
                if (error.name === "AbortError") return null;
                throw error;
            }
        });
    }
    async fetchBatchChartData(department, chartConfigs, options = {}) {
        const cacheKey = `batch_chart_${department}_${JSON.stringify(chartConfigs)}_${JSON.stringify(options.dateRange)}`;

        const cached = this._getCached(cacheKey);
        if (cached) return cached;

        return this._debounce(cacheKey, async () => {
            this._cancelPreviousRequest(cacheKey);

            const controller = new AbortController();
            this.abortControllers.set(cacheKey, controller);

            try {
                // Extract all metrics from chart configs
                const metrics = [];
                chartConfigs.forEach(config => {
                    const yAxes = Array.isArray(config.yAxis) ? config.yAxis : [config.yAxis];
                    yAxes.forEach(field => {
                        metrics.push({
                            field,
                            aggregation: config.aggregation || 'sum',
                            chartId: config.id
                        });
                    });
                });

                const response = await api.post(`/${department}/data/batch-chart`, {
                    metrics,
                    dateFrom: options.dateRange?.start,
                    dateTo: options.dateRange?.end,
                    groupBy: 'date'
                }, {
                    signal: controller.signal
                });

                this.abortControllers.delete(cacheKey);

                // Organize data by chart ID
                const organized = {};
                chartConfigs.forEach(config => {
                    const yAxes = Array.isArray(config.yAxis) ? config.yAxis : [config.yAxis];
                    organized[config.id] = response.data.data.map(point => {
                        const dataPoint = { date: point.date };
                        yAxes.forEach(field => {
                            dataPoint[field] = point[field] || 0;
                        });
                        return dataPoint;
                    });
                });

                this._setCache(cacheKey, organized);
                return organized;
            } catch (error) {
                if (error.name === 'AbortError') {
                    return null;
                }
                throw error;
            }
        });
    }
    // Keep your existing methods but make them use the batch endpoint
    async fetchMetrics(department, field, calculation, period, options = {}) {
        const results = await this.fetchBatchMetrics(department, [
            { field, calculation }
        ], options);

        return { value: results?.[`${field}_${calculation}`] || 0 };
    }

    async fetchChartData(department, config, period, options = {}) {
        const results = await this.fetchBatchChartData(department, [{
            ...config,
            id: 'default'
        }], options);

        return results?.default || [];
    }

    // Cache helpers
    _getCached(key) {
        if (this.requestCache.has(key)) {
            const cached = this.requestCache.get(key);
            if (Date.now() - cached.timestamp < this.CACHE_TTL) {
                return cached.data;
            }
            this.requestCache.delete(key);
        }
        return null;
    }

    _setCache(key, data) {
        this.requestCache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    async _debounce(key, fn, delay = 300) {
        if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key);
        }

        const promise = new Promise(async (resolve, reject) => {
            setTimeout(async () => {
                try {
                    const result = await fn();
                    this.pendingRequests.delete(key);
                    resolve(result);
                } catch (error) {
                    this.pendingRequests.delete(key);
                    reject(error);
                }
            }, delay);
        });

        this.pendingRequests.set(key, promise);
        return promise;
    }

    _cancelPreviousRequest(key) {
        if (this.abortControllers.has(key)) {
            this.abortControllers.get(key).abort();
        }
    }

    clearCache(department) {
        for (const key of this.requestCache.keys()) {
            if (key.includes(department)) {
                this.requestCache.delete(key);
            }
        }
    }
}

export const previewDataService = new PreviewDataService();