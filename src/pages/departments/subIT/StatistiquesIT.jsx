import { useState } from 'react';
import { BarChart3, TrendingUp, Activity, Download, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatistiquesIT = () => {
    const [timeRange, setTimeRange] = useState('month');

    const ticketsStats = [
        { mois: 'Sep', ouverts: 45, resolus: 42, temps_moyen: 2.1 },
        { mois: 'Oct', ouverts: 52, resolus: 49, temps_moyen: 1.9 },
        { mois: 'Nov', ouverts: 48, resolus: 46, temps_moyen: 2.3 },
        { mois: 'Déc', ouverts: 39, resolus: 38, temps_moyen: 1.8 },
        { mois: 'Jan', ouverts: 56, resolus: 53, temps_moyen: 2.0 },
        { mois: 'Fév', ouverts: 43, resolus: 41, temps_moyen: 1.7 },
    ];

    const categoriesData = [
        { name: 'Réseau', value: 28, color: '#3b82f6' },
        { name: 'Matériel', value: 35, color: '#10b981' },
        { name: 'Logiciel', value: 22, color: '#f59e0b' },
        { name: 'Compte', value: 12, color: '#8b5cf6' },
        { name: 'Autre', value: 8, color: '#6b7280' },
    ];

    const systemsUptime = [
        { jour: 'Lun', uptime: 99.9 },
        { jour: 'Mar', uptime: 99.7 },
        { jour: 'Mer', uptime: 100 },
        { jour: 'Jeu', uptime: 98.5 },
        { jour: 'Ven', uptime: 99.8 },
        { jour: 'Sam', uptime: 100 },
        { jour: 'Dim', uptime: 99.9 },
    ];

    const interventionsData = [
        { type: 'Préventive', count: 45 },
        { type: 'Corrective', count: 62 },
        { type: 'Urgente', count: 18 },
        { type: 'Planifiée', count: 33 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Statistiques IT</h1>
                    <p className="text-gray-600 mt-1">Analyse des performances et activités</p>
                </div>
                <div className="flex space-x-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="week">Semaine</option>
                        <option value="month">Mois</option>
                        <option value="quarter">Trimestre</option>
                        <option value="year">Année</option>
                    </select>
                    <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 mb-1">Tickets Traités</p>
                    <p className="text-3xl font-bold text-cyan-600">283</p>
                    <p className="text-xs text-green-600 mt-1">+12% vs mois dernier</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 mb-1">Temps Résolution</p>
                    <p className="text-3xl font-bold text-green-600">1.9h</p>
                    <p className="text-xs text-green-600 mt-1">-15% vs mois dernier</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 mb-1">Uptime Moyen</p>
                    <p className="text-3xl font-bold text-blue-600">99.6%</p>
                    <p className="text-xs text-gray-500 mt-1">Excellent</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 mb-1">Satisfaction</p>
                    <p className="text-3xl font-bold text-purple-600">4.7/5</p>
                    <p className="text-xs text-purple-600 mt-1">+0.3 vs mois dernier</p>
                </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Évolution Tickets (6 mois)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={ticketsStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mois" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="ouverts" stroke="#06b6d4" name="Ouverts" strokeWidth={2} />
                            <Line type="monotone" dataKey="resolus" stroke="#10b981" name="Résolus" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Tickets par Catégorie</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoriesData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={100}
                                dataKey="value"
                            >
                                {categoriesData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Uptime Systèmes (7 jours)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={systemsUptime}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="jour" />
                            <YAxis domain={[95, 100]} />
                            <Tooltip />
                            <Bar dataKey="uptime" fill="#10b981" name="Uptime %" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Interventions par Type</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={interventionsData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="type" type="category" />
                            <Tooltip />
                            <Bar dataKey="count" fill="#06b6d4" name="Nombre" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table détails */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Mensuelle Détaillée</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mois</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tickets Ouverts</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Résolus</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taux Résolution</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temps Moyen</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {ticketsStats.map((stat, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{stat.mois}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{stat.ouverts}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-green-600">{stat.resolus}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {((stat.resolus / stat.ouverts) * 100).toFixed(1)}%
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{stat.temps_moyen}h</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StatistiquesIT;