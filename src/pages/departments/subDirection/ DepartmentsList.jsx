import { useState } from 'react';
import {
    Building2, Users, TrendingUp, FileText, Search,
    ChevronRight, BarChart3, CheckCircle, AlertCircle
} from 'lucide-react';

const DepartmentsList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const departments = [
        {
            id: 1,
            name: 'Comptabilité',
            code: 'COMPTA',
            icon: '💰',
            color: '#10b981',
            responsable: 'Fatima KONE',
            employees: 5,
            rapports: {
                total: 12,
                valides: 11,
                enAttente: 1,
                taux: 92
            },
            status: 'excellent',
            lastActivity: '2h ago'
        },
        {
            id: 2,
            name: 'Bureau d\'Étude & Développement',
            code: 'BED',
            icon: '🔬',
            color: '#8b5cf6',
            responsable: 'Amadou DIALLO',
            employees: 8,
            rapports: {
                total: 7,
                valides: 5,
                enAttente: 1,
                taux: 71
            },
            status: 'attention',
            lastActivity: '1 jour ago'
        },
        {
            id: 3,
            name: 'Maintenance',
            code: 'MAINT',
            icon: '🔧',
            color: '#f59e0b',
            responsable: 'Mamadou TRAORE',
            employees: 12,
            rapports: {
                total: 15,
                valides: 14,
                enAttente: 1,
                taux: 93
            },
            status: 'excellent',
            lastActivity: '30min ago'
        },
        {
            id: 4,
            name: 'Filature',
            code: 'FILAT',
            icon: '🧵',
            color: '#6366f1',
            responsable: 'Aissata SANGARE',
            employees: 25,
            rapports: {
                total: 13,
                valides: 12,
                enAttente: 1,
                taux: 92
            },
            status: 'excellent',
            lastActivity: '1h ago'
        },
        {
            id: 5,
            name: 'Impression',
            code: 'IMPR',
            icon: '🎨',
            color: '#ec4899',
            responsable: 'Ousmane TOURE',
            employees: 18,
            rapports: {
                total: 10,
                valides: 9,
                enAttente: 1,
                taux: 90
            },
            status: 'bon',
            lastActivity: '3h ago'
        },
        {
            id: 6,
            name: 'Stock',
            code: 'STOCK',
            icon: '📦',
            color: '#14b8a6',
            responsable: 'Mariam CISSE',
            employees: 8,
            rapports: {
                total: 11,
                valides: 10,
                enAttente: 1,
                taux: 91
            },
            status: 'excellent',
            lastActivity: '45min ago'
        },
        {
            id: 7,
            name: 'Achats',
            code: 'ACHAT',
            icon: '🛒',
            color: '#f97316',
            responsable: 'Ibrahim KEITA',
            employees: 6,
            rapports: {
                total: 9,
                valides: 8,
                enAttente: 1,
                taux: 89
            },
            status: 'bon',
            lastActivity: '2h ago'
        },
        {
            id: 8,
            name: 'Commercial',
            code: 'COMM',
            icon: '💼',
            color: '#3b82f6',
            responsable: 'Salif COULIBALY',
            employees: 15,
            rapports: {
                total: 14,
                valides: 12,
                enAttente: 2,
                taux: 86
            },
            status: 'bon',
            lastActivity: '4h ago'
        },
        {
            id: 9,
            name: 'Informatique',
            code: 'IT',
            icon: '💻',
            color: '#06b6d4',
            responsable: 'Sekou DIARRA',
            employees: 4,
            rapports: {
                total: 8,
                valides: 7,
                enAttente: 1,
                taux: 88
            },
            status: 'bon',
            lastActivity: '1h ago'
        },
        {
            id: 10,
            name: 'Ressources Humaines',
            code: 'RH',
            icon: '👥',
            color: '#ef4444',
            responsable: 'Aminata BA',
            employees: 5,
            rapports: {
                total: 10,
                valides: 10,
                enAttente: 0,
                taux: 100
            },
            status: 'excellent',
            lastActivity: '15min ago'
        },
    ];

    const filteredDepartments = departments.filter(dept => {
        const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.code.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterStatus === 'all') return matchesSearch;
        return matchesSearch && dept.status === filterStatus;
    });

    const getStatusBadge = (status) => {
        const badges = {
            excellent: { bg: 'bg-green-100', text: 'text-green-800', label: 'Excellent', icon: CheckCircle },
            bon: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Bon', icon: BarChart3 },
            attention: { bg: 'bg-red-100', text: 'text-red-800', label: 'Attention', icon: AlertCircle }
        };
        const badge = badges[status] || badges.bon;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3 mr-1" />
                {badge.label}
      </span>
        );
    };

    const totalStats = {
        departments: departments.length,
        employees: departments.reduce((sum, d) => sum + d.employees, 0),
        avgTaux: Math.round(departments.reduce((sum, d) => sum + d.rapports.taux, 0) / departments.length),
        totalReports: departments.reduce((sum, d) => sum + d.rapports.total, 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Départements</h1>
                <p className="text-gray-600 mt-1">Vue d'ensemble et détails de tous les départements</p>
            </div>

            {/* Stats Globales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Départements</p>
                            <p className="text-3xl font-bold text-gray-900">{totalStats.departments}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Employés Total</p>
                            <p className="text-3xl font-bold text-gray-900">{totalStats.employees}</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Taux Moyen</p>
                            <p className="text-3xl font-bold text-gray-900">{totalStats.avgTaux}%</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Rapports Total</p>
                            <p className="text-3xl font-bold text-gray-900">{totalStats.totalReports}</p>
                        </div>
                        <div className="bg-amber-100 p-3 rounded-full">
                            <FileText className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres et Recherche */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    {/* Recherche */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher un département..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filtres Status */}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Tous
                        </button>
                        <button
                            onClick={() => setFilterStatus('excellent')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filterStatus === 'excellent' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Excellent
                        </button>
                        <button
                            onClick={() => setFilterStatus('bon')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filterStatus === 'bon' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Bon
                        </button>
                        <button
                            onClick={() => setFilterStatus('attention')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filterStatus === 'attention' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Attention
                        </button>
                    </div>
                </div>
            </div>

            {/* Liste des Départements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredDepartments.map((dept) => (
                    <div
                        key={dept.id}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                    >
                        <div className="p-6">
                            {/* Header Département */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                                        style={{ backgroundColor: `${dept.color}20` }}
                                    >
                                        {dept.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{dept.name}</h3>
                                        <p className="text-sm text-gray-500">{dept.code}</p>
                                    </div>
                                </div>
                                {getStatusBadge(dept.status)}
                            </div>

                            {/* Responsable */}
                            <div className="flex items-center space-x-2 mb-4">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                  <strong>{dept.responsable}</strong> · {dept.employees} employés
                </span>
                            </div>

                            {/* Stats Rapports */}
                            <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{dept.rapports.total}</p>
                                    <p className="text-xs text-gray-600">Total</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{dept.rapports.valides}</p>
                                    <p className="text-xs text-gray-600">Validés</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-amber-600">{dept.rapports.enAttente}</p>
                                    <p className="text-xs text-gray-600">En attente</p>
                                </div>
                            </div>

                            {/* Barre de progression */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">Taux de validation</span>
                                    <span className="text-sm font-bold" style={{ color: dept.color }}>{dept.rapports.taux}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${dept.rapports.taux}%`, backgroundColor: dept.color }}
                                    ></div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  Dernière activité: {dept.lastActivity}
                </span>
                                <button className="text-sm font-medium flex items-center hover:underline" style={{ color: dept.color }}>
                                    Voir détails
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message si aucun résultat */}
            {filteredDepartments.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun département trouvé</h3>
                    <p className="text-gray-600">Essayez de modifier vos filtres de recherche</p>
                </div>
            )}
        </div>
    );
};

export default DepartmentsList;