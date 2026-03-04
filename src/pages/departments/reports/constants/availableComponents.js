// pages/departments/reports/builder/constants/availableComponents.js

import {
    TrendingUp,
    BarChart3,
    PieChart,
    LineChart,
    Table2,
    FileText,
} from 'lucide-react';

export const AVAILABLE_COMPONENTS = [
    {
        id: 'metric',
        type: 'metric',
        name: 'Métrique',
        icon: TrendingUp,
        defaultConfig: {
            calculation: 'sum',
            field: '',
            label: 'Nouvelle Métrique',
        },
    },
    {
        id: 'bar_chart',
        type: 'chart',
        name: 'Graphique Barres',
        icon: BarChart3,
        defaultConfig: {
            chartType: 'bar',
            x_axis: '',
            y_axis: '',
        },
    },
    {
        id: 'pie_chart',
        type: 'chart',
        name: 'Graphique Circulaire',
        icon: PieChart,
        defaultConfig: {
            chartType: 'pie',
            fields: [],
        },
    },
    {
        id: 'line_chart',
        type: 'chart',
        name: 'Graphique Linéaire',
        icon: LineChart,
        defaultConfig: {
            chartType: 'line',
            x_axis: '',
            y_axis: '',
        },
    },
    {
        id: 'table',
        type: 'table',
        name: 'Tableau',
        icon: Table2,
        defaultConfig: {
            columns: [],
        },
    },
    {
        id: 'text',
        type: 'text',
        name: 'Bloc Texte',
        icon: FileText,
        defaultConfig: {
            content: 'Votre texte...',
        },
    },
];