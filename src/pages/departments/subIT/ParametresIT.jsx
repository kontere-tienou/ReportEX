import { useMemo, useState } from 'react';
import { User, Bell, Lock, Save, Monitor } from 'lucide-react';
import { useAuth } from "../../../context/AuthContext.jsx";

const Parametres = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    // ✅ Safe user object (évite crash si user n'est pas encore chargé)
    const safeUser = useMemo(() => ({
        full_name: user?.full_name || '',
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.role || '',
        department_name: user?.department?.name || user?.department_name || '',
        department_code: user?.department?.code || user?.department_code || '',
    }), [user]);

    // ✅ Form state Profil
    const [profileForm, setProfileForm] = useState({
        full_name: safeUser.full_name,
        username: safeUser.username,
        email: safeUser.email,
        phone: safeUser.phone,
    });

    // ✅ Form state Sécurité
    const [securityForm, setSecurityForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // ✅ Form state Notifications
    const [notificationForm, setNotificationForm] = useState({
        emailNotifications: true,
        urgentTickets: true,
        systemAlerts: true,
        weeklyReports: false,
    });

    // ✅ Form state Interface
    const [interfaceForm, setInterfaceForm] = useState({
        theme: 'Clair',
        language: 'Français',
        compactMode: false,
    });

    // ✅ Si user change après chargement, sync profil
    // (sans useEffect complexe, simple reset manuel possible si besoin)
    const handleProfileChange = (field, value) => {
        setProfileForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSecurityChange = (field, value) => {
        setSecurityForm(prev => ({ ...prev, [field]: value }));
    };

    const handleNotificationChange = (field, value) => {
        setNotificationForm(prev => ({ ...prev, [field]: value }));
    };

    const handleInterfaceChange = (field, value) => {
        setInterfaceForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = () => {
        // TODO: appeler API update profile
        console.log("Profil à sauvegarder:", profileForm);
    };

    const handleChangePassword = () => {
        if (!securityForm.currentPassword || !securityForm.newPassword || !securityForm.confirmPassword) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        if (securityForm.newPassword !== securityForm.confirmPassword) {
            alert("La confirmation du mot de passe ne correspond pas.");
            return;
        }

        // TODO: appeler authService.changePassword(...)
        console.log("Changer mot de passe:", securityForm);
    };

    const handleSaveNotifications = () => {
        // TODO: appeler API
        console.log("Notifications:", notificationForm);
    };

    const handleSaveInterface = () => {
        // TODO: appeler API
        console.log("Interface:", interfaceForm);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Paramètres de Profil</h1>
                <p className="text-gray-600 mt-1">Configurez vos préférences personnelles</p>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <div className="flex flex-wrap gap-x-6 px-6">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'profile'
                                    ? 'border-cyan-600 text-cyan-600'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            <User className="w-4 h-4 inline mr-2" />
                            Profil
                        </button>

                        <button
                            onClick={() => setActiveTab('security')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'security'
                                    ? 'border-cyan-600 text-cyan-600'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            <Lock className="w-4 h-4 inline mr-2" />
                            Sécurité
                        </button>

                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'notifications'
                                    ? 'border-cyan-600 text-cyan-600'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            <Bell className="w-4 h-4 inline mr-2" />
                            Notifications
                        </button>

                        <button
                            onClick={() => setActiveTab('interface')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'interface'
                                    ? 'border-cyan-600 text-cyan-600'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            <Monitor className="w-4 h-4 inline mr-2" />
                            Interface
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* ================= PROFILE ================= */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Informations du Profil</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                                    <input
                                        type="text"
                                        value={profileForm.full_name}
                                        onChange={(e) => handleProfileChange('full_name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        value={profileForm.username}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => handleProfileChange('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                                    <input
                                        type="tel"
                                        value={profileForm.phone}
                                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
                                    <input
                                        type="text"
                                        value={safeUser.department_name || '-'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                                    <input
                                        type="text"
                                        value={safeUser.role || '-'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                        disabled
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg flex items-center"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Sauvegarder
                            </button>
                        </div>
                    )}

                    {/* ================= SECURITY ================= */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Sécurité du Compte</h2>

                            <div className="space-y-4 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                                    <input
                                        type="password"
                                        value={securityForm.currentPassword}
                                        onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        value={securityForm.newPassword}
                                        onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer mot de passe</label>
                                    <input
                                        type="password"
                                        value={securityForm.confirmPassword}
                                        onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleChangePassword}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg flex items-center"
                            >
                                <Lock className="w-4 h-4 mr-2" />
                                Changer le mot de passe
                            </button>

                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-4">Sessions actives</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">Chrome - Windows</p>
                                            <p className="text-sm text-gray-500">Session actuelle</p>
                                        </div>
                                        <span className="text-green-600 text-sm">Actif maintenant</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= NOTIFICATIONS ================= */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Préférences de Notifications</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Notifications Email</p>
                                        <p className="text-sm text-gray-500">Recevoir les alertes par email</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="rounded text-cyan-600"
                                        checked={notificationForm.emailNotifications}
                                        onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Tickets urgents</p>
                                        <p className="text-sm text-gray-500">Notifications immédiates</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="rounded text-cyan-600"
                                        checked={notificationForm.urgentTickets}
                                        onChange={(e) => handleNotificationChange('urgentTickets', e.target.checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Alertes système</p>
                                        <p className="text-sm text-gray-500">CPU, RAM, Disque</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="rounded text-cyan-600"
                                        checked={notificationForm.systemAlerts}
                                        onChange={(e) => handleNotificationChange('systemAlerts', e.target.checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Rapports hebdomadaires</p>
                                        <p className="text-sm text-gray-500">Résumé d'activité</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="rounded text-cyan-600"
                                        checked={notificationForm.weeklyReports}
                                        onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveNotifications}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg flex items-center"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Sauvegarder
                            </button>
                        </div>
                    )}

                    {/* ================= INTERFACE ================= */}
                    {activeTab === 'interface' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Préférences d'Interface</h2>

                            <div className="space-y-4 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Thème</label>
                                    <select
                                        value={interfaceForm.theme}
                                        onChange={(e) => handleInterfaceChange('theme', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option>Clair</option>
                                        <option>Sombre</option>
                                        <option>Automatique</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
                                    <select
                                        value={interfaceForm.language}
                                        onChange={(e) => handleInterfaceChange('language', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option>Français</option>
                                        <option>English</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Mode compact</p>
                                        <p className="text-sm text-gray-500">Réduire l'espacement</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="rounded text-cyan-600"
                                        checked={interfaceForm.compactMode}
                                        onChange={(e) => handleInterfaceChange('compactMode', e.target.checked)}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveInterface}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg flex items-center"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Sauvegarder
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Parametres;