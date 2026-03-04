// pages/departments/reports/builder/hooks/useComponentProcessor.js

import { useMemo } from 'react';

export default function useComponentProcessor() {

    const processMetric = (data, config) => {
        if (!data || !Array.isArray(data) || data.length === 0) return 0;

        try {
            const values = data
                .map(row => Number(row[config.field]))
                .filter(val => !isNaN(val));

            if (values.length === 0) return 0;

            switch (config.calculation) {
                case 'sum':
                    return values.reduce((acc, val) => acc + val, 0);

                case 'avg':
                    return values.reduce((acc, val) => acc + val, 0) / values.length;

                case 'min':
                    return Math.min(...values);

                case 'max':
                    return Math.max(...values);

                case 'count':
                    return values.length;

                default:
                    return 0;
            }
        } catch (error) {
            console.error('Error processing metric:', error);
            return 0;
        }
    };

    const processChartData = (data, config) => {
        if (!data || !Array.isArray(data)) return [];

        try {
            const { xAxis, yAxis, aggregation = 'sum' } = config;

            if (!xAxis || !yAxis) return data;

            // Agrégation des données
            const aggregated = data.reduce((acc, row) => {
                const key = row[xAxis];
                const value = Number(row[yAxis]) || 0;

                if (!acc[key]) {
                    acc[key] = { [xAxis]: key, [yAxis]: 0, count: 0 };
                }

                switch (aggregation) {
                    case 'sum':
                        acc[key][yAxis] += value;
                        break;
                    case 'avg':
                        acc[key][yAxis] += value;
                        acc[key].count += 1;
                        break;
                    case 'count':
                        acc[key][yAxis] += 1;
                        break;
                }

                return acc;
            }, {});

            let result = Object.values(aggregated);

            // Calcul des moyennes si nécessaire
            if (aggregation === 'avg') {
                result = result.map(item => ({
                    ...item,
                    [yAxis]: item[yAxis] / item.count
                }));
            }

            return result;
        } catch (error) {
            console.error('Error processing chart data:', error);
            return [];
        }
    };

    const processTableData = (data, config) => {
        if (!data || !Array.isArray(data)) return [];
        if (!config.columns || config.columns.length === 0) return data;

        // Filtrer uniquement les colonnes sélectionnées
        return data.map(row => {
            const filteredRow = {};
            config.columns.forEach(col => {
                filteredRow[col] = row[col] || '—';
            });
            return filteredRow;
        });
    };

    return {
        processMetric,
        processChartData,
        processTableData,
    };
}