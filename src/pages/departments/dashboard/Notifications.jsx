import { useState } from 'react';
import {
    Bell, AlertCircle, CheckCircle, Info, Trash2,
    Check, Search, Settings, Mail, Eye
} from 'lucide-react';

const Notifications = () => {
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const notifications = [
        {
            id: 1,
            type: 'ticket',
            severity: 'urgent',
            title: 'Nouveau ticket urgent',
            message: 'TICK-005 - Sauvegarde serveur échouée',
            from: 'Système',
            timestamp: '2026-02-16 14:30',
            read: false,
            action_url: '/departments/informatique/tickets'
        },
        {
            id: 2,
            type: 'alert',
            severity: 'warning',
            title: 'Alerte système',
            message: 'CPU Firewall > 75% depuis 30 minutes',
            from: 'Monitoring',
            timestamp: '2026-02-16 14:15',
            read: false,
            action_url: '/departments/informatique/systems'
        },
        {
            id: 3,
            type: 'user',
            severity: 'info',
            title: 'Nouvelle demande utilisateur',
            message: 'Fatima KONE a demandé la création d\'un compte',
            from: 'RH',
            timestamp: '2026-02-16 13:45',
            read: false,
            action_url: '/departments/informatique/admin'
        },
        {
            id: 4,
            type: 'report',
            severity: 'info',
            title: 'Rapport 200000000000000000002validé',
            message: 'Votre rapport hebdomadaire IT a été validé',
            from: 'Direction',
            timestamp: '2026-02-16 11:20',
            read: true,
            action_url: '/departments/informatique/reports'
        },
        {
            id: 5,
            type: 'system',
            severity: 'success',
            title: 'Backup complété',
            message: 'Sauvegarde automatique terminée avec succès',
            from: 'Système',
            timestamp: '2026-02-16 03:00',
            read: true,
            action_url: '/departments/informatique/admin'
        },
    ];

    const getTypeIcon = (type) => {
        const icons = {
            ticket: AlertCircle,
            alert: AlertCircle,
            user: Settings,
            report: CheckCircle,
            system: Info
        };
        const Icon = icons[type] || Bell;
        return <Icon className="w-5 h-5" />;
    };

    const getSeverityColor = (severity) => {
        const colors = {
            urgent: 'bg-red-100 text-red-800 border-red-200',
            warning: 'bg-amber-100 text-amber-800 border-amber-200',
            info: 'bg-blue-100 text-blue-800 border-blue-200',
            success: 'bg-green-100 text-green-800 border-green-200'
        };
        return colors[severity] || colors.info;
    };

    const filteredNotifications = notifications.filter(notif => {
        const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notif.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || notif.type === filterType;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'unread' && !notif.read) ||
            (filterStatus === 'read' && notif.read);

        return matchesSearch && matchesType && matchesStatus;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Centre de Notifications</h1>
                    <p className="text-gray-600 mt-1">
                        {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                    </p>
                </div>
                <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center">
                    <Check className="w-4 h-4 mr-2" />
                    Tout marquer comme lu
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total</p>
                            <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Bell className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Non lues</p>
                            <p className="text-3xl font-bold text-amber-600">{unreadCount}</p>
                        </div>
                        <div className="bg-amber-100 p-3 rounded-full">
                            <Mail className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Alertes</p>
                            <p className="text-3xl font-bold text-red-600">
                                {notifications.filter(n => n.severity === 'urgent' || n.severity === 'warning').length}
                            </p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Aujourd'hui</p>
                            <p className="text-3xl font-bold text-cyan-600">
                                {notifications.filter(n => n.timestamp.includes('2026-02-16')).length}
                            </p>
                        </div>
                        <div className="bg-cyan-100 p-3 rounded-full">
                            <CheckCircle className="w-6 h-6 text-cyan-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="all">Tous types</option>
                        <option value="ticket">Tickets</option>
                        <option value="alert">Alertes</option>
                        <option value="user">Utilisateurs</option>
                        <option value="report">Rapports</option>
                        <option value="system">Système</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="all">Tous statuts</option>
                        <option value="unread">Non lues</option>
                        <option value="read">Lues</option>
                    </select>
                </div>
            </div>

            {/* Liste Notifications */}
            <div className="space-y-3">
                {filteredNotifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
                            !notif.read ? 'border-l-4 border-cyan-500' : ''
                        }`}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4 flex-1">
                                    <div className={`p-3 rounded-lg ${getSeverityColor(notif.severity)}`}>
                                        {getTypeIcon(notif.type)}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h3 className={`text-lg font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {notif.title}
                                            </h3>
                                            {!notif.read && (
                                                <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 text-xs rounded-full font-medium">
                          Nouveau
                        </span>
                                            )}
                                        </div>

                                        <p className="text-gray-600 mb-2">{notif.message}</p>

                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span>De: <strong>{notif.from}</strong></span>
                                            <span>•</span>
                                            <span>{notif.timestamp}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                    {!notif.read && (
                                        <button className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg" title="Marquer comme lu">
                                            <Check className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Voir">
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Supprimer">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredNotifications.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune notification</h3>
                    <p className="text-gray-600">Aucune notification correspondant à ces filtres</p>
                </div>
            )}
        </div>
    );
};

export default Notifications;