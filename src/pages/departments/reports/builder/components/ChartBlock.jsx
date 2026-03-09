// pages/departments/reports/builder/components/ChartBlock.jsx
import {
    BarChart, Bar, LineChart, Line,
    PieChart, Pie, Tooltip, Legend,
    XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, Cell
} from "recharts";
import { useState, useEffect } from 'react';
import useComponentProcessor from '../hooks/useComponentProcessor';

const COLORS = ['#06b6d4', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

export default function ChartBlock({ component, data }) {
    const { chartType = "bar", title, xAxis, yAxis, labels } = component.config;
    const { processChartData } = useComponentProcessor();
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (data && component.config) {
            const processed = processChartData(data, component.config);
            setChartData(processed);
        }
    }, [data, component.config]);

    if (!chartData || chartData.length === 0) {
        return (
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Aucune donnée à afficher</p>
            </div>
        );
    }

    const yAxes = Array.isArray(yAxis) ? yAxis : [yAxis || 'value'];

    const renderChart = () => {
        switch (chartType) {
            case 'bar':
                return (
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xAxis || 'name'} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {yAxes.map((axis, index) => (
                            <Bar
                                key={axis}
                                dataKey={axis}
                                fill={COLORS[index % COLORS.length]}
                                name={labels?.[index] || axis}
                            />
                        ))}
                    </BarChart>
                );

            case 'line':
                return (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xAxis || 'name'} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {yAxes.map((axis, index) => (
                            <Line
                                key={axis}
                                type="monotone"
                                dataKey={axis}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={2}
                                name={labels?.[index] || axis}
                            />
                        ))}
                    </LineChart>
                );

            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey={yAxes[0]}
                            nameKey={xAxis || 'name'}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                );

            default:
                return null;
        }
    };

    return (
        <div className="h-80 w-full">
            {title && <h4 className="mb-4 font-semibold text-gray-800">{title}</h4>}
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
}