// pages/departments/reports/builder/components/TableBlock.jsx
export default function TableBlock({ component, data = [] }) {
    const { columns, title } = component.config;

    if (!data || data.length === 0) {
        return (
            <div className="p-4 text-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Aucune donnée à afficher</p>
            </div>
        );
    }

    const displayColumns = columns && columns.length > 0
        ? columns
        : Object.keys(data[0] || {});

    return (
        <div className="space-y-2">
            {title && <h4 className="font-semibold text-gray-800">{title}</h4>}
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-50">
                    <tr>
                        {displayColumns.map((col) => (
                            <th
                                key={col}
                                className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b"
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            {displayColumns.map((col) => (
                                <td key={col} className="px-4 py-2 text-gray-900">
                                    {row[col] ?? '—'}
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