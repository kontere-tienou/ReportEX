import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import {
    BarChart3, TrendingUp, Users, Building2, CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {reportService} from "../reports/services/reportApi.js";

const DirectionDashboard = () => {
    const { user } = useAuth();
    const [globalStats, setGlobalStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDirectionData();
    }, []);

    const loadDirectionData = async () => {
        try {
            // Pour la direction, on charge les stats globales
            // TODO: Créer une route API spécifique pour les stats de direction
            const statsRes = await reportService.getDepartmentStats(user.department?.id || 1);
            setGlobalStats(statsRes.data.stats);
        } catch (error) {
            console.error('Erreur chargement dashboard direction:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Données des départements (exemple)
    const departmentsData = [
        { name: 'Compta', rapports: 12, taux: 92 },
        { name: 'Maint.', rapports: 15, taux: 95 },
        { name: 'IT', rapports: 8, taux: 88 },
        { name: 'RH', rapports: 10, taux: 100 },
        { name: 'Comm.', rapports: 14, taux: 85 },
        { name: 'Stock', rapports: 11, taux: 90 },
        { name: 'Achats', rapports: 9, taux: 87 },
        { name: 'BED', rapports: 7, taux: 78 },
        { name: 'Filat.', rapports: 13, taux: 94 },
        { name: 'Impr.', rapports: 10, taux: 91 },
    ];

    const statusData = [
        { name: 'Validés', value: 45, color: '#10b981' },
        { name: 'En attente', value: 12, color: '#f59e0b' },
        { name: 'Rejetés', value: 3, color: '#ef4444' },
    ];

    return (
        <div className="space-y-6">
            {/* En-tête Direction */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-2">
                    <Building2 className="w-10 h-10" />
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard Direction Générale</h1>
                        <p className="text-blue-100">Vue d'ensemble BATEX-CI</p>
                    </div>
                </div>
            </div>

            {/* KPIs Globaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Total Départements</p>
                            <p className="text-3xl font-bold text-gray-900">10</p>
                            <p className="text-xs text-green-600 mt-1">Tous actifs</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Building2 className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Rapports ce Mois</p>
                            <p className="text-3xl font-bold text-gray-900">109</p>
                            <p className="text-xs text-gray-500 mt-1">Tous départements</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <BarChart3 className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Taux Validation</p>
                            <p className="text-3xl font-bold text-gray-900">90%</p>
                            <p className="text-xs text-amber-600 mt-1">Moyenne globale</p>
                        </div>
                        <div className="bg-amber-100 p-3 rounded-full">
                            <CheckCircle className="w-8 h-8 text-amber-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Personnel Total</p>
                            <p className="text-3xl font-bold text-gray-900">156</p>
                            <p className="text-xs text-purple-600 mt-1">Employés actifs</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <Users className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance par département */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                        Performance par Département
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={departmentsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="rapports" fill="#3b82f6" name="Rapports" />
                            <Bar dataKey="taux" fill="#10b981" name="Taux %" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* État global des rapports */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                        État Global des Rapports
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={80}
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

            {/* Tableau récapitulatif des départements */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Vue d'ensemble des Départements
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rapports</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validés</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">En Attente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taux</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {departmentsData.map((dept, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{dept.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{dept.rapports}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-green-600">{Math.round(dept.rapports * dept.taux / 100)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-amber-600">{dept.rapports - Math.round(dept.rapports * dept.taux / 100)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                        dept.taux >= 90 ? 'bg-green-100 text-green-800' :
                            dept.taux >= 80 ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                    }`}>
                      {dept.taux}%
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {dept.taux >= 90 ? (
                                        <span className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" /> Excellent
                      </span>
                                    ) : dept.taux >= 80 ? (
                                        <span className="flex items-center text-amber-600">
                        <Clock className="w-4 h-4 mr-1" /> Bon
                      </span>
                                    ) : (
                                        <span className="flex items-center text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" /> À améliorer
                      </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Alertes et actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="font-bold text-red-900 mb-3 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Alertes Prioritaires
                    </h3>
                    <ul className="space-y-2">
                        <li className="text-sm text-red-800">• Bureau d'Étude: Taux validation faible (78%)</li>
                        <li className="text-sm text-red-800">• 3 rapports en retard de plus de 5 jours</li>
                        <li className="text-sm text-red-800">• Commercial: 4 rapports à valider</li>
                    </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Points Positifs
                    </h3>
                    <ul className="space-y-2">
                        <li className="text-sm text-blue-800">✓ RH: 100% de complétion ce mois</li>
                        <li className="text-sm text-blue-800">✓ Maintenance: Meilleure performance (95%)</li>
                        <li className="text-sm text-blue-800">✓ Délai moyen validation: 1.8 jours</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DirectionDashboard;