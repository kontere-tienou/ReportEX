import api from '../../../../services/api.js';

class PreviewDataService {
    constructor() {
        this.requestCache = new Map();
        this.abortControllers = new Map();
        this.CACHE_TTL = 30 * 1000; // 30 seconds
        this.pendingRequests = new Map();
    }

    /**
     * Debounce identical requests
     */
    async _debounce(key, fn, delay = 300) {
        // Check if there's a pending request
        if (this.pendingRequests.has(key)) {
            console.log(`⏳ Debouncing: ${key}`);
            return this.pendingRequests.get(key);
        }

        // Create new promise
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

    /**
     * Check cache
     */
    _getCached(key) {
        if (this.requestCache.has(key)) {
            const cached = this.requestCache.get(key);
            if (Date.now() - cached.timestamp < this.CACHE_TTL) {
                console.log(`📦 Cache hit: ${key}`);
                return cached.data;
            }
            this.requestCache.delete(key);
        }
        return null;
    }

    /**
     * Set cache
     */
    _setCache(key, data) {
        this.requestCache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Cancel previous identical request
     */
    _cancelPreviousRequest(key) {
        if (this.abortControllers.has(key)) {
            console.log(`🛑 Cancelling previous request: ${key}`);
            this.abortControllers.get(key).abort();
        }
    }

    /**
     * Fetch preview data with caching and debouncing
     */
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
                    console.log('Request cancelled:', cacheKey);
                    return null;
                }
                throw error;
            }
        });
    }

    /**
     * Fetch metrics with caching
     */
    async fetchMetrics(department, field, calculation, period, options = {}) {
        const cacheKey = `metrics_${department}_${field}_${calculation}_${period}_${JSON.stringify(options.dateRange)}`;

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
                const response = await api.get(`/${department}/data/aggregated`, {
                    params: {
                        dateFrom: options.dateRange?.start,
                        dateTo: options.dateRange?.end,
                        metrics: JSON.stringify([{ field, aggregation: calculation }]),
                        groupBy: 'date'
                    },
                    signal: controller.signal
                });

                this.abortControllers.delete(cacheKey);

                // Calculate total
                const data = response.data;
                const total = Array.isArray(data)
                    ? data.reduce((sum, item) => {
                        const key = `${field}_${calculation}`;
                        return sum + (item[key] || 0);
                    }, 0)
                    : data?.value || 0;

                const result = { value: total };

                // Cache the result
                this._setCache(cacheKey, result);

                return result;
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Request cancelled:', cacheKey);
                    return null;
                }
                throw error;
            }
        });
    }

    /**
     * Fetch chart data with caching
     */
    async fetchChartData(department, config, period, options = {}) {
        const cacheKey = `chart_${department}_${JSON.stringify(config)}_${period}_${JSON.stringify(options.dateRange)}`;

        // Check cache
        const cached = this._getCached(cacheKey);
        if (cached) return cached;

        // Debounce
        return this._debounce(cacheKey, async () => {
            this._cancelPreviousRequest(cacheKey);

            const controller = new AbortController();
            this.abortControllers.set(cacheKey, controller);

            try {
                const metrics = [{
                    field: config.yAxis,
                    aggregation: config.aggregation || 'sum'
                }];

                // FIX: Remove the extra /api/ from the URL
                const response = await api.get(`/${department}/data/aggregated`, {
                    params: {
                        dateFrom: options.dateRange?.start,
                        dateTo: options.dateRange?.end,
                        groupBy: config.xAxis || 'date',
                        metrics: JSON.stringify(metrics)
                    },
                    signal: controller.signal
                });

                this.abortControllers.delete(cacheKey);

                // Cache the result
                this._setCache(cacheKey, response.data);

                return response.data;
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Request cancelled:', cacheKey);
                    return null;
                }
                throw error;
            }
        });
    }

    /**
     * Clear cache for a department
     */
    clearCache(department) {
        for (const key of this.requestCache.keys()) {
            if (key.includes(department)) {
                this.requestCache.delete(key);
            }
        }
    }
}

export const previewDataService = new PreviewDataService();