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
    const { chartType = "bar", title, xAxis, yAxis } = component.config;
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
                        <Bar dataKey={yAxis || 'value'} fill="#06b6d4" />
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
                        <Line type="monotone" dataKey={yAxis || 'value'} stroke="#06b6d4" />
                    </LineChart>
                );

            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey={yAxis || 'value'}
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