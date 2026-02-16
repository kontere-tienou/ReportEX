import { useState } from 'react';
import {
    FileText, Plus, Search, Filter, Download, Eye, Edit2,
    Trash2, Calendar, CheckCircle, Clock, XCircle, Send
} from 'lucide-react';
import { Link } from 'react-router-dom';

const RapportsIT = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showNewModal, setShowNewModal] = useState(false);

    const reports = [
        {
            id: 1,
            title: 'Rapport Hebdomadaire IT - Semaine 7',
            type: 'Hebdomadaire',
            period: '12-16 Février 2026',
            status: 'validated',
            created_at: '2026-02-16 17:00',
            validated_at: '2026-02-16 17:30',
            validator: 'Direction',
            tickets_resolved: 12,
            incidents: 3,
            maintenance: 2
        },
        {
            id: 2,
            title: 'Rapport Incident - Panne Serveur',
            type: 'Incident',
            period: '15 Février 2026',
            status: 'pending',
            created_at: '2026-02-15 14:30',
            tickets_resolved: 0,
            incidents: 1,
            maintenance: 0
        },
        {
            id: 3,
            title: 'Rapport Maintenance Serveurs',
            type: 'Maintenance',
            period: '10 Février 2026',
            status: 'validated',
            created_at: '2026-02-10 09:00',
            validated_at: '2026-02-10 15:20',
            validator: 'Direction',
            tickets_resolved: 0,
            incidents: 0,
            maintenance: 4
        },
        {
            id: 4,
            title: 'Rapport Mensuel IT - Janvier 2026',
            type: 'Mensuel',
            period: 'Janvier 2026',
            status: 'validated',
            created_at: '2026-02-01 10:00',
            validated_at: '2026-02-01 16:45',
            validator: 'Direction',
            tickets_resolved: 45,
            incidents: 12,
            maintenance: 8
        },
    ];

    const getStatusBadge = (status) => {
        const badges = {
            validated: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Validé' },
            pending: { bg: 'bg-amber-100', text: 'text-amber-800', icon: Clock, label: 'En attente' },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rejeté' }
        };
        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3 mr-1" />
                {badge.label}
      </span>
        );
    };

    const getTypeBadge = (type) => {
        const colors = {
            'Hebdomadaire': 'bg-blue-100 text-blue-800',
            'Mensuel': 'bg-purple-100 text-purple-800',
            'Incident': 'bg-red-100 text-red-800',
            'Maintenance': 'bg-green-100 text-green-800'
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
        );
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Rapports IT</h1>
                    <p className="text-gray-600 mt-1">Gestion des rapports d'activité IT</p>
                </div>
                <Link
                    to="/departments/informatique/reports/new"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Rapport
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Rapports</p>
                            <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Validés</p>
                            <p className="text-3xl font-bold text-green-600">
                                {reports.filter(r => r.status === 'validated').length}
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">En Attente</p>
                            <p className="text-3xl font-bold text-amber-600">
                                {reports.filter(r => r.status === 'pending').length}
                            </p>
                        </div>
                        <div className="bg-amber-100 p-3 rounded-full">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Ce Mois</p>
                            <p className="text-3xl font-bold text-cyan-600">2</p>
                        </div>
                        <div className="bg-cyan-100 p-3 rounded-full">
                            <Calendar className="w-6 h-6 text-cyan-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 flex space-x-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher un rapport..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                    <option value="all">Tous statuts</option>
                    <option value="validated">Validés</option>
                    <option value="pending">En attente</option>
                    <option value="rejected">Rejetés</option>
                </select>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                </button>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {filteredReports.map((report) => (
                    <div key={report.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-lg font-bold text-gray-900">{report.title}</h3>
                                    {getTypeBadge(report.type)}
                                    {getStatusBadge(report.status)}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                      {report.period}
                  </span>
                                    <span>Créé le {report.created_at}</span>
                                    {report.validated_at && (
                                        <span className="text-green-600">Validé le {report.validated_at}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{report.tickets_resolved}</p>
                                <p className="text-xs text-gray-600">Tickets résolus</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{report.incidents}</p>
                                <p className="text-xs text-gray-600">Incidents</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{report.maintenance}</p>
                                <p className="text-xs text-gray-600">Maintenances</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            {report.validator && (
                                <span className="text-sm text-gray-600">
                  Validé par: <strong>{report.validator}</strong>
                </span>
                            )}
                            <div className="flex space-x-2">
                                <button className="px-3 py-1 text-cyan-600 hover:bg-cyan-50 rounded-lg flex items-center">
                                    <Eye className="w-4 h-4 mr-1" />
                                    Voir
                                </button>
                                <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center">
                                    <Download className="w-4 h-4 mr-1" />
                                    PDF
                                </button>
                                {report.status === 'pending' && (
                                    <>
                                        <button className="px-3 py-1 text-amber-600 hover:bg-amber-50 rounded-lg flex items-center">
                                            <Edit2 className="w-4 h-4 mr-1" />
                                            Modifier
                                        </button>
                                        <button className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg flex items-center">
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Supprimer
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredReports.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun rapport trouvé</h3>
                    <p className="text-gray-600 mb-4">Commencez par créer votre premier rapport IT</p>
                    <Link
                        to="/departments/informatique/reports/new"
                        className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nouveau Rapport
                    </Link>
                </div>
            )}
        </div>
    );
};

export default RapportsIT;