import { useState } from 'react';
import {
    Plus, Search, Filter, Clock, CheckCircle, XCircle,
    AlertCircle, User, Calendar, MessageSquare, Tag
} from 'lucide-react';

const TicketsIT = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [showNewTicket, setShowNewTicket] = useState(false);

    const tickets = [
        {
            id: 'TICK-001',
            title: 'Problème connexion réseau - Atelier A',
            description: 'Plusieurs postes ne peuvent plus accéder au réseau depuis ce matin',
            status: 'urgent',
            priority: 'high',
            category: 'Réseau',
            requestedBy: 'Mamadou TRAORE',
            department: 'Maintenance',
            createdAt: '2026-02-15 08:30',
            assignedTo: 'Sekou DIARRA',
            comments: 3,
            timeSpent: '45min'
        },
        {
            id: 'TICK-002',
            title: 'Imprimante bureau RH ne fonctionne plus',
            description: 'Message d\'erreur "Bourrage papier" mais pas de papier coincé',
            status: 'in-progress',
            priority: 'medium',
            category: 'Matériel',
            requestedBy: 'Aminata BA',
            department: 'RH',
            createdAt: '2026-02-15 09:15',
            assignedTo: 'Sekou DIARRA',
            comments: 2,
            timeSpent: '20min'
        },
        {
            id: 'TICK-003',
            title: 'Demande création compte utilisateur',
            description: 'Nouvel employé - besoin accès email et système',
            status: 'open',
            priority: 'medium',
            category: 'Compte',
            requestedBy: 'Fatima KONE',
            department: 'Comptabilité',
            createdAt: '2026-02-15 10:00',
            assignedTo: null,
            comments: 0,
            timeSpent: '0min'
        },
        {
            id: 'TICK-004',
            title: 'Mise à jour logiciel comptabilité',
            description: 'Installation nouvelle version sur 5 postes',
            status: 'resolved',
            priority: 'low',
            category: 'Logiciel',
            requestedBy: 'Fatima KONE',
            department: 'Comptabilité',
            createdAt: '2026-02-14 14:30',
            resolvedAt: '2026-02-14 16:45',
            assignedTo: 'Sekou DIARRA',
            comments: 5,
            timeSpent: '2h15min'
        },
        {
            id: 'TICK-005',
            title: 'Sauvegarde serveur échouée',
            description: 'La sauvegarde automatique de 3h00 a échoué',
            status: 'urgent',
            priority: 'critical',
            category: 'Serveur',
            requestedBy: 'Système',
            department: 'IT',
            createdAt: '2026-02-15 03:05',
            assignedTo: 'Sekou DIARRA',
            comments: 1,
            timeSpent: '1h30min'
        },
        {
            id: 'TICK-006',
            title: 'Lenteur application gestion stock',
            description: 'L\'application met plus de 5 secondes à charger',
            status: 'in-progress',
            priority: 'medium',
            category: 'Performance',
            requestedBy: 'Mariam CISSE',
            department: 'Stock',
            createdAt: '2026-02-14 16:20',
            assignedTo: 'Sekou DIARRA',
            comments: 4,
            timeSpent: '1h'
        },
    ];

    const getStatusBadge = (status) => {
        const badges = {
            urgent: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle, label: 'Urgent' },
            'in-progress': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: 'En cours' },
            open: { bg: 'bg-amber-100', text: 'text-amber-800', icon: AlertCircle, label: 'Ouvert' },
            resolved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Résolu' },
            closed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle, label: 'Fermé' }
        };
        const badge = badges[status] || badges.open;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3 mr-1" />
                {badge.label}
      </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            critical: { bg: 'bg-red-600', text: 'text-white', label: 'Critique' },
            high: { bg: 'bg-orange-500', text: 'text-white', label: 'Haute' },
            medium: { bg: 'bg-yellow-500', text: 'text-white', label: 'Moyenne' },
            low: { bg: 'bg-green-500', text: 'text-white', label: 'Basse' }
        };
        const badge = badges[priority] || badges.medium;
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
        );
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const stats = {
        total: tickets.length,
        urgent: tickets.filter(t => t.status === 'urgent').length,
        inProgress: tickets.filter(t => t.status === 'in-progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestion des Tickets IT</h1>
                    <p className="text-gray-600 mt-1">Support technique et maintenance informatique</p>
                </div>
                <button
                    onClick={() => setShowNewTicket(true)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nouveau Ticket
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Tickets</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <AlertCircle className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Urgents</p>
                            <p className="text-3xl font-bold text-red-600">{stats.urgent}</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">En Cours</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Résolus</p>
                            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres et Recherche */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                    {/* Recherche */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher par titre, ID ou demandeur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filtre Status */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="urgent">Urgent</option>
                        <option value="open">Ouvert</option>
                        <option value="in-progress">En cours</option>
                        <option value="resolved">Résolu</option>
                    </select>

                    {/* Filtre Priorité */}
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="all">Toutes priorités</option>
                        <option value="critical">Critique</option>
                        <option value="high">Haute</option>
                        <option value="medium">Moyenne</option>
                        <option value="low">Basse</option>
                    </select>
                </div>
            </div>

            {/* Liste des Tickets */}
            <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                    >
                        <div className="p-6">
                            {/* Header Ticket */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className="text-sm font-mono text-gray-500">{ticket.id}</span>
                                        {getStatusBadge(ticket.status)}
                                        {getPriorityBadge(ticket.priority)}
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                      {ticket.category}
                    </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{ticket.title}</h3>
                                    <p className="text-sm text-gray-600">{ticket.description}</p>
                                </div>
                            </div>

                            {/* Infos Ticket */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <User className="w-4 h-4 mr-2" />
                                    <div>
                                        <p className="text-xs text-gray-500">Demandeur</p>
                                        <p className="font-medium">{ticket.requestedBy}</p>
                                        <p className="text-xs">{ticket.department}</p>
                                    </div>
                                </div>

                                <div className="flex items-center text-gray-600">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <div>
                                        <p className="text-xs text-gray-500">Créé le</p>
                                        <p className="font-medium">{ticket.createdAt}</p>
                                    </div>
                                </div>

                                <div className="flex items-center text-gray-600">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <div>
                                        <p className="text-xs text-gray-500">Temps passé</p>
                                        <p className="font-medium">{ticket.timeSpent}</p>
                                    </div>
                                </div>

                                <div className="flex items-center text-gray-600">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    <div>
                                        <p className="text-xs text-gray-500">Commentaires</p>
                                        <p className="font-medium">{ticket.comments}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                                {ticket.assignedTo ? (
                                    <span className="text-sm text-gray-600">
                    Assigné à: <strong className="text-cyan-600">{ticket.assignedTo}</strong>
                  </span>
                                ) : (
                                    <span className="text-sm text-amber-600 font-medium">
                    Non assigné
                  </span>
                                )}
                                <button className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
                                    Voir détails →
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message si aucun résultat */}
            {filteredTickets.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun ticket trouvé</h3>
                    <p className="text-gray-600">Essayez de modifier vos filtres de recherche</p>
                </div>
            )}
        </div>
    );
};

export default TicketsIT;