import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import {
    TrendingUp,
    BarChart3,
    PieChart,
    LineChart,
    Table2,
    FileText,
    Percent,
    Activity,
    Hash,
    Maximize2,
    Minimize2,
} from 'lucide-react';
import { schemaService } from '../../dataEntry/service/schemaService'; // Updated import

// Component generators
const generateComponents = (deptCode, schema) => {
    // Get numeric fields from schema
    const numericFields = schema.fields.filter(f => f.type === 'number');
    const components = [];

    // Pour chaque champ numérique, générer les composants possibles
    numericFields.forEach((field) => {
        // 1. Métrique Somme
        components.push({
            id: `sum_${field.key}_${Date.now()}`,
            type: 'metric',
            name: `Total ${field.label}`,
            icon: TrendingUp,
            description: 'Somme',
            category: 'metric',
            fieldKey: field.key,
            config: {
                calculation: 'sum',
                field: field.key,
                label: `Total ${field.label}`,
                format: field.label.includes('%') ? 'percent' : 'number',
                tableName: schema.tableName,
            },
        });

        // 2. Métrique Moyenne
        components.push({
            id: `avg_${field.key}_${Date.now()}`,
            type: 'metric',
            name: `Moyenne ${field.label}`,
            icon: Activity,
            description: 'Moyenne',
            category: 'metric',
            fieldKey: field.key,
            config: {
                calculation: 'avg',
                field: field.key,
                label: `Moyenne ${field.label}`,
                format: field.label.includes('%') ? 'percent' : 'decimal',
                tableName: schema.tableName,
            },
        });

        // 3. Métrique Min/Max
        components.push({
            id: `max_${field.key}_${Date.now()}`,
            type: 'metric',
            name: `Maximum ${field.label}`,
            icon: Maximize2,
            description: 'Max',
            category: 'metric',
            fieldKey: field.key,
            config: {
                calculation: 'max',
                field: field.key,
                label: `Max ${field.label}`,
                format: 'number',
                tableName: schema.tableName,
            },
        });

        components.push({
            id: `min_${field.key}_${Date.now()}`,
            type: 'metric',
            name: `Minimum ${field.label}`,
            icon: Minimize2,
            description: 'Min',
            category: 'metric',
            fieldKey: field.key,
            config: {
                calculation: 'min',
                field: field.key,
                label: `Min ${field.label}`,
                format: 'number',
                tableName: schema.tableName,
            },
        });

        // 4. Graphique Barres
        components.push({
            id: `bar_${field.key}_${Date.now()}`,
            type: 'chart',
            name: `Graphique ${field.label}`,
            icon: BarChart3,
            description: 'Barres',
            category: 'chart',
            fieldKey: field.key,
            config: {
                chartType: 'bar',
                xAxis: 'date',
                yAxis: field.key,
                title: `Évolution ${field.label}`,
                tableName: schema.tableName,
            },
        });

        // 5. Graphique Ligne
        components.push({
            id: `line_${field.key}_${Date.now()}`,
            type: 'chart',
            name: `Tendance ${field.label}`,
            icon: LineChart,
            description: 'Ligne',
            category: 'chart',
            fieldKey: field.key,
            config: {
                chartType: 'line',
                xAxis: 'date',
                yAxis: field.key,
                title: `Tendance ${field.label}`,
                tableName: schema.tableName,
            },
        });
    });

    // Graphiques spéciaux selon département
    if (deptCode === 'IMPRESSION') {
        components.push({
            id: `pie_qualite_${Date.now()}`,
            type: 'chart',
            name: 'Répartition Qualité',
            icon: PieChart,
            description: 'Circulaire',
            category: 'chart',
            config: {
                chartType: 'pie',
                fields: ['production_1er_choix', 'production_2eme_choix', 'production_3eme_choix'],
                labels: ['1er Choix', '2ème Choix', '3ème Choix'],
                title: 'Répartition par Qualité',
                tableName: schema.tableName,
            },
        });

        // Pourcentage objectif
        components.push({
            id: `percent_objectif_${Date.now()}`,
            type: 'metric',
            name: '% Objectif Production',
            icon: Percent,
            description: 'Pourcentage',
            category: 'metric',
            config: {
                calculation: 'percent',
                field: 'metres_imprimes',
                reference: 'objectif_global',
                label: 'Taux Atteinte Objectif',
                format: 'percent',
                tableName: schema.tableName,
            },
        });
    }

    if (deptCode === 'CONFECTION') {
        components.push({
            id: `percent_objectif_conf_${Date.now()}`,
            type: 'metric',
            name: '% Atteinte Objectif',
            icon: Percent,
            description: 'Pourcentage',
            category: 'metric',
            config: {
                calculation: 'percent',
                field: 'qte_realisee',
                reference: 'objectif_global',
                label: 'Taux Atteinte',
                format: 'percent',
                tableName: schema.tableName,
            },
        });
    }

    if (deptCode === 'TEINTURE') {
        components.push({
            id: `performance_teinture_${Date.now()}`,
            type: 'metric',
            name: 'Performance',
            icon: Activity,
            description: 'Performance',
            category: 'metric',
            config: {
                calculation: 'avg',
                field: 'performance',
                label: 'Performance Moyenne',
                format: 'percent',
                tableName: schema.tableName,
            },
        });
    }
// Add COMPTABILITE specific components
    if (deptCode === 'COMPTA') {
        // Ratio de couverture
        components.push({
            id: `ratio_couverture_${Date.now()}`,
            type: 'metric',
            name: 'Ratio de Couverture',
            icon: Percent,
            description: 'Entrées/Sorties',
            category: 'metric',
            config: {
                calculation: 'ratio',
                field1: 'caisse_entrees',
                field2: 'caisse_sorties',
                label: 'Ratio Entrées/Sorties',
                format: 'percent',
                tableName: schema.tableName,
            },
        });

        // Marge moyenne par commande
        components.push({
            id: `marge_moyenne_${Date.now()}`,
            type: 'metric',
            name: 'Marge Moyenne par Commande',
            icon: TrendingUp,
            description: 'CA/Commandes',
            category: 'metric',
            config: {
                calculation: 'avg_per_order',
                field: 'ca',
                reference: 'commandes',
                label: 'Marge Moyenne',
                format: 'currency',
                tableName: schema.tableName,
            },
        });

        // Évolution CA
        components.push({
            id: `ca_tendance_${Date.now()}`,
            type: 'chart',
            name: 'Évolution du CA',
            icon: LineChart,
            description: 'Tendance',
            category: 'chart',
            fieldKey: 'ca',
            config: {
                chartType: 'line',
                xAxis: 'date',
                yAxis: 'ca',
                title: 'Évolution du Chiffre d\'Affaires',
                tableName: schema.tableName,
            },
        });

        // Comparaison Entrées/Sorties
        components.push({
            id: `comparaison_caisse_${Date.now()}`,
            type: 'chart',
            name: 'Comparaison Caisse',
            icon: BarChart3,
            description: 'Entrées vs Sorties',
            category: 'chart',
            config: {
                chartType: 'bar',
                xAxis: 'date',
                yAxis: ['caisse_entrees', 'caisse_sorties'],
                title: 'Entrées et Sorties de Caisse',
                tableName: schema.tableName,
            },
        });

        // Répartition des mouvements
        components.push({
            id: `repartition_mouvements_${Date.now()}`,
            type: 'chart',
            name: 'Répartition Mouvements',
            icon: PieChart,
            description: 'Circulaire',
            category: 'chart',
            config: {
                chartType: 'pie',
                fields: ['caisse_entrees', 'caisse_sorties', 'solde_caisse'],
                labels: ['Entrées', 'Sorties', 'Solde'],
                title: 'Répartition des Mouvements',
                tableName: schema.tableName,
            },
        });

        // Solde moyen
        components.push({
            id: `solde_moyen_${Date.now()}`,
            type: 'metric',
            name: 'Solde Moyen',
            icon: Activity,
            description: 'Moyenne',
            category: 'metric',
            config: {
                calculation: 'avg',
                field: 'solde_caisse',
                label: 'Solde Moyen',
                format: 'currency',
                tableName: schema.tableName,
            },
        });

        // Total commandes
        components.push({
            id: `total_commandes_${Date.now()}`,
            type: 'metric',
            name: 'Total Commandes',
            icon: Hash,
            description: 'Somme',
            category: 'metric',
            config: {
                calculation: 'sum',
                field: 'commandes',
                label: 'Total Commandes',
                format: 'number',
                tableName: schema.tableName,
            },
        });
    }

    if (deptCode === 'PRODUCTION') {
        components.push({
            id: `rendement_prod_${Date.now()}`,
            type: 'metric',
            name: 'Taux Rendement',
            icon: Percent,
            description: 'Rendement',
            category: 'metric',
            config: {
                calculation: 'avg',
                field: 'taux_rendement',
                label: 'Rendement Moyen',
                format: 'percent',
                tableName: schema.tableName,
            },
        });
    }

    if (deptCode === 'IT') {
        components.push({
            id: `resolution_it_${Date.now()}`,
            type: 'metric',
            name: 'Taux Résolution',
            icon: Activity,
            description: 'Résolution',
            category: 'metric',
            config: {
                calculation: 'avg',
                field: 'taux_satisfaction_utilisateurs',
                label: 'Satisfaction',
                format: 'percent',
                tableName: schema.tableName,
            },
        });
    }

    // Tableau données brutes
    components.push({
        id: `table_all_${Date.now()}`,
        type: 'table',
        name: 'Tableau Détaillé',
        icon: Table2,
        description: 'Toutes données',
        category: 'table',
        config: {
            columns: schema.fields.slice(0, 5).map((f) => f.key),
            limit: 10,
            title: `Détails ${schema.title || 'Production'}`,
            tableName: schema.tableName,
        },
    });

    // Bloc texte
    components.push({
        id: `text_block_${Date.now()}`,
        type: 'text',
        name: 'Bloc de Texte',
        icon: FileText,
        description: 'Commentaire',
        category: 'text',
        config: {
            content: 'Votre analyse ici...',
        },
    });

    return components;
};

export default function BuilderToolbar({ onAddComponent }) {
    const { user } = useAuth();
    const [availableComponents, setAvailableComponents] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [schema, setSchema] = useState(null);

    useEffect(() => {
        loadSchemaAndComponents();
    }, [user]);

    const loadSchemaAndComponents = async () => {
        setLoading(true);
        try {
            const deptCode = user?.department?.code?.toUpperCase() || 'DEFAULT';
            // Get schema from service
            const deptSchema = await schemaService.getDepartmentSchema(deptCode);
            setSchema(deptSchema);
            // Generate components based on schema
            const components = generateComponents(deptCode, deptSchema);
            setAvailableComponents(components);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { id: 'all', label: 'Tous', icon: Hash },
        { id: 'metric', label: 'Métriques', icon: TrendingUp },
        { id: 'chart', label: 'Graphiques', icon: BarChart3 },
        { id: 'table', label: 'Tableaux', icon: Table2 },
        { id: 'text', label: 'Texte', icon: FileText },
    ];

    const filteredComponents = availableComponents.filter((c) => {
        const matchCategory = activeCategory === 'all' || c.category === activeCategory;
        const matchSearch =
            searchTerm === '' ||
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategory && matchSearch;
    });

    if (loading) {
        return (
            <div className="bg-white rounded-xl border h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border h-full flex flex-col">
            {/* Header - Fixed */}
            <div className="p-4 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Composants
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            {schema?.icon || '📊'} {user?.department?.name || 'Département'}
                        </p>
                    </div>
                    <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">
                        {availableComponents.length}
                    </span>
                </div>
            </div>

            {/* Search - Fixed */}
            <div className="px-4 py-3 border-b flex-shrink-0">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un composant..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
            </div>

            {/* Categories - Fixed */}
            <div className="px-4 py-2 border-b flex-shrink-0">
                <div className="flex flex-wrap gap-1">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const count = availableComponents.filter(c =>
                            cat.id === 'all' ? true : c.category === cat.id
                        ).length;

                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-3 py-1.5 text-xs rounded-full transition-colors flex items-center space-x-1 ${
                                    activeCategory === cat.id
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <Icon className="w-3 h-3" />
                                <span>{cat.label}</span>
                                {count > 0 && (
                                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                                        activeCategory === cat.id
                                            ? 'bg-white text-cyan-600'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {filteredComponents.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-2">🔍</div>
                        <p className="text-sm text-gray-500">Aucun composant trouvé</p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-2 text-xs text-cyan-600 hover:underline"
                            >
                                Effacer la recherche
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredComponents.map((component) => {
                            const Icon = component.icon;

                            return (
                                <button
                                    key={component.id}
                                    onClick={() => onAddComponent(component)}
                                    className="w-full bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-cyan-500 hover:shadow-md transition-all group text-left"
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-cyan-50 p-2 rounded-lg group-hover:bg-cyan-100 transition-colors flex-shrink-0">
                                            <Icon className="w-4 h-4 text-cyan-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm group-hover:text-cyan-600 transition-colors">
                                                {component.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {component.description}
                                            </p>
                                            {component.fieldKey && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Champ: {component.fieldKey}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer - Fixed */}
            <div className="p-3 bg-gray-50 border-t flex-shrink-0">
                <div className="flex items-center justify-between text-xs">
                    <p className="text-gray-600">
                        <strong>{filteredComponents.length}</strong> composant
                        {filteredComponents.length > 1 ? 's' : ''} affiché
                        {filteredComponents.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-gray-400">
                        Glissez ou cliquez pour ajouter
                    </p>
                </div>
            </div>
        </div>
    );
}