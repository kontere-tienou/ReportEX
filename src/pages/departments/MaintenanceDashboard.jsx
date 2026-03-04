import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
     Wrench, AlertTriangle, CheckCircle, Clock, TrendingDown,
    Settings, Activity
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {reportService} from "./reports/services/reportApi.js";

const MaintenanceDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const statsRes = await reportService.getDepartmentStats(user.department.id);
            setStats(statsRes.data.stats);
        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    // Données spécifiques Maintenance
    const interventionsData = [
        { name: 'Lun', preventif: 4, correctif: 2 },
        { name: 'Mar', preventif: 5, correctif: 1 },
        { name: 'Mer', preventif: 3, correctif: 3 },
        { name: 'Jeu', preventif: 6, correctif: 1 },
        { name: 'Ven', preventif: 4, correctif: 2 },
    ];

    const machinesStatus = [
        { name: 'Machine A1', status: 'Opérationnelle', uptime: '98%' },
        { name: 'Machine A2', status: 'Maintenance', uptime: '85%' },
        { name: 'Machine B1', status: 'Opérationnelle', uptime: '99%' },
        { name: 'Machine B2', status: 'Opérationnelle', uptime: '97%' },
    ];

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-2">
                    {/*<Tool className="w-10 h-10"/>*/}
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard Maintenance</h1>
                        <p className="text-amber-100">Gestion des Équipements & Interventions</p>
                    </div>
                </div>
            </div>

            {/* KPIs Maintenance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Interventions</p>
                            <p className="text-3xl font-bold text-gray-900">23</p>
                            <p className="text-xs text-gray-500 mt-1">Cette semaine</p>
                        </div>
                        <div className="bg-amber-100 p-3 rounded-full">
                            <Wrench className="w-8 h-8 text-amber-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Préventives</p>
                            <p className="text-3xl font-bold text-gray-900">15</p>
                            <p className="text-xs text-green-600 mt-1">65% du total</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Correctives</p>
                            <p className="text-3xl font-bold text-gray-900">8</p>
                            <p className="text-xs text-red-600 mt-1">35% du total</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Disponibilité</p>
                            <p className="text-3xl font-bold text-gray-900">94.8%</p>
                            <p className="text-xs text-blue-600 mt-1">Machines actives</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Activity className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Interventions par jour */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Wrench className="w-5 h-5 mr-2 text-amber-600" />
                        Interventions de la Semaine
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={interventionsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="preventif" fill="#10b981" name="Préventif" />
                            <Bar dataKey="correctif" fill="#ef4444" name="Correctif" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* État des machines */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-amber-600" />
                        État des Machines
                    </h2>
                    <div className="space-y-3">
                        {machinesStatus.map((machine, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                        machine.status === 'Opérationnelle' ? 'bg-green-500' : 'bg-amber-500'
                                    }`}></div>
                                    <span className="font-medium text-gray-900">{machine.name}</span>
                                </div>
                                <div className="text-right">
                  <span className={`text-sm font-semibold ${
                      machine.status === 'Opérationnelle' ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {machine.status}
                  </span>
                                    <p className="text-xs text-gray-500">Disponibilité: {machine.uptime}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Rapports Maintenance */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Mes Rapports Maintenance</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border-2 border-amber-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total Rapports</p>
                        <p className="text-2xl font-bold text-amber-600">{stats?.total_reports || 0}</p>
                    </div>
                    <div className="p-4 border-2 border-green-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Validés</p>
                        <p className="text-2xl font-bold text-green-600">{stats?.validated_reports || 0}</p>
                    </div>
                    <div className="p-4 border-2 border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">En Attente</p>
                        <p className="text-2xl font-bold text-blue-600">{stats?.pending_reports || 0}</p>
                    </div>
                </div>
            </div>

            {/* Actions rapides */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="font-bold text-amber-900 mb-3 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Alertes en Cours
                    </h3>
                    <ul className="space-y-2">
                        <li className="text-sm text-amber-800">• Machine A2: Maintenance programmée demain</li>
                        <li className="text-sm text-amber-800">• Stock pièces de rechange faible (15%)</li>
                        <li className="text-sm text-amber-800">• Inspection annuelle Machine B1 dans 5 jours</li>
                    </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-bold text-green-900 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Actions Récentes
                    </h3>
                    <ul className="space-y-2">
                        <li className="text-sm text-green-800">✓ Maintenance préventive Machine A1 complétée</li>
                        <li className="text-sm text-green-800">✓ Réparation pompe hydraulique terminée</li>
                        <li className="text-sm text-green-800">✓ Commande pièces validée</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceDashboard;