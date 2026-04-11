import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Loader,
    Edit2,
    Save,
    X,
    Check,
    AlertCircle
} from 'lucide-react';
import { previewDataService } from '../../../../services/previewService.js';
import { formatCellValue, formatDateValue } from './utils/tableFormaterUtils.js';

// Constants
const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];
const MAX_CACHE_SIZE = 20;
const EXCLUDE_FIELDS = ['id', 'user_id', 'created_at', 'updated_at', 'dept_code'];

// Loading component
function LoadingPreview({ message = "Chargement des données..." }) {
    return (
        <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-cyan-600 animate-spin" />
            <span className="ml-2 text-gray-600">{message}</span>
        </div>
    );
}

// Error component
function ErrorPreview({ message, onRetry }) {
    return (
        <div className="text-center py-8 bg-red-50 rounded-lg">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-2">{message || 'Erreur de chargement'}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                    Réessayer
                </button>
            )}
        </div>
    );
}

// Empty state component
function EmptyPreview({ message = "Aucune donnée pour cette période" }) {
    return (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">{message}</p>
        </div>
    );
}

// Error Boundary Component
class ComponentErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Component preview error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <ErrorPreview
                    message={`Erreur d'affichage: ${this.state.error?.message || 'Erreur inconnue'}`}
                />
            );
        }

        return this.props.children;
    }
}

// ==================== METRIC BLOCK ====================
function MetricPreview({ component, department, period, dateRange }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [value, setValue] = useState(null);
    const [trend, setTrend] = useState(null);

    useEffect(() => {
        loadMetricData();
    }, [component, department, period, dateRange?.start, dateRange?.end]);

    const loadMetricData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { field, calculation = 'sum' } = component.config;

            const currentData = await previewDataService.fetchMetrics(
                department,
                field,
                calculation,
                period,
                { dateRange }
            );

            const prevDateRange = getPreviousPeriod(dateRange, period);
            const prevData = await previewDataService.fetchMetrics(
                department,
                field,
                calculation,
                period,
                { dateRange: prevDateRange }
            );

            setValue(currentData?.value ?? 0);

            if (currentData?.value !== undefined && prevData?.value !== undefined) {
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
            setError(err.message || 'Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    const getPreviousPeriod = (range, period) => {
        if (!range?.start || !range?.end) return null;

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
            default:
                start.setMonth(start.getMonth() - 1);
                end.setMonth(end.getMonth() - 1);
        }

        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    };

    const formatValue = (val) => {
        const { field } = component.config;
        return formatCellValue(val, field);
    };

    if (loading) return <LoadingPreview />;
    if (error) return <ErrorPreview message={error} onRetry={loadMetricData} />;
    if (value === null) return <EmptyPreview message="Donnée non disponible" />;

    const { label, icon: IconComponent, color = '#06b6d4' } = component.config;

    return (
        <div className={`text-center py-8 bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-lg`}>
            {IconComponent && <IconComponent className={`w-8 h-8 text-${color}-600 mx-auto mb-2`} />}
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

// ==================== KPI BLOCK ====================
function KPIBlock({ component, department, period, dateRange }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [kpiData, setKpiData] = useState({});
    const [trends, setTrends] = useState({});

    useEffect(() => {
        loadKPIData();
    }, [component, department, period, dateRange?.start, dateRange?.end]);

    const loadKPIData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { metrics } = component.config;

            // Fetch current period data
            const currentData = await previewDataService.fetchKPIData(
                department,
                metrics,
                period,
                { dateRange }
            );

            // Fetch previous period for trends
            const prevDateRange = getPreviousPeriod(dateRange, period);
            const prevData = await previewDataService.fetchKPIData(
                department,
                metrics,
                period,
                { dateRange: prevDateRange }
            );

            setKpiData(currentData);

            // Calculate trends for each KPI
            const calculatedTrends = {};
            metrics.forEach(metric => {
                const key = `${metric.field}_${metric.calculation || 'sum'}`;
                const currentValue = currentData[key] || 0;
                const prevValue = prevData[key] || 0;

                if (prevValue === 0) {
                    calculatedTrends[key] = {
                        direction: currentValue > 0 ? 'up' : 'stable',
                        value: currentValue > 0 ? '100.0' : '0.0'
                    };
                } else {
                    const change = ((currentValue - prevValue) / prevValue) * 100;
                    calculatedTrends[key] = {
                        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
                        value: Math.abs(change).toFixed(1)
                    };
                }
            });

            setTrends(calculatedTrends);
        } catch (err) {
            console.error('Error loading KPI data:', err);
            setError(err.message || 'Impossible de charger les données KPI');
        } finally {
            setLoading(false);
        }
    };

    const getPreviousPeriod = (range, period) => {
        if (!range?.start || !range?.end) return null;

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
            default:
                start.setMonth(start.getMonth() - 1);
                end.setMonth(end.getMonth() - 1);
        }

        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    };

    const formatValue = (val, field) => {
        return formatCellValue(val, field);
    };

    if (loading) return <LoadingPreview />;
    if (error) return <ErrorPreview message={error} onRetry={loadKPIData} />;

    const { title, metrics, layout = 'grid', columns = 3 } = component.config;

    return (
        <div className="space-y-4">
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}

            <div className={`grid gap-4 ${
                layout === 'grid' ? `grid-cols-1 md:grid-cols-${columns} lg:grid-cols-${columns}` : 'flex flex-col'
            }`}>
                {metrics.map((metric, index) => {
                    const key = `${metric.field}_${metric.calculation || 'sum'}`;
                    const value = kpiData[key] || 0;
                    const trend = trends[key];
                    const colors = ['cyan', 'blue', 'purple', 'pink', 'orange', 'green', 'red', 'indigo'];
                    const color = metric.color || colors[index % colors.length];

                    return (
                        <div key={index} className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-lg p-6 text-center`}>
                            {metric.icon && <metric.icon className={`w-8 h-8 text-${color}-600 mx-auto mb-2`} />}
                            <p className="text-3xl font-bold text-gray-800 mb-1">
                                {formatValue(value, metric.field)}
                            </p>
                            <p className="text-sm text-gray-600 mb-3">{metric.label}</p>

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
                                </div>
                            )}

                            {metric.target && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Objectif: {formatValue(metric.target, metric.field)}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ==================== CHART BLOCK ====================
function ChartPreview({ component, department, period, dateRange }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);

    useEffect(() => {
        loadChartData();
    }, [component, department, period, dateRange?.start, dateRange?.end]);

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

            setData(Array.isArray(chartData) ? chartData : []);
        } catch (err) {
            console.error('Error loading chart data:', err);
            setError(err.message || 'Impossible de charger les données du graphique');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingPreview />;
    if (error) return <ErrorPreview message={error} onRetry={loadChartData} />;
    if (!data || data.length === 0) return <EmptyPreview />;

    const { chartType, title, xAxis = 'date', yAxis, fields, labels } = component.config;

    return (
        <div className="space-y-4">
            {title && <h4 className="font-semibold text-gray-900">{title}</h4>}

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' && (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey={xAxis}
                                tickFormatter={(value) => formatDateValue(value)}
                            />
                            <YAxis />
                            <Tooltip
                                formatter={(value, name) => formatCellValue(value, name)}
                                labelFormatter={(label) => formatDateValue(label)}
                            />
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
                            <Tooltip
                                formatter={(value, name) => formatCellValue(value, name)}
                                labelFormatter={(label) => formatDateValue(label)}
                            />
                            <Legend />
                        </PieChart>
                    )}

                    {chartType === 'line' && (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey={xAxis}
                                tickFormatter={(value) => formatDateValue(value)}
                            />
                            <YAxis />
                            <Tooltip
                                formatter={(value, name) => formatCellValue(value, name)}
                                labelFormatter={(label) => formatDateValue(label)}
                            />
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

// ==================== TABLE BLOCK ====================
function TablePreview({ component, department, period, dateRange }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [tableCache, setTableCache] = useState({});

    useEffect(() => {
        loadTableData();
    }, [component, department, dateRange?.start, dateRange?.end, component.config.limit]);

    const loadTableData = async () => {
        setLoading(true);
        setError(null);

        const cacheKey = `${department}_${dateRange?.start}_${dateRange?.end}_${component.config.limit || 10}`;

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

            const rows = Array.isArray(response) ? response : response?.data || [];

            const cacheKeys = Object.keys(tableCache);
            if (cacheKeys.length >= MAX_CACHE_SIZE) {
                const oldestKey = cacheKeys[0];
                setTableCache(prev => {
                    const { [oldestKey]: _, ...rest } = prev;
                    return rest;
                });
            }

            setTableCache(prev => ({
                ...prev,
                [cacheKey]: rows
            }));

            setData(rows);
        } catch (err) {
            console.error('Table data error:', err);
            setError(err.message || 'Impossible de charger les données du tableau');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingPreview />;
    if (error) return <ErrorPreview message={error} onRetry={loadTableData} />;
    if (!Array.isArray(data) || data.length === 0) return <EmptyPreview />;

    const { columns, title } = component.config;

    let displayColumns = columns;
    if (!displayColumns || displayColumns.length === 0) {
        displayColumns = Object.keys(data[0] || {}).filter(
            key => !EXCLUDE_FIELDS.includes(key)
        );
    }

    return (
        <div className="space-y-4">
            {title && <h4 className="font-semibold text-gray-900">{title}</h4>}

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        {displayColumns.map((col) => (
                            <th key={col} className="px-4 py-3 text-left font-medium text-gray-700">
                                {col.replace(/_/g, ' ').toUpperCase()}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
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

// ==================== TEXT BLOCK (Simple Text) ====================
function TextBlock({ component }) {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(component.config?.content || '');
    const [savedContent, setSavedContent] = useState(component.config?.content || '');

    const handleSave = () => {
        setSavedContent(content);
        setIsEditing(false);
        // Call save callback if provided
        if (component.onSave) {
            component.onSave(content);
        }
    };

    const handleCancel = () => {
        setContent(savedContent);
        setIsEditing(false);
    };

    const { title, textAlign = 'left', textColor = 'gray-700', backgroundColor = 'transparent' } = component.config;

    if (isEditing) {
        return (
            <div className="space-y-3 p-4 border border-cyan-300 rounded-lg bg-cyan-50">
                {title && <h4 className="font-semibold text-gray-900">{title}</h4>}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    rows={6}
                    placeholder="Enter your text here..."
                />
                <div className="flex space-x-2">
                    <button
                        onClick={handleSave}
                        className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                    </button>
                    <button
                        onClick={handleCancel}
                        className="flex items-center space-x-2 px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`p-4 rounded-lg`}
            style={{ backgroundColor, textAlign }}
        >
            {title && <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>}
            <div
                className={`prose max-w-none text-${textColor} whitespace-pre-wrap cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors`}
                onClick={() => setIsEditing(true)}
            >
                {savedContent || (
                    <span className="text-gray-400 italic">Click to add text...</span>
                )}
            </div>
            {component.config.showEditButton !== false && savedContent && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="mt-2 flex items-center space-x-1 text-xs text-gray-500 hover:text-cyan-600"
                >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                </button>
            )}
        </div>
    );
}

// ==================== TEXT AREA BLOCK (Rich Text) ====================
function TextAreaBlock({ component }) {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(component.config?.content || '');
    const [savedContent, setSavedContent] = useState(component.config?.content || '');

    const handleSave = () => {
        setSavedContent(content);
        setIsEditing(false);
        if (component.onSave) {
            component.onSave(content);
        }
    };

    const handleCancel = () => {
        setContent(savedContent);
        setIsEditing(false);
    };

    const handleFormat = (formatType) => {
        const textarea = document.getElementById('rich-text-editor');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        let formattedText = '';
        switch(formatType) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                break;
            case 'heading':
                formattedText = `\n## ${selectedText}\n`;
                break;
            case 'list':
                formattedText = `\n- ${selectedText}\n`;
                break;
            case 'code':
                formattedText = `\`${selectedText}\``;
                break;
            default:
                return;
        }

        const newContent = content.substring(0, start) + formattedText + content.substring(end);
        setContent(newContent);
    };

    const renderFormattedText = (text) => {
        if (!text) return null;

        // Convert markdown-like syntax to HTML
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
            .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-semibold mt-3 mb-2">$1</h3>')
            .replace(/\n- (.*?)(\n|$)/g, '<li class="ml-4">$1</li>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded">$1</code>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br/>');

        // Wrap in paragraph if not already wrapped
        if (!html.startsWith('<h') && !html.startsWith('<li')) {
            html = `<p>${html}</p>`;
        }

        return <div dangerouslySetInnerHTML={{ __html: html }} />;
    };

    const { title, textAlign = 'left', backgroundColor = 'white', showToolbar = true } = component.config;

    if (isEditing) {
        return (
            <div className="space-y-3 p-4 border border-cyan-300 rounded-lg bg-cyan-50">
                {title && <h4 className="font-semibold text-gray-900">{title}</h4>}

                {showToolbar && (
                    <div className="flex flex-wrap gap-2 p-2 bg-white border border-gray-200 rounded-lg">
                        <button
                            onClick={() => handleFormat('bold')}
                            className="px-2 py-1 text-sm font-bold bg-gray-100 rounded hover:bg-gray-200"
                            title="Bold"
                        >
                            <strong>B</strong>
                        </button>
                        <button
                            onClick={() => handleFormat('italic')}
                            className="px-2 py-1 text-sm italic bg-gray-100 rounded hover:bg-gray-200"
                            title="Italic"
                        >
                            <em>I</em>
                        </button>
                        <button
                            onClick={() => handleFormat('heading')}
                            className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                            title="Heading"
                        >
                            H2
                        </button>
                        <button
                            onClick={() => handleFormat('list')}
                            className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                            title="List"
                        >
                            • List
                        </button>
                        <button
                            onClick={() => handleFormat('code')}
                            className="px-2 py-1 text-sm font-mono bg-gray-100 rounded hover:bg-gray-200"
                            title="Code"
                        >
                            &lt;/&gt;
                        </button>
                    </div>
                )}

                <textarea
                    id="rich-text-editor"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
                    rows={10}
                    placeholder="Enter your rich text here... Use **bold**, *italic*, ## Headings, - Lists, `code`"
                />

                <div className="flex space-x-2">
                    <button
                        onClick={handleSave}
                        className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                    </button>
                    <button
                        onClick={handleCancel}
                        className="flex items-center space-x-2 px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`p-4 rounded-lg shadow-sm`}
            style={{ backgroundColor, textAlign }}
        >
            {title && <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>}
            <div
                className="prose max-w-none cursor-pointer hover:bg-gray-50 p-3 rounded transition-colors"
                onClick={() => setIsEditing(true)}
            >
                {savedContent ? (
                    renderFormattedText(savedContent)
                ) : (
                    <span className="text-gray-400 italic">Click to add rich text...</span>
                )}
            </div>
            {component.config.showEditButton !== false && savedContent && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="mt-2 flex items-center space-x-1 text-xs text-gray-500 hover:text-cyan-600"
                >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                </button>
            )}
        </div>
    );
}

// ==================== MAIN COMPONENT PREVIEW ====================
function ComponentPreviewInner({
                                   component,
                                   department,
                                   period = 'month',
                                   dateRange = null,
                                   onSave
                               }) {
    if (!component) {
        return (
            <div className="p-8 text-center text-gray-400">
                <p>Aucun composant sélectionné</p>
            </div>
        );
    }

    // Add onSave to component if provided
    const componentWithSave = { ...component, onSave };
    const effectiveDateRange = dateRange || getDefaultDateRange(period);

    switch (component.type) {
        case 'metric':
            return (
                <MetricPreview
                    component={componentWithSave}
                    department={department}
                    period={period}
                    dateRange={effectiveDateRange}
                />
            );
        case "kpi":
            return (
                <KPIBlock
                    component={componentWithSave}
                    department={department}
                    period={period}
                    dateRange={effectiveDateRange}
                />
            );
        case 'chart':
            return (
                <ChartPreview
                    component={componentWithSave}
                    department={department}
                    period={period}
                    dateRange={effectiveDateRange}
                />
            );
        case 'table':
            return (
                <TablePreview
                    component={componentWithSave}
                    department={department}
                    period={period}
                    dateRange={effectiveDateRange}
                />
            );
        case 'text':
            return <TextBlock component={componentWithSave} />;
        case 'textarea':
            return <TextAreaBlock component={componentWithSave} />;
        default:
            return (
                <div className="p-8 text-center text-gray-400">
                    <p>Type de composant inconnu: {component.type}</p>
                </div>
            );
    }
}

// Main Component Preview with Error Boundary
export default function ComponentPreview(props) {
    return (
        <ComponentErrorBoundary>
            <ComponentPreviewInner {...props} />
        </ComponentErrorBoundary>
    );
}

// PropTypes
ComponentPreview.propTypes = {
    component: PropTypes.shape({
        type: PropTypes.oneOf(['metric', 'kpi', 'chart', 'table', 'text', 'textarea']).isRequired,
        config: PropTypes.object.isRequired
    }).isRequired,
    department: PropTypes.string.isRequired,
    period: PropTypes.oneOf(['day', 'week', 'month', 'quarter', 'year']),
    dateRange: PropTypes.shape({
        start: PropTypes.string,
        end: PropTypes.string
    }),
    onSave: PropTypes.func
};

// Helper function
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
            start.setMonth(start.getMonth() - 1);
    }

    return {
        start: start.toISOString().split('T')[0],
        end
    };
}