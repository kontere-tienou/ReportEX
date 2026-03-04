// pages/departments/reports/builder/constants/availableComponents.js

import {
    TrendingUp,
    BarChart3,
    PieChart,
    LineChart,
    Table2,
    FileText, Percent, Activity,
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
    {
        id: 'metric_sum',
        type: 'metric',
        name: 'Total',
        icon: TrendingUp,
        description: 'Somme totale',
        config: {
            calculation: 'sum',
            field: 'qte_realisee',
            label: 'Total Production',
            period: 'all',
        },
    },
    {
        id: 'metric_avg',
        type: 'metric',
        name: 'Moyenne',
        icon: Activity,
        description: 'Moyenne calculée',
        config: {
            calculation: 'avg',
            field: 'performance',
            label: 'Moyenne Performance',
            period: 'all',
        },
    },
    {
        id: 'metric_percent',
        type: 'metric',
        name: 'Pourcentage',
        icon: Percent,
        description: '% d\'objectif',
        config: {
            calculation: 'percent',
            field: 'qte_realisee',
            reference: 'objectif_global',
            label: 'Taux d\'Atteinte',
        },
    },
    {
        id: 'chart_bar',
        type: 'chart',
        name: 'Graphique en Barres',
        icon: BarChart3,
        description: 'Comparaison valeurs',
        config: {
            chartType: 'bar',
            x_axis: 'date',
            y_axis: 'qte_realisee',
            title: 'Production par Jour',
        },
    },
    {
        id: 'chart_pie',
        type: 'chart',
        name: 'Graphique Circulaire',
        icon: PieChart,
        description: 'Répartition %',
        config: {
            chartType: 'pie',
            fields: ['production_1er_choix', 'production_2eme_choix', 'production_3eme_choix'],
            labels: ['1er Choix', '2ème Choix', '3ème Choix'],
            title: 'Répartition Qualité',
        },
    },
    {
        id: 'chart_line',
        type: 'chart',
        name: 'Graphique Linéaire',
        icon: LineChart,
        description: 'Évolution temps',
        config: {
            chartType: 'line',
            x_axis: 'date',
            y_axis: 'performance',
            title: 'Évolution Performance',
        },
    },
    {
        id: 'table',
        type: 'table',
        name: 'Tableau de Données',
        icon: Table2,
        description: 'Liste détaillée',
        config: {
            columns: ['date', 'qte_realisee', 'performance'],
            limit: 10,
            title: 'Détails Production',
        },
    },
    {
        id: 'text',
        type: 'text',
        name: 'Bloc de Texte',
        icon: FileText,
        description: 'Commentaire libre',
        config: {
            content: 'Votre texte ici...',
        },
    },
];