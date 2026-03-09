// pages/departments/reports/builder/components/MetricBlock.jsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricBlock({ component, value }) {
    const {
        label,
        prefix = '',
        suffix = '',
        decimals = 0,
        format = 'number',
        showTrend = true,
    } = component.config || {};

    // Accepte soit un nombre brut, soit un objet enrichi
    const rawValue =
        value && typeof value === 'object' && !Array.isArray(value)
            ? value.value
            : value;

    const trend =
        value && typeof value === 'object' && !Array.isArray(value)
            ? value.trend
            : null;

    const subtitle =
        value && typeof value === 'object' && !Array.isArray(value)
            ? value.subtitle
            : null;

    const formatValue = (val) => {
        if (val === undefined || val === null || val === '') return '—';

        const num = Number(val);
        if (Number.isNaN(num)) return val;

        switch (format) {
            case 'currency':
                return `${new Intl.NumberFormat('de-DE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(num)} FCFA`;

            case 'percent':
                return new Intl.NumberFormat('fr-FR', {
                    style: 'percent',
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                }).format(num / 100);

            case 'decimal':
                return new Intl.NumberFormat('fr-FR', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals,
                }).format(num);

            default:
                return new Intl.NumberFormat('fr-FR').format(num);
        }
    };

    const renderTrend = () => {
        if (!showTrend || !trend) return null;

        const direction = trend.direction || 'stable';
        const trendValue = trend.value ?? '0.0';

        if (direction === 'up') {
            return (
                <div className="flex items-center justify-center gap-1 text-sm mt-3">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-600">+{trendValue}%</span>
                    <span className="text-gray-500">versus période précédente</span>
                </div>
            );
        }

        if (direction === 'down') {
            return (
                <div className="flex items-center justify-center gap-1 text-sm mt-3">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-600">-{trendValue}%</span>
                    <span className="text-gray-500">vs période précédente</span>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center gap-1 text-sm mt-3">
                <Minus className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-500">Stable</span>
                <span className="text-gray-500">vs période précédente</span>
            </div>
        );
    };

    return (
        <div className="text-center p-6 bg-white rounded-lg border">
            <p className="text-4xl font-bold text-cyan-600">
                {prefix}{formatValue(rawValue)}{suffix}
            </p>

            {label && (
                <p className="text-sm text-gray-600 mt-2">
                    {label}
                </p>
            )}

            {subtitle && (
                <p className="text-xs text-gray-400 mt-1">
                    {subtitle}
                </p>
            )}

            {renderTrend()}
        </div>
    );
}