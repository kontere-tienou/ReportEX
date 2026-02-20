import { useState } from 'react';
import { Settings, User, Bell, Lock, Mail, Save, Shield, Monitor } from 'lucide-react';

const ParametresIT = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Paramètres IT</h1>
                <p className="text-gray-600 mt-1">Configurez vos préférences personnelles</p>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <div className="flex space-x-8 px-6">
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
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Informations du Profil</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                                    <input type="text" defaultValue="Sekou DIARRA" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                    <input type="text" defaultValue={user.name} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input type="email" defaultValue="sekou@batex-ci.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                                    <input type="tel" defaultValue="+225 07 XX XX XX XX" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
                                    <input type="text" defaultValue="Informatique" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                                    <input type="text" defaultValue="Administrateur" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled />
                                </div>
                            </div>

                            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg flex items-center">
                                <Save className="w-4 h-4 mr-2" />
                                Sauvegarder
                            </button>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Sécurité du Compte</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                                    <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                                    <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer mot de passe</label>
                                    <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                            </div>

                            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg flex items-center">
                                <Lock className="w-4 h-4 mr-2" />
                                Changer le mot de passe
                            </button>

                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-4">Sessions actives</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">Chrome - Windows</p>
                                            <p className="text-sm text-gray-500">192.168.1.100 • Session actuelle</p>
                                        </div>
                                        <span className="text-green-600 text-sm">Actif maintenant</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Préférences de Notifications</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Notifications Email</p>
                                        <p className="text-sm text-gray-500">Recevoir les alertes par email</p>
                                    </div>
                                    <input type="checkbox" className="rounded text-cyan-600" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Tickets urgents</p>
                                        <p className="text-sm text-gray-500">Notifications immédiates</p>
                                    </div>
                                    <input type="checkbox" className="rounded text-cyan-600" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Alertes système</p>
                                        <p className="text-sm text-gray-500">CPU, RAM, Disque</p>
                                    </div>
                                    <input type="checkbox" className="rounded text-cyan-600" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Rapports hebdomadaires</p>
                                        <p className="text-sm text-gray-500">Résumé d'activité</p>
                                    </div>
                                    <input type="checkbox" className="rounded text-cyan-600" />
                                </div>
                            </div>

                            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg flex items-center">
                                <Save className="w-4 h-4 mr-2" />
                                Sauvegarder
                            </button>
                        </div>
                    )}

                    {activeTab === 'interface' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Préférences d'Interface</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Thème</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option>Clair</option>
                                        <option>Sombre</option>
                                        <option>Automatique</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option>Français</option>
                                        <option>English</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Mode compact</p>
                                        <p className="text-sm text-gray-500">Réduire l'espacement</p>
                                    </div>
                                    <input type="checkbox" className="rounded text-cyan-600" />
                                </div>
                            </div>

                            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg flex items-center">
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

export default ParametresIT;