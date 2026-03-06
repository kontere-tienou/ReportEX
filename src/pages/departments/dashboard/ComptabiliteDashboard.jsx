import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import {
    DollarSign, TrendingUp, TrendingDown, PieChart, FileText, Calculator
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {reportService} from "../reports/services/reportApi.js";

const ComptabiliteDashboard = () => {
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
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>;
    }

    const budgetData = [
        { mois: 'Jan', depenses: 0, budget: 0 },
        { mois: 'Fev', depenses: 0, budget: 0 },
        { mois: 'Mar', depenses: 0, budget: 0 },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center space-x-3">
                    <DollarSign className="w-10 h-10" />
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard Comptabilité</h1>
                        <p className="text-green-100">Gestion Financière & Budget</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Chiffre d'Affaires</p>
                            <p className="text-3xl font-bold text-gray-900">0</p>
                            <p className="text-xs text-green-600 mt-1">+0% ce mois</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Dépenses</p>
                            <p className="text-3xl font-bold text-gray-900">0K</p>
                            <p className="text-xs text-gray-500 mt-1">0% du budget</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Calculator className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Factures en Attente</p>
                            <p className="text-3xl font-bold text-gray-900">0</p>
                            <p className="text-xs text-amber-600 mt-1">À traiter</p>
                        </div>
                        <div className="bg-amber-100 p-3 rounded-full">
                            <FileText className="w-8 h-8 text-amber-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Taux Rentabilité</p>
                            <p className="text-3xl font-bold text-gray-900">0%</p>
                            <p className="text-xs text-purple-600 mt-1">Excellent</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <PieChart className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                        Budget vs Dépenses
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={budgetData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mois" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="budget" fill="#10b981" name="Budget" />
                            <Bar dataKey="depenses" fill="#3b82f6" name="Dépenses" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Rapports Comptables</h2>
                    <div className="grid grid-cols- gap-4">
                        <div className="p-4 border-2 border-green-200 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Rapports</p>
                            <p className="text-2xl font-bold text-green-600">{stats?.total_reports || 0}</p>
                        </div>
                        <div className="p-4 border-2 border-blue-200 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Validés</p>
                            <p className="text-2xl font-bold text-blue-600">{stats?.validated_reports || 0}</p>
                        </div>
                        <div className="p-4 border-2 border-amber-200 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">En Attente</p>
                            <p className="text-2xl font-bold text-amber-600">{stats?.pending_reports || 0}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ComptabiliteDashboard;