import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/api';
import {
    Plus, FileText, Calendar, Filter,
    CheckCircle, XCircle, Clock, AlertCircle, Eye
} from 'lucide-react';

const Reports = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadReports();
    }, [filter]);

    const loadReports = async () => {
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await reportService.getMyReports(params);
            setReports(response.data.reports);
        } catch (error) {
            console.error('Erreur chargement rapports:', error);
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

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mes Rapports</h1>
                    <p className="text-gray-600 mt-1">
                        Gérez et consultez tous vos rapports
                    </p>
                </div>
                <button
                    onClick={() => navigate('/reports/new')}
                    className="btn-primary flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nouveau Rapport
                </button>
            </div>

            {/* Filtres */}
            <div className="card">
                <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filtrer par statut:</span>
                    <div className="flex space-x-2">
                        {[
                            { value: 'all', label: 'Tous' },
                            { value: 'brouillon', label: 'Brouillons' },
                            { value: 'soumis', label: 'Soumis' },
                            { value: 'valide', label: 'Validés' },
                            { value: 'rejete', label: 'Rejetés' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setFilter(option.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filter === option.value
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Liste des rapports */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : reports.length === 0 ? (
                <div className="card text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Aucun rapport trouvé
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Commencez par créer votre premier rapport
                    </p>
                    <button
                        onClick={() => navigate('/reports/new')}
                        className="btn-primary inline-flex items-center"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Créer un rapport
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="card hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigate(`/reports/${report.id}`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {report.template_name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)}
                                    </p>
                                </div>
                                {getStatusBadge(report.status)}
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Période: {new Date(report.period_start).toLocaleDateString()}
                                    {' - '}
                                    {new Date(report.period_end).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Créé le {new Date(report.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            {report.status === 'rejete' && report.rejection_reason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-red-700">
                                        <strong>Raison du rejet:</strong> {report.rejection_reason}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                                    <Eye className="w-4 h-4 mr-1" />
                                    Voir les détails
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reports;