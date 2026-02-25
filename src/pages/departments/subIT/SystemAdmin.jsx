import { useEffect, useState } from 'react';
import {
    Users,
    Building2,
    Settings,
    Shield,
    Plus,
    Edit2,
    Trash2,
    Search,
    Key,
    UserCheck,
    UserX,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import { adminService } from '../../../services/api';
import UserModal from '../users/userModal.jsx';
import DepartmentModal from '../departmentModal.jsx';

const SystemAdmin = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [searchTerm, setSearchTerm] = useState('');

    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedDept, setSelectedDept] = useState(null);

    const [alert, setAlert] = useState(null);

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);

    // Show alert helper
    const showAlert = (message, type = 'success') => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 5000);
    };

    // Fetch all data
    const fetchData = async () => {
        try {
            setLoading(true);

            const [usersRes, deptRes] = await Promise.all([
                adminService.getUsers(),
                adminService.getDepartments(),
            ]);

            const usersData =
                usersRes?.data?.data?.users ||
                usersRes?.data?.users ||
                usersRes?.data?.data ||
                [];

            const departmentsData =
                deptRes?.data?.data?.departments ||
                deptRes?.data?.departments ||
                deptRes?.data?.data ||
                [];

            setUsers(Array.isArray(usersData) ? usersData : []);
            setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
        } catch (err) {
            console.error("Erreur chargement admin:", err?.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // USER CRUD
    // ==========================================

    const handleCreateUser = async (data) => {
        try {
            await adminService.createUser(data);
            showAlert('Utilisateur créé avec succès');
            await fetchData();
        } catch (err) {
            console.error('Error creating user:', err);
            throw err;
        }
    };

    const handleUpdateUser = async (data) => {
        try {
            await adminService.updateUser(selectedUser.id, data);
            showAlert('Utilisateur modifié avec succès');
            setSelectedUser(null);
            await fetchData();
        } catch (err) {
            console.error('Error updating user:', err);
            throw err;
        }
    };

    const handleToggleUser = async (user) => {
        try {
            const isActive = user?.is_active === true || user?.status === 'active';

            if (isActive) {
                await adminService.deactivateUser(user.id);
            } else {
                await adminService.activateUser(user.id);
            }

            await fetchData();
        } catch (err) {
            console.error("Erreur toggle user:", err?.response?.data || err);
        }
    };


    const handleDeleteUser = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            return;
        }

        try {
            await adminService.deleteUser(id);
            showAlert('Utilisateur supprimé');
            await fetchData();
        } catch (err) {
            console.error('Error deleting user:', err);
            showAlert('Erreur lors de la suppression', 'error');
        }
    };

    // ==========================================
    // DEPARTMENT CRUD
    // ==========================================

    const handleCreateDepartment = async (data) => {
        try {
            await adminService.createDepartment(data);
            showAlert('Département créé avec succès');
            await fetchData();
        } catch (err) {
            console.error('Error creating department:', err);
            throw err;
        }
    };

    const handleUpdateDepartment = async (data) => {
        try {
            await adminService.updateDepartment(selectedDept.id, data);
            showAlert('Département modifié avec succès');
            setSelectedDept(null);
            await fetchData();
        } catch (err) {
            console.error('Error updating department:', err);
            throw err;
        }
    };

    const handleDeleteDepartment = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
            return;
        }

        try {
            await adminService.deleteDepartment(id);
            showAlert('Département supprimé');
            await fetchData();
        } catch (err) {
            console.error('Error deleting department:', err);
            showAlert('Erreur lors de la suppression', 'error');
        }
    };

    // ==========================================
    // HELPERS
    // ==========================================

    const getRoleBadge = (role) => {
        const roleMap = {
            ADMIN: { label: 'Admin', class: 'bg-purple-100 text-purple-800' },
            DG: { label: 'Direction', class: 'bg-blue-100 text-blue-800' },
            MANAGER: { label: 'Manager', class: 'bg-green-100 text-green-800' },
            SUPERVISOR: { label: 'Superviseur', class: 'bg-amber-100 text-amber-800' },
            USER: { label: 'Utilisateur', class: 'bg-gray-100 text-gray-800' },
            VIEWER: { label: 'Lecteur', class: 'bg-slate-100 text-slate-800' },
        };

        const roleData = roleMap[role?.toUpperCase()] || roleMap.USER;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleData.class}`}>
        {roleData.label}
      </span>
        );
    };

    const getStatusBadge = (user) => {
        const isActive = user?.is_active === true || user?.status === 'active';

        return isActive ? (
            <span className="inline-flex items-center text-green-600 text-sm">
            <CheckCircle className="w-4 h-4 mr-1" />
            Actif
        </span>
        ) : (
            <span className="inline-flex items-center text-gray-500 text-sm">
            <UserX className="w-4 h-4 mr-1" />
            Inactif
        </span>
        );
    };

    // Filter users
    const filteredUsers = users.filter((user) => {
        const q = searchTerm.toLowerCase();
        return (
            (user.email || '').toLowerCase().includes(q) ||
            (user.full_name || '').toLowerCase().includes(q) ||
            (user.username || '').toLowerCase().includes(q)
        );
    });

    // Calculate stats
    const stats = {
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.is_active === true || u.status === 'active').length,
        admins: users.filter((u) => u.role?.toUpperCase() === 'ADMIN').length,
        departments: departments.length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Alert */}
            {alert && (
                <div
                    className={`p-4 rounded-lg border ${
                        alert.type === 'error'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-green-50 border-green-200 text-green-700'
                    }`}
                >
                    <div className="flex items-center">
                        {alert.type === 'error' ? (
                            <AlertCircle className="w-5 h-5 mr-2" />
                        ) : (
                            <CheckCircle className="w-5 h-5 mr-2" />
                        )}
                        <span>{alert.message}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Administration Système</h1>
                <p className="text-gray-600 mt-1">
                    Gestion des utilisateurs, départements et configuration
                </p>
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

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="space-y-4">
                    {/* Action bar */}
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
                            onClick={() => {
                                setSelectedUser(null);
                                setShowUserModal(true);
                            }}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center ml-4"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nouvel Utilisateur
                        </button>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Utilisateur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Rôle
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Département
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Aucun utilisateur trouvé
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">
                                                {user.full_name || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.email || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.department?.name || user.department_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(user)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowUserModal(true);
                                                    }}
                                                    className="text-cyan-600 hover:text-cyan-900"
                                                    title="Modifier"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleUser(user)}
                                                    className={
                                                        user.is_active === true || user.status === 'active'
                                                            ? 'text-red-600 hover:text-red-900'
                                                            : 'text-green-600 hover:text-green-900'
                                                    }
                                                    title={
                                                        user.is_active === true || user.status === 'active'
                                                            ? 'Désactiver'
                                                            : 'Activer'
                                                    }
                                                >
                                                    {user.is_active === true || user.status === 'active' ? (
                                                        <UserX className="w-4 h-4" />
                                                    ) : (
                                                        <UserCheck className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Departments Tab */}
            {activeTab === 'departments' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Liste des Départements</h2>
                        <button
                            onClick={() => {
                                setSelectedDept(null);
                                setShowDeptModal(true);
                            }}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nouveau Département
                        </button>
                    </div>

                    {departments.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                            Aucun département trouvé
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {departments.map((dept) => {
                                const isActive =
                                    typeof dept.is_active === 'boolean'
                                        ? dept.is_active
                                        : !!dept.active;

                                return (
                                    <div key={dept.id} className="bg-white rounded-lg shadow p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{dept.name}</h3>
                                                <p className="text-sm text-gray-500">{dept.code}</p>
                                            </div>
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${
                                                    isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {isActive ? 'Actif' : 'Inactif'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Users className="w-4 h-4 mr-2" />
                                                <span>
                                                    {dept.users_count ?? dept.total_users ?? 0} utilisateurs
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <UserCheck className="w-4 h-4 mr-2" />
                                                <span>
                                                     Responsable: {dept.responsible || dept.manager_name || "Non défini"}
                                                </span>
                                            </div>
                                        </div>

                                        {dept.description && (
                                            <p className="text-sm text-gray-600 mb-4">{dept.description}</p>
                                        )}

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedDept(dept);
                                                    setShowDeptModal(true);
                                                }}
                                                className="flex-1 px-3 py-2 bg-cyan-50 text-cyan-600 rounded-lg text-sm hover:bg-cyan-100"
                                            >
                                                <Edit2 className="w-4 h-4 inline mr-1" />
                                                Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDepartment(dept.id)}
                                                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Configuration Système
                    </h2>
                    <p className="text-gray-600">Fonctionnalités à venir...</p>
                </div>
            )}

            {/* Modals */}
            <UserModal
                show={showUserModal}
                onClose={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                departments={departments}
                onSuccess={selectedUser ? handleUpdateUser : handleCreateUser}
            />

            <DepartmentModal
                show={showDeptModal}
                onClose={() => {
                    setShowDeptModal(false);
                    setSelectedDept(null);
                }}
                department={selectedDept}
                onSuccess={selectedDept ? handleUpdateDepartment : handleCreateDepartment}
            />
        </div>
    );
};

export default SystemAdmin;