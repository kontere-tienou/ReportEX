import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/api';
import {
    FileText, TrendingUp, Clock, CheckCircle,
    XCircle, AlertCircle, BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentReports, setRecentReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Check if the user data exists
            if (!user || !user.id || !user.department || !user.department.id || !user.role) {
                console.error("Incomplete user data:", user);
                return;
            }

            // Send the data as an object
            const statsRes = await reportService.getDepartmentStats({
                userId: user.id,
                departmentId: user.department.id,
                role: user.role
            });

            setStats(statsRes.data.stats);

            const reportsRes = await reportService.getMyReports({ limit: 5 });
            setRecentReports(reportsRes.data.reports);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };



    const getStatusBadge = (status) => {
        const badges = {
            brouillon: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock },
            soumis: { bg: 'bg-blue-100', text: 'text-blue-700', icon: AlertCircle },
            valide: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            rejete: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
        };

        const badge = badges[status] || badges.brouillon;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
                <Icon className="w-4 h-4 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Graph data
    const chartData = stats ? [
        { name: 'Brouillons', value: parseInt(stats.draft_reports) },
        { name: 'Soumis', value: parseInt(stats.pending_reports) },
        { name: 'Validés', value: parseInt(stats.validated_reports) },
        { name: 'Rejetés', value: parseInt(stats.rejected_reports) },
    ] : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-6 shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Bienvenue, {user.full_name}</h1>
                <p className="text-primary-100">{user.department.name} - {user.role}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Total Rapports</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.total_reports || 0}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="card border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Validés</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.validated_reports || 0}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="card border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">En attente</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.pending_reports || 0}</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="card border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Rejetés</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.rejected_reports || 0}</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Graph */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
                    Répartition des rapports
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Recent Reports */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary-600" />
                    Rapports récents
                </h2>
                <div className="space-y-3">
                    {recentReports.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucun rapport pour le moment</p>
                    ) : (
                        recentReports.map((report) => (
                            <div key={report.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-900">{report.template_name}</h3>
                                    {getStatusBadge(report.status)}
                                </div>
                                <p className="text-sm text-gray-600">
                                    Période: {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Créé le {new Date(report.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
