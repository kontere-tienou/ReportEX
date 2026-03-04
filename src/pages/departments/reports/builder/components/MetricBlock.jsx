// pages/departments/reports/builder/components/MetricBlock.jsx
export default function MetricBlock({ component, value }) {
    const { label, prefix = '', suffix = '', decimals = 0 } = component.config;

    const formatValue = (val) => {
        if (val === undefined || val === null) return '—';
        const num = Number(val);
        if (isNaN(num)) return val;
        return num.toFixed(decimals);
    };

    return (
        <div className="text-center p-6 bg-white rounded-lg border">
            <p className="text-4xl font-bold text-cyan-600">
                {prefix}{formatValue(value)}{suffix}
            </p>
            {label && (
                <p className="text-sm text-gray-600 mt-2">
                    {label}
                </p>
            )}
        </div>
    );
}