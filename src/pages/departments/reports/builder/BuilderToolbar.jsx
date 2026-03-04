import {
    TrendingUp,
    BarChart3,
    PieChart,
    LineChart,
    Table2,
    FileText,
    Percent,
    Activity,
} from 'lucide-react';

/**
 * ==========================================
 * AVAILABLE COMPONENTS
 * ==========================================
 */
const AVAILABLE_COMPONENTS = [
    {
        id: 'metric_sum',
        type: 'metric',
        name: 'Total (Somme)',
        icon: TrendingUp,
        description: 'Somme totale',
        config: {
            calculation: 'sum',
            field: 'qte_realisee',
            label: 'Total Production',
            format: 'number',
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
            format: 'decimal',
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
            format: 'percent',
        },
    },
    {
        id: 'chart_bar',
        type: 'chart',
        name: 'Graphique Barres',
        icon: BarChart3,
        description: 'Comparaison',
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
        description: 'Évolution',
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
        name: 'Tableau',
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
        description: 'Commentaire',
        config: {
            content: 'Votre texte ici...',
        },
    },
];

/**
 * ==========================================
 * BUILDER TOOLBAR
 * ==========================================
 */
export default function BuilderToolbar({ onAddComponent }) {
    return (
        <div className="bg-white rounded-xl border p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Composants Disponibles
            </h3>

            <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
                {AVAILABLE_COMPONENTS.map((component) => {
                    const Icon = component.icon;

                    return (
                        <button
                            key={component.id}
                            onClick={() => onAddComponent(component)}
                            className="w-full bg-white border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-cyan-500 hover:shadow-md transition-all group text-left"
                        >
                            <div className="flex items-start space-x-3">
                                <div className="bg-cyan-100 p-2 rounded-lg group-hover:bg-cyan-200 transition-colors flex-shrink-0">
                                    <Icon className="w-5 h-5 text-cyan-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm group-hover:text-cyan-600 transition-colors">
                                        {component.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">{component.description}</p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
            </div>

            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                    <strong>Astuce:</strong> Cliquez sur un composant pour l'ajouter au rapport.
                </p>
            </div>
        </div>
    );
}