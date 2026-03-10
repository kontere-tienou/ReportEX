import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import {
    Server, AlertCircle, CheckCircle, Clock, TrendingUp,
    Cpu, HardDrive, Monitor, Wifi, Database
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {reportService} from "../../../services/reportApi.js";

const InformatiqueDashboard = () => {
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    // Données spécifiques IT
    const ticketsData = [
        { name: 'Ouverts', value: 12, color: '#ef4444' },
        { name: 'En cours', value: 8, color: '#f59e0b' },
        { name: 'Résolus', value: 45, color: '#10b981' }
    ];

    const systemsData = [
        { name: 'Serveurs', status: 'OK', uptime: '99.9%' },
        { name: 'Réseau', status: 'OK', uptime: '99.7%' },
        { name: 'Firewall', status: 'Alerte', uptime: '98.2%' },
        { name: 'Backup', status: 'OK', uptime: '100%' }
    ];

    return (
        <div className="space-y-6">
            {/* En-tête avec gradient IT */}
            <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-2">
                    <Server className="w-10 h-10" />
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard Informatique</h1>
                        <p className="text-cyan-100">Support IT & Infrastructure</p>
                    </div>
                </div>
            </div>

            {/* Cartes de statistiques IT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-cyan-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Tickets Ouverts</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.total_reports || 12}</p>
                            <p className="text-xs text-gray-500 mt-1">+3 aujourd'hui</p>
                        </div>
                        <div className="bg-cyan-100 p-3 rounded-full">
                            <AlertCircle className="w-8 h-8 text-cyan-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Systèmes Actifs</p>
                            <p className="text-3xl font-bold text-gray-900">28/30</p>
                            <p className="text-xs text-green-600 mt-1">93% uptime</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <Server className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Interventions</p>
                            <p className="text-3xl font-bold text-gray-900">45</p>
                            <p className="text-xs text-gray-500 mt-1">Cette semaine</p>
                        </div>
                        <div className="bg-amber-100 p-3 rounded-full">
                            <Cpu className="w-8 h-8 text-amber-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Utilisateurs</p>
                            <p className="text-3xl font-bold text-gray-900">156</p>
                            <p className="text-xs text-blue-600 mt-1">+8 ce mois</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Monitor className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphiques IT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* État des tickets */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-cyan-600" />
                        État des Tickets
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={ticketsData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {ticketsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* État des systèmes */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Server className="w-5 h-5 mr-2 text-cyan-600" />
                        État des Systèmes
                    </h2>
                    <div className="space-y-4">
                        {systemsData.map((system, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${system.status === 'OK' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                    <span className="font-medium text-gray-900">{system.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-semibold ${system.status === 'OK' ? 'text-green-600' : 'text-amber-600'}`}>
                                        {system.status}
                                    </span>
                                    <p className="text-xs text-gray-500">Uptime: {system.uptime}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mes rapports IT */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-cyan-600" />
                    Rapports IT - Ce Mois
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border-2 border-cyan-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total Rapports</p>
                        <p className="text-2xl font-bold text-cyan-600">{stats?.total_reports || 0}</p>
                    </div>
                    <div className="p-4 border-2 border-green-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Validés</p>
                        <p className="text-2xl font-bold text-green-600">{stats?.validated_reports || 0}</p>
                    </div>
                    <div className="p-4 border-2 border-amber-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">En Attente</p>
                        <p className="text-2xl font-bold text-amber-600">{stats?.pending_reports || 0}</p>
                    </div>
                </div>
            </div>

            {/* Alertes et actions rapides */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="font-bold text-amber-900 mb-3 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Alertes Système
                    </h3>
                    <ul className="space-y-2">
                        <li className="text-sm text-amber-800">• Firewall: Mise à jour disponible</li>
                        <li className="text-sm text-amber-800">• Serveur 3: Espace disque faible (15%)</li>
                        <li className="text-sm text-amber-800">• 3 licences Windows expirent dans 7 jours</li>
                    </ul>
                </div>

                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
                    <h3 className="font-bold text-cyan-900 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Actions Rapides
                    </h3>
                    <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2 bg-white hover:bg-cyan-100 rounded-lg text-sm transition-colors">
                            📊 Nouveau Rapport IT
                        </button>
                        <button className="w-full text-left px-4 py-2 bg-white hover:bg-cyan-100 rounded-lg text-sm transition-colors">
                            🎫 Voir Tous les Tickets
                        </button>
                        <button className="w-full text-left px-4 py-2 bg-white hover:bg-cyan-100 rounded-lg text-sm transition-colors">
                            🖥️ État des Systèmes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InformatiqueDashboard;
