import { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Loader } from 'lucide-react';
import { previewDataService } from '../services/previewService.js';
import { formatCellValue } from './utils/tableFormaterUtils.js';

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

// Loading component
function LoadingPreview() {
    return (
        <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-cyan-600 animate-spin" />
            <span className="ml-2 text-gray-600">Chargement des données...</span>
        </div>
    );
}

// Error component
function ErrorPreview({ message }) {
    return (
        <div className="text-center py-8 bg-red-50 rounded-lg">
            <p className="text-red-600">{message || 'Erreur de chargement'}</p>
        </div>
    );
}

// Metric Preview with real data
function MetricPreview({ component, department, period, dateRange }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [value, setValue] = useState(null);
    const [trend, setTrend] = useState(null);

    useEffect(() => {
        loadMetricData();
    }, [component, department, period, dateRange]);

    const loadMetricData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { field, calculation } = component.config;

            // Fetch current period data
            const currentData = await previewDataService.fetchMetrics(
                department,
                field,
                calculation,
                period,
                { dateRange }
            );

            // Fetch previous period for trend
            const prevDateRange = getPreviousPeriod(dateRange, period);
            const prevData = await previewDataService.fetchMetrics(
                department,
                field,
                calculation,
                period,
                { dateRange: prevDateRange }
            );

            setValue(currentData?.value || 0);

            // Calculate trend
            if (
                currentData?.value !== null &&
                currentData?.value !== undefined &&
                prevData?.value !== null &&
                prevData?.value !== undefined
            ) {
                if (prevData.value === 0) {
                    setTrend({
                        direction: currentData.value > 0 ? 'up' : 'stable',
                        value: currentData.value > 0 ? '100.0' : '0.0'
                    });
                } else {
                    const change = ((currentData.value - prevData.value) / prevData.value) * 100;
                    setTrend({
                        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
                        value: Math.abs(change).toFixed(1)
                    });
                }
            }
        } catch (err) {
            console.error('Error loading metric:', err);
            setError('Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    const getPreviousPeriod = (range, period) => {
        if (!range || !range.start || !range.end) return null;

        const start = new Date(range.start);
        const end = new Date(range.end);

        switch(period) {
            case 'day':
                start.setDate(start.getDate() - 1);
                end.setDate(end.getDate() - 1);
                break;
            case 'week':
                start.setDate(start.getDate() - 7);
                end.setDate(end.getDate() - 7);
                break;
            case 'month':
                start.setMonth(start.getMonth() - 1);
                end.setMonth(end.getMonth() - 1);
                break;
            case 'quarter':
                start.setMonth(start.getMonth() - 3);
                end.setMonth(end.getMonth() - 3);
                break;
            case 'year':
                start.setFullYear(start.getFullYear() - 1);
                end.setFullYear(end.getFullYear() - 1);
                break;
        }

        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    };

    const formatValue = (val) => {
        const { format = 'number' } = component.config;

        if (val === null || val === undefined) return '—';

        try {
            switch(format) {
                case 'currency':
                    return new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                        maximumFractionDigits: 0
                    }).format(val);
                case 'percent':
                    return new Intl.NumberFormat('fr-FR', {
                        style: 'percent',
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1
                    }).format(val / 100);
                case 'decimal':
                    return new Intl.NumberFormat('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format(val);
                default:
                    return new Intl.NumberFormat('fr-FR').format(val);
            }
        } catch (e) {
            return val.toString();
        }
    };

    if (loading) return <LoadingPreview />;
    if (error) return <ErrorPreview message={error} />;

    const { label } = component.config;

    return (
        <div className="text-center py-8 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
            <p className="text-4xl font-bold text-cyan-600 mb-2">
                {formatValue(value)}
            </p>
            <p className="text-sm text-gray-600 mb-3">{label}</p>

            {trend && (
                <div className="flex items-center justify-center space-x-2 text-sm">
                    {trend.direction === 'up' && (
                        <>
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-medium">+{trend.value}%</span>
                        </>
                    )}
                    {trend.direction === 'down' && (
                        <>
                            <TrendingDown className="w-4 h-4 text-red-600" />
                            <span className="text-red-600 font-medium">-{trend.value}%</span>
                        </>
                    )}
                    {trend.direction === 'stable' && (
                        <>
                            <Minus className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-600 font-medium">Stable</span>
                        </>
                    )}
                    <span className="text-gray-500">vs période précédente</span>
                </div>
            )}
        </div>
    );
}

// Chart Preview with real data
function ChartPreview({ component, department, period, dateRange }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);

    useEffect(() => {
        loadChartData();
    }, [component, department, period, dateRange]);

    const loadChartData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { chartType, fields } = component.config;

            let chartData;
            if (chartType === 'pie' && fields) {
                chartData = await previewDataService.fetchPieData(
                    department,
                    fields,
                    period,
                    { dateRange }
                );
            } else {
                chartData = await previewDataService.fetchChartData(
                    department,
                    component.config,
                    period,
                    { dateRange }
                );
            }

            setData(chartData);
        } catch (err) {
            console.error('Error loading chart data:', err);
            setError('Impossible de charger les données du graphique');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingPreview />;
    if (error) return <ErrorPreview message={error} />;
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Aucune donnée pour cette période</p>
            </div>
        );
    }

    const { chartType, title, xAxis = 'date', yAxis, fields, labels } = component.config;

    return (
        <div className="space-y-4">
            {title && <h4 className="font-semibold text-gray-900">{title}</h4>}

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' && (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xAxis} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Array.isArray(yAxis) ? (
                                yAxis.map((axis, index) => (
                                    <Bar
                                        key={axis}
                                        dataKey={axis}
                                        fill={COLORS[index % COLORS.length]}
                                        name={labels?.[index] || axis}
                                    />
                                ))
                            ) : (
                                <Bar dataKey={yAxis} fill={COLORS[0]} />
                            )}
                        </BarChart>
                    )}

                    {chartType === 'pie' && (
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={(entry) => `${entry.name}: ${entry.value}`}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    )}

                    {chartType === 'line' && (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xAxis} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Array.isArray(yAxis) ? (
                                yAxis.map((axis, index) => (
                                    <Line
                                        key={axis}
                                        type="monotone"
                                        dataKey={axis}
                                        stroke={COLORS[index % COLORS.length]}
                                        strokeWidth={2}
                                        name={labels?.[index] || axis}
                                    />
                                ))
                            ) : (
                                <Line
                                    type="monotone"
                                    dataKey={yAxis}
                                    stroke={COLORS[0]}
                                    strokeWidth={2}
                                />
                            )}
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// Table Preview with real data - optimized version
function TablePreview({ component, department, period, dateRange }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [tableCache, setTableCache] = useState({});

    useEffect(() => {
        loadTableData();
    }, [component, department, period, dateRange?.start, dateRange?.end]);

    const loadTableData = async () => {
        setLoading(true);
        setError(null);

        // Create cache key
        const cacheKey = `${department}_${dateRange?.start}_${dateRange?.end}_${component.config.limit || 10}`;

        // Check cache first
        if (tableCache[cacheKey]) {
            setData(tableCache[cacheKey]);
            setLoading(false);
            return;
        }

        try {
            const response = await previewDataService.fetchPreviewData(department, {
                dateRange,
                limit: component.config.limit || 10
            });

            // Extract the actual array from API response
            const rows = Array.isArray(response)
                ? response
                : response?.data || [];

            // Update cache
            setTableCache(prev => ({
                ...prev,
                [cacheKey]: rows
            }));

            setData(rows);

        } catch (err) {
            console.error('Table data error:', err);
            setError('Impossible de charger les données du tableau');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingPreview />;
    if (error) return <ErrorPreview message={error} />;
    if (!Array.isArray(data) || data.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Aucune donnée pour cette période</p>
            </div>
        );
    }

    const { columns, title } = component.config;

    // Determine which columns to display
    let displayColumns = columns;
    if (!displayColumns || displayColumns.length === 0) {
        // Auto-detect columns from first data item, excluding metadata
        const excludeFields = ['id', 'user_id', 'created_at', 'updated_at'];
        displayColumns = Object.keys(data[0] || {}).filter(
            key => !excludeFields.includes(key)
        );
    }

    return (
        <div className="space-y-4">
            {title && <h4 className="font-semibold text-gray-900">{title}</h4>}

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-50">
                    <tr>
                        {displayColumns.map((col) => (
                            <th key={col} className="px-4 py-2 text-left font-medium text-gray-700">
                                {col}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            {displayColumns.map((col) => (
                                <td key={col} className="px-4 py-2 text-gray-600">
                                    {formatCellValue(row[col], col, { locale: 'fr-FR', dateStyle: 'short' })}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
// Text Preview (static - no data needed)
function TextPreview({ component }) {
    const { content } = component.config;

    return (
        <div className="prose max-w-none p-4">
            <p className="text-gray-700 whitespace-pre-wrap">
                {content || 'Votre texte ici...'}
            </p>
        </div>
    );
}

// Main Component Preview
export default function ComponentPreview({
                                             component,
                                             department,
                                             period = 'month',
                                             dateRange = null
                                         }) {
    if (!component) {
        return (
            <div className="p-8 text-center text-gray-400">
                <p>Aucun composant sélectionné</p>
            </div>
        );
    }

    // Use provided dateRange or default to current period
    const effectiveDateRange = dateRange || getDefaultDateRange(period);

    switch (component.type) {
        case 'metric':
            return (
                <MetricPreview
                    component={component}
                    department={department}
                    period={period}
                    dateRange={effectiveDateRange}
                />
            );

        case 'chart':
            return (
                <ChartPreview
                    component={component}
                    department={department}
                    period={period}
                    dateRange={effectiveDateRange}
                />
            );

        case 'table':
            return (
                <TablePreview
                    component={component}
                    department={department}
                    period={period}
                    dateRange={effectiveDateRange}
                />
            );

        case 'text':
            return <TextPreview component={component} />;

        default:
            return (
                <div className="p-8 text-center text-gray-400">
                    <p>Type de composant inconnu: {component.type}</p>
                </div>
            );
    }
}

// Helper function to get default date range based on period
function getDefaultDateRange(period) {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    let start = new Date(today);

    switch(period) {
        case 'day':
            return { start: end, end };
        case 'week':
            start.setDate(start.getDate() - 7);
            break;
        case 'month':
            start.setMonth(start.getMonth() - 1);
            break;
        case 'quarter':
            start.setMonth(start.getMonth() - 3);
            break;
        case 'year':
            start.setFullYear(start.getFullYear() - 1);
            break;
        default:
            start.setMonth(start.getMonth() - 1); // Default to last month
    }

    return {
        start: start.toISOString().split('T')[0],
        end
    };
}