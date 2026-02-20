import {useEffect, useState} from 'react';
import {
    Users, Building2, Settings, Shield, Plus, Edit2, Trash2,
    Search, Key, UserCheck, UserX, RefreshCw, Download, Upload,
    AlertCircle, CheckCircle, Eye, EyeOff
} from 'lucide-react';
import {adminService} from "../../../services/api.js";

const SystemAdmin = () => {
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [activeTab, setActiveTab] = useState("users");
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    //const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);




    useEffect(() => {
        fetchData();
    },
        []);
    const fetchData = async () => {
        try {
            setLoading(true);

            const [usersRes, deptRes] = await Promise.all([
                adminService.getUsers(),
                adminService.getDepartments(),
            ]);

            setUsers(usersRes.data.users || []);
            setDepartments(deptRes.data.departments || []);
        } catch (err) {
            console.error("Erreur chargement admin:",users.name, err);
        } finally {
            setLoading(false);
        }
    };
    const toggleUser = async (id) => {
        try {
            await adminService.toggleUserStatus(id);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Supprimer cet utilisateur ?")) return;

        try {
            await adminService.deleteUser(id);
            await fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    // ===============================
    // HELPERS
    // ===============================

    const getRoleBadge = (role) => {
        const badges = {
            admin: "bg-purple-100 text-purple-800",
            Director: "bg-blue-100 text-blue-800",
            responsable: "bg-green-100 text-green-800",
        };
    }


    // Données départements
    const departments = [
        { id: 1, name: 'Comptabilité', code: 'COMPTA', responsible: 'Fatima KONE', users_count: 5, active: true },
        { id: 2, name: 'Bureau d\'Étude', code: 'BED', responsible: 'Amadou DIALLO', users_count: 8, active: true },
        { id: 3, name: 'Maintenance', code: 'MAINT', responsible: 'Mamadou TRAORE', users_count: 12, active: true },
        { id: 4, name: 'Filature', code: 'FILAT', responsible: 'Aissata SANGARE', users_count: 25, active: true },
        { id: 5, name: 'Impression', code: 'IMPR', responsible: 'Ousmane TOURE', users_count: 18, active: true },
        { id: 6, name: 'Stock', code: 'STOCK', responsible: 'Mariam CISSE', users_count: 8, active: true },
        { id: 7, name: 'Achats', code: 'ACHAT', responsible: 'Ibrahim KEITA', users_count: 6, active: true },
        { id: 8, name: 'Commercial', code: 'COMM', responsible: 'Salif COULIBALY', users_count: 15, active: true },
        { id: 9, name: 'Informatique', code: 'IT', responsible: 'Sekou DIARRA', users_count: 4, active: true },
        { id: 10, name: 'RH', code: 'RH', responsible: 'Aminata BA', users_count: 5, active: true },
        { id: 11, name: 'Direction', code: 'DIR', responsible: 'Directeur Général', users_count: 2, active: true },
    ];



    const getStatusBadge = (status) => {
        return status === 'active' ? (
            <span className="flex items-center text-green-600 text-sm">
        <CheckCircle className="w-4 h-4 mr-1" />
        Actif
      </span>
        ) : (
            <span className="flex items-center text-gray-500 text-sm">
        <UserX className="w-4 h-4 mr-1" />
        Inactif
      </span>
        );
    };

    const filteredUsers = users.filter(
        user =>
            user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.is_active).length,
        admins: users.filter((u) => u.role === "admin").length,
        departments: departments.length,
    };
        if (loading) {
            return <div className="p-6">Chargement...</div>;
        }


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Administration Système</h1>
                    <p className="text-gray-600 mt-1">Gestion des utilisateurs, départements et configuration</p>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Utilisateurs</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Actifs</p>
                            <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <UserCheck className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Administrateurs</p>
                            <p className="text-3xl font-bold text-purple-600">{stats.admins}</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <Shield className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Départements</p>
                            <p className="text-3xl font-bold text-cyan-600">{stats.departments}</p>
                        </div>
                        <div className="bg-cyan-100 p-3 rounded-full">
                            <Building2 className="w-6 h-6 text-cyan-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <div className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'users'
                                    ? 'border-cyan-600 text-cyan-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Users className="w-4 h-4 inline mr-2" />
                            Utilisateurs
                        </button>
                        <button
                            onClick={() => setActiveTab('departments')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'departments'
                                    ? 'border-cyan-600 text-cyan-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Building2 className="w-4 h-4 inline mr-2" />
                            Départements
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'settings'
                                    ? 'border-cyan-600 text-cyan-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Settings className="w-4 h-4 inline mr-2" />
                            Configuration
                        </button>
                    </div>
                </div>
            </div>

            {/* Gestion Utilisateurs */}
            {activeTab === 'users' && (
                <div className="space-y-4">
                    {/* Barre d'actions */}
                    <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Rechercher un utilisateur..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <button
                            onClick={() => setShowUserModal(true)}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center ml-4"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nouvel Utilisateur
                        </button>
                    </div>

                    {/* Table Utilisateurs */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière Connexion</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="font-medium text-gray-900">{user.full_name}</div>
                                            <div className="text-sm text-gray-500">@{user.username}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.department.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(user.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.last_login}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="text-cyan-600 hover:text-cyan-900"
                                                title="Modifier"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="text-amber-600 hover:text-amber-900"
                                                title="Réinitialiser mot de passe"
                                            >
                                                <Key className="w-4 h-4" />
                                            </button>
                                            {user.status === 'active' ? (
                                                <button
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Désactiver"
                                                >
                                                    <UserX className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Activer"
                                                >
                                                    <UserCheck className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                className="text-red-600 hover:text-red-900"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Gestion Départements */}
            {activeTab === 'departments' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Liste des Départements</h2>
                        <button
                            onClick={() => setShowDeptModal(true)}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nouveau Département
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {departments.map((dept) => (
                            <div key={dept.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{dept.name}</h3>
                                        <p className="text-sm text-gray-500">{dept.code}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        dept.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                    {dept.active ? 'Actif' : 'Inactif'}
                  </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Users className="w-4 h-4 mr-2" />
                                        <span>{dept.users_count} utilisateurs</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <UserCheck className="w-4 h-4 mr-2" />
                                        <span>Responsable: {dept.responsible}</span>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button className="flex-1 px-3 py-2 bg-cyan-50 text-cyan-600 rounded-lg text-sm hover:bg-cyan-100">
                                        <Edit2 className="w-4 h-4 inline mr-1" />
                                        Modifier
                                    </button>
                                    <button className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Configuration Système */}
            {activeTab === 'settings' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Configuration Système</h2>

                    <div className="space-y-6">
                        {/* Email Configuration */}
                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Email</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Serveur SMTP</label>
                                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="smtp.batex-ci.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
                                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="587" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Expéditeur</label>
                                    <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="noreply@batex-ci.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom Expéditeur</label>
                                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="BATEX-CI Reporting" />
                                </div>
                            </div>
                        </div>

                        {/* Rappels Automatiques */}
                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rappels Automatiques</h3>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded text-cyan-600" defaultChecked />
                                    <span className="ml-2 text-sm text-gray-700">Rappels hebdomadaires (Vendredis 9h)</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded text-cyan-600" defaultChecked />
                                    <span className="ml-2 text-sm text-gray-700">Rappels mensuels (28 du mois 9h)</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded text-cyan-600" />
                                    <span className="ml-2 text-sm text-gray-700">Notifications validateurs (temps réel)</span>
                                </label>
                            </div>
                        </div>

                        {/* Backup */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sauvegarde & Maintenance</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">Dernière sauvegarde</p>
                                        <p className="text-sm text-gray-500">16/02/2026 03:00</p>
                                    </div>
                                    <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                                        <Download className="w-4 h-4 inline mr-2" />
                                        Backup Now
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">Nettoyage base de données</p>
                                        <p className="text-sm text-gray-500">Supprimer les données anciennes</p>
                                    </div>
                                    <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                                        <RefreshCw className="w-4 h-4 inline mr-2" />
                                        Nettoyer
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg">
                                Sauvegarder Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert succès */}
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg hidden" id="successAlert">
                <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Opération effectuée avec succès</span>
                </div>
            </div>
        </div>
    );
};

export default SystemAdmin;