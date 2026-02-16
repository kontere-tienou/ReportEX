import { useState, useEffect } from 'react';
import {
    TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock,
    Users, FileText, BarChart3
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const VueConsolidee = () => {
    const [timeRange, setTimeRange] = useState('month');

    // Données consolidées des départements
    const departmentsPerformance = [
        { name: 'Comptabilité', rapports: 12, valides: 11, taux: 92, trend: 'up' },
        { name: 'Bureau Étude', rapports: 7, valides: 5, taux: 71, trend: 'down' },
        { name: 'Maintenance', rapports: 15, valides: 14, taux: 93, trend: 'up' },
        { name: 'Filature', rapports: 13, valides: 12, taux: 92, trend: 'up' },
        { name: 'Impression', rapports: 10, valides: 9, taux: 90, trend: 'stable' },
        { name: 'Stock', rapports: 11, valides: 10, taux: 91, trend: 'up' },
        { name: 'Achats', rapports: 9, valides: 8, taux: 89, trend: 'stable' },
        { name: 'Commercial', rapports: 14, valides: 12, taux: 86, trend: 'down' },
        { name: 'Informatique', rapports: 8, valides: 7, taux: 88, trend: 'up' },
        { name: 'RH', rapports: 10, valides: 10, taux: 100, trend: 'up' },
    ];

    // Évolution temporelle
    const evolutionData = [
        { mois: 'Sep', total: 95, valides: 82 },
        { mois: 'Oct', total: 102, valides: 89 },
        { mois: 'Nov', total: 98, valides: 85 },
        { mois: 'Déc', total: 105, valides: 92 },
        { mois: 'Jan', total: 109, valides: 98 },
        { mois: 'Fév', total: 109, valides: 99 },
    ];

    // Répartition par statut
    const statusData = [
        { name: 'Validés', value: 99, color: '#10b981' },
        { name: 'En attente', value: 7, color: '#f59e0b' },
        { name: 'Rejetés', value: 3, color: '#ef4444' },
    ];

    // KPIs globaux
    const globalKPIs = {
        totalReports: 109,
        validationRate: 90.8,
        avgValidationTime: 1.8, // jours
        activeUsers: 45,
    };

    const getTrendIcon = (trend) => {
        if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
        if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
        return <div className="w-4 h-4" />;
    };

    return (
        <div className="space-y-6">
            {/* Header avec filtres */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Vue Consolidée</h1>
                    <p className="text-gray-600 mt-1">Synthèse globale de tous les départements</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setTimeRange('week')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Semaine
                    </button>
                    <button
                        onClick={() => setTimeRange('month')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Mois
                    </button>
                    <button
                        onClick={() => setTimeRange('quarter')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            timeRange === 'quarter' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Trimestre
                    </button>
                </div>
            </div>

            {/* KPIs Globaux */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Rapports Total</p>
                        <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{globalKPIs.totalReports}</p>
                    <p className="text-sm text-green-600 mt-1">+5% vs mois dernier</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Taux Validation</p>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{globalKPIs.validationRate}%</p>
                    <p className="text-sm text-green-600 mt-1">+2.3% vs mois dernier</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Délai Moyen</p>
                        <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{globalKPIs.avgValidationTime}j</p>
                    <p className="text-sm text-green-600 mt-1">-0.5j vs mois dernier</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Utilisateurs Actifs</p>
                        <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{globalKPIs.activeUsers}</p>
                    <p className="text-sm text-gray-500 mt-1">sur 50 total</p>
                </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Évolution temporelle */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Évolution des Rapports (6 mois)
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={evolutionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mois" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total" strokeWidth={2} />
                            <Line type="monotone" dataKey="valides" stroke="#10b981" name="Validés" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Répartition par statut */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Répartition par Statut
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tableau Performance Départements */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Performance par Département</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rapports</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Validés</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Taux</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tendance</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {departmentsPerformance.map((dept, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{dept.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                                    {dept.rapports}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-green-600 font-medium">
                                    {dept.valides}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        dept.taux >= 90 ? 'bg-green-100 text-green-800' :
                            dept.taux >= 80 ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                    }`}>
                      {dept.taux}%
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex justify-center">
                                        {getTrendIcon(dept.trend)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {dept.taux >= 90 ? (
                                        <span className="flex items-center justify-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Excellent
                      </span>
                                    ) : dept.taux >= 80 ? (
                                        <span className="flex items-center justify-center text-amber-600">
                        <Clock className="w-4 h-4 mr-1" />
                        Bon
                      </span>
                                    ) : (
                                        <span className="flex items-center justify-center text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Attention
                      </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Insights & Recommandations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-bold text-green-900 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Points Forts
                    </h3>
                    <ul className="space-y-2">
                        <li className="text-sm text-green-800">
                            ✓ <strong>RH:</strong> 100% de complétion, aucun retard
                        </li>
                        <li className="text-sm text-green-800">
                            ✓ <strong>Maintenance:</strong> Amélioration de 8% ce mois
                        </li>
                        <li className="text-sm text-green-800">
                            ✓ <strong>Global:</strong> Délai validation réduit de 25%
                        </li>
                    </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="font-bold text-red-900 mb-3 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Points d'Attention
                    </h3>
                    <ul className="space-y-2">
                        <li className="text-sm text-red-800">
                            • <strong>Bureau Étude:</strong> Taux validation faible (71%)
                        </li>
                        <li className="text-sm text-red-800">
                            • <strong>Commercial:</strong> Tendance à la baisse ce mois
                        </li>
                        <li className="text-sm text-red-800">
                            • <strong>3 départements:</strong> Rapports en retard > 3 jours
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default VueConsolidee;