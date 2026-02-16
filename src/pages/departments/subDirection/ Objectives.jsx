import { useState } from 'react';
import {
    Target, TrendingUp, Calendar, CheckCircle, Clock,
    AlertCircle, Plus, Edit2, Trash2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Objectives = () => {
    const [activeTab, setActiveTab] = useState('global');
    const [showNewObjective, setShowNewObjective] = useState(false);

    // Objectifs globaux entreprise
    const globalObjectives = [
        {
            id: 1,
            title: 'Taux de validation global',
            description: 'Atteindre 95% de taux de validation sur tous les départements',
            target: 95,
            current: 90.8,
            unit: '%',
            deadline: '2026-06-30',
            status: 'en-cours',
            progress: 95.6,
            responsible: 'Direction Générale',
            category: 'Qualité'
        },
        {
            id: 2,
            title: 'Réduction délai validation',
            description: 'Réduire le délai moyen de validation à moins de 24h',
            target: 1,
            current: 1.8,
            unit: 'jours',
            deadline: '2026-12-31',
            status: 'en-cours',
            progress: 55.6,
            responsible: 'Validateurs',
            category: 'Efficacité'
        },
        {
            id: 3,
            title: 'Complétion rapports',
            description: '100% des rapports obligatoires soumis dans les délais',
            target: 100,
            current: 94,
            unit: '%',
            deadline: '2026-03-31',
            status: 'en-cours',
            progress: 94,
            responsible: 'Tous départements',
            category: 'Conformité'
        },
        {
            id: 4,
            title: 'Formation utilisateurs',
            description: 'Former 100% des nouveaux utilisateurs en moins de 7 jours',
            target: 100,
            current: 85,
            unit: '%',
            deadline: '2026-12-31',
            status: 'en-retard',
            progress: 85,
            responsible: 'RH & IT',
            category: 'Formation'
        }
    ];

    // Objectifs par département
    const departmentObjectives = [
        {
            department: 'Comptabilité',
            objectives: [
                { title: 'Rapports mensuels à temps', target: 100, current: 92, unit: '%' },
                { title: 'Validation bilans', target: 48, current: 45, unit: 'h' }
            ]
        },
        {
            department: 'Maintenance',
            objectives: [
                { title: 'Taux disponibilité machines', target: 95, current: 94.8, unit: '%' },
                { title: 'Rapports interventions', target: 100, current: 93, unit: '%' }
            ]
        },
        {
            department: 'RH',
            objectives: [
                { title: 'Complétion rapports', target: 100, current: 100, unit: '%' },
                { title: 'Traitement congés', target: 48, current: 36, unit: 'h' }
            ]
        }
    ];

    // Progression historique
    const progressData = [
        { mois: 'Sep', validation: 85, completion: 88 },
        { mois: 'Oct', validation: 87, completion: 90 },
        { mois: 'Nov', validation: 88, completion: 89 },
        { mois: 'Déc', validation: 89, completion: 91 },
        { mois: 'Jan', validation: 90, completion: 93 },
        { mois: 'Fév', validation: 90.8, completion: 94 },
    ];

    const getStatusBadge = (status) => {
        const badges = {
            'en-cours': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En cours', icon: Clock },
            'atteint': { bg: 'bg-green-100', text: 'text-green-800', label: 'Atteint', icon: CheckCircle },
            'en-retard': { bg: 'bg-red-100', text: 'text-red-800', label: 'En retard', icon: AlertCircle }
        };
        const badge = badges[status] || badges['en-cours'];
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3 mr-1" />
                {badge.label}
      </span>
        );
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Qualité': 'bg-purple-100 text-purple-800',
            'Efficacité': 'bg-blue-100 text-blue-800',
            'Conformité': 'bg-green-100 text-green-800',
            'Formation': 'bg-amber-100 text-amber-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Objectifs Stratégiques</h1>
                    <p className="text-gray-600 mt-1">Définition et suivi des objectifs de l'entreprise</p>
                </div>
                <button
                    onClick={() => setShowNewObjective(true)}
                    className="btn-primary flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nouvel Objectif
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <div className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('global')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'global'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Objectifs Globaux
                        </button>
                        <button
                            onClick={() => setActiveTab('departments')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'departments'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Par Département
                        </button>
                        <button
                            onClick={() => setActiveTab('progress')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'progress'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Progression
                        </button>
                    </div>
                </div>
            </div>

            {/* Objectifs Globaux */}
            {activeTab === 'global' && (
                <div className="space-y-6">
                    {/* Stats Résumé */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Total Objectifs</p>
                                <Target className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{globalObjectives.length}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">En Cours</p>
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-3xl font-bold text-blue-600">
                                {globalObjectives.filter(o => o.status === 'en-cours').length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Atteints</p>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-3xl font-bold text-green-600">
                                {globalObjectives.filter(o => o.status === 'atteint').length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">En Retard</p>
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <p className="text-3xl font-bold text-red-600">
                                {globalObjectives.filter(o => o.status === 'en-retard').length}
                            </p>
                        </div>
                    </div>

                    {/* Liste Objectifs */}
                    <div className="space-y-4">
                        {globalObjectives.map((objective) => (
                            <div key={objective.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">{objective.title}</h3>
                                                {getStatusBadge(objective.status)}
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(objective.category)}`}>
                          {objective.category}
                        </span>
                                            </div>
                                            <p className="text-sm text-gray-600">{objective.description}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">Progression</span>
                                            <span className="text-sm">
                        <span className="font-bold text-gray-900">{objective.current}{objective.unit}</span>
                        <span className="text-gray-500"> / {objective.target}{objective.unit}</span>
                      </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all duration-300 ${
                                                    objective.progress >= 90 ? 'bg-green-500' :
                                                        objective.progress >= 70 ? 'bg-blue-500' :
                                                            'bg-amber-500'
                                                }`}
                                                style={{ width: `${Math.min(objective.progress, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Échéance: {new Date(objective.deadline).toLocaleDateString('fr-FR')}
                      </span>
                                            <span>
                        Responsable: <strong>{objective.responsible}</strong>
                      </span>
                                        </div>
                                        <span className={`font-medium ${
                                            objective.progress >= 90 ? 'text-green-600' :
                                                objective.progress >= 70 ? 'text-blue-600' :
                                                    'text-amber-600'
                                        }`}>
                      {objective.progress.toFixed(1)}% complété
                    </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Par Département */}
            {activeTab === 'departments' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {departmentObjectives.map((dept, index) => (
                        <div key={index} className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900">{dept.department}</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {dept.objectives.map((obj, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-gray-900">{obj.title}</h4>
                                            <span className="text-sm font-bold text-blue-600">
                        {obj.current}/{obj.target}{obj.unit}
                      </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full bg-blue-500"
                                                style={{ width: `${(obj.current / obj.target) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Progression */}
            {activeTab === 'progress' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Évolution des Objectifs Principaux (6 mois)
                    </h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={progressData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mois" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="validation"
                                stroke="#3b82f6"
                                name="Taux validation (%)"
                                strokeWidth={3}
                            />
                            <Line
                                type="monotone"
                                dataKey="completion"
                                stroke="#10b981"
                                name="Taux complétion (%)"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default Objectives;