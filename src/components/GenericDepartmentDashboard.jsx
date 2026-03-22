import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from "../context/AuthContext.jsx";
import { reportService } from "../services/reportApi.js";

// Composant générique de dashboard qui s'adapte à chaque département
const GenericDepartmentDashboard = ({
                                        departmentName,
                                        departmentIcon: Icon,
                                        departmentColor,
                                        metrics = [],
                                        description = ''
                                    }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, [user?.department_id]);

    const loadDashboardData = async () => {
        if (!user?.department_id) {
            console.warn('No department_id found for user:', user);
            setLoading(false);
            return;
        }

        try {
            const statsRes = await reportService.getDepartmentStats(user.department_id);
            const statsData = statsRes.data?.stats || statsRes.data?.data?.stats || {};

            setStats(statsData);
        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
            setStats({
                total_reports: 0,
                validated_reports: 0,
                pending_reports: 0,
                draft_reports: 0,
                rejected_reports: 0,
                validation_rate: 0,
                rejection_rate: 0
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }


    if (!stats) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-gray-600">Aucune donnée disponible</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div
                className="text-white rounded-lg p-6 shadow-lg"
                style={{ background: `linear-gradient(to right, ${departmentColor}, ${departmentColor}dd)` }}
            >
                <div className="flex items-center space-x-3">
                    {Icon && <Icon className="w-10 h-10" />}
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard {departmentName}</h1>
                        <p className="opacity-90">{description}</p>
                    </div>
                </div>
            </div>

            {/* KPIs personnalisés */}
            {metrics && metrics.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((metric, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow p-6"
                            style={{ borderLeft: `4px solid ${metric.color}` }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm mb-1">{metric.label}</p>
                                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                                    {metric.subtext && (
                                        <p className="text-xs text-gray-500 mt-1">{metric.subtext}</p>
                                    )}
                                </div>
                                <div
                                    className="p-3 rounded-full"
                                    style={{ backgroundColor: `${metric.color}20` }}
                                >
                                    {metric.icon && (
                                        <metric.icon
                                            className="w-8 h-8"
                                            style={{ color: metric.color }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Rapports du département */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Mes Rapports - {departmentName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                        className="p-4 border-2 rounded-lg"
                        style={{ borderColor: `${departmentColor}40` }}
                    >
                        <p className="text-sm text-gray-600 mb-1">Total Rapports</p>
                        <p
                            className="text-2xl font-bold"
                            style={{ color: departmentColor }}
                        >
                            {parseInt(stats?.total_reports) || 0}
                        </p>
                    </div>
                    <div className="p-4 border-2 border-green-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Validés</p>
                        <p className="text-2xl font-bold text-green-600">
                            {parseInt(stats?.validated_reports) || 0}
                        </p>
                    </div>
                    <div className="p-4 border-2 border-amber-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">En Attente</p>
                        <p className="text-2xl font-bold text-amber-600">
                            {parseInt(stats?.pending_reports) || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Graphique de tendance */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Évolution des Rapports
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                        { name: 'Brouillons', value: parseInt(stats?.draft_reports) || 0 },
                        { name: 'Soumis', value: parseInt(stats?.pending_reports) || 0 },
                        { name: 'Validés', value: parseInt(stats?.validated_reports) || 0 },
                        { name: 'Rejetés', value: parseInt(stats?.rejected_reports) || 0 },
                    ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill={departmentColor} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Actions rapides */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div
                    className="border rounded-lg p-6"
                    style={{
                        backgroundColor: `${departmentColor}10`,
                        borderColor: `${departmentColor}40`
                    }}
                >
                    <h3
                        className="font-bold mb-3"
                        style={{ color: departmentColor }}
                    >
                        📊 Actions Rapides
                    </h3>
                    <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2 bg-white hover:shadow-md rounded-lg text-sm transition-all">
                            Nouveau Rapport
                        </button>
                        <button className="w-full text-left px-4 py-2 bg-white hover:shadow-md rounded-lg text-sm transition-all">
                            Voir Mes Rapports
                        </button>
                        <button className="w-full text-left px-4 py-2 bg-white hover:shadow-md rounded-lg text-sm transition-all">
                            Statistiques Détaillées
                        </button>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-blue-900 mb-3">
                        💡 Informations
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li>• Taux de validation: {parseInt(stats?.validation_rate) || 0}%</li>
                        <li>• Taux de rejet: {parseInt(stats?.rejection_rate) || 0}%</li>
                        <li>• Total rapports ce mois: {parseInt(stats?.total_reports) || 0}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GenericDepartmentDashboard;