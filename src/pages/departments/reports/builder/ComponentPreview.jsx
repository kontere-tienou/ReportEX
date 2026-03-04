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

// Sample data pour l'aperçu
const SAMPLE_DATA_BAR = [
    { date: '01/01', value: 450 },
    { date: '02/01', value: 520 },
    { date: '03/01', value: 380 },
    { date: '04/01', value: 620 },
    { date: '05/01', value: 490 },
];

const SAMPLE_DATA_PIE = [
    { name: '1er Choix', value: 68 },
    { name: '2ème Choix', value: 25 },
    { name: '3ème Choix', value: 7 },
];

const SAMPLE_DATA_LINE = [
    { date: 'S1', value: 85 },
    { date: 'S2', value: 90 },
    { date: 'S3', value: 78 },
    { date: 'S4', value: 95 },
];

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

// Preview Métrique
function MetricPreview({ component }) {
    const { calculation, label } = component.config;

    let sampleValue = '—';
    let icon = '';

    if (calculation === 'sum') {
        sampleValue = '532,476';
        icon = '📊';
    } else if (calculation === 'avg') {
        sampleValue = '89.5';
        icon = '📈';
    } else if (calculation === 'percent') {
        sampleValue = '94.2%';
        icon = '✅';
    }

    return (
        <div className="text-center py-8">
            <div className="text-5xl mb-2">{icon}</div>
            <p className="text-4xl font-bold text-cyan-600 mb-2">{sampleValue}</p>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-xs text-gray-400 mt-2">(Valeur d'exemple)</p>
        </div>
    );
}

// Preview Chart
function ChartPreview({ component }) {
    const { chartType, title } = component.config;

    return (
        <div className="space-y-4">
            {title && <h4 className="font-semibold text-gray-900">{title}</h4>}

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' && (
                        <BarChart data={SAMPLE_DATA_BAR}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#06b6d4" name="Production" />
                        </BarChart>
                    )}

                    {chartType === 'pie' && (
                        <PieChart>
                            <Pie
                                data={SAMPLE_DATA_PIE}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {SAMPLE_DATA_PIE.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    )}

                    {chartType === 'line' && (
                        <LineChart data={SAMPLE_DATA_LINE}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                name="Performance"
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>

            <p className="text-xs text-gray-400 text-center">(Données d'exemple)</p>
        </div>
    );
}

// Preview Table
function TablePreview({ component }) {
    const { columns, title } = component.config;

    const sampleRows = [
        ['01/01/2026', '450', '89%'],
        ['02/01/2026', '520', '92%'],
        ['03/01/2026', '380', '78%'],
    ];

    return (
        <div className="space-y-4">
            {title && <h4 className="font-semibold text-gray-900">{title}</h4>}

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className="px-4 py-2 text-left font-medium text-gray-700">
                                {col}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {sampleRows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-gray-50">
                            {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="px-4 py-2 text-gray-600">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <p className="text-xs text-gray-400">(Données d'exemple)</p>
        </div>
    );
}

// Preview Text
function TextPreview({ component }) {
    const { content } = component.config;

    return (
        <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">
                {content || 'Votre texte ici...'}
            </p>
        </div>
    );
}

// Main Component Preview
export default function ComponentPreview({ component, department, period }) {
    if (!component) {
        return (
            <div className="p-8 text-center text-gray-400">
                <p>Aucun composant sélectionné</p>
            </div>
        );
    }

    switch (component.type) {
        case 'metric':
            return <MetricPreview component={component} />;

        case 'chart':
            return <ChartPreview component={component} />;

        case 'table':
            return <TablePreview component={component} />;

        case 'text':
            return <TextPreview component={component} />;

        default:
            return (
                <div className="p-8 text-center text-gray-400">
                    <p>Type de composant inconnu</p>
                </div>
            );
    }
}