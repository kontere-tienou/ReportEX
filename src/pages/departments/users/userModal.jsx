import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building2, Shield, Eye, EyeOff } from 'lucide-react';

const UserModal = ({ show, onClose, user, departments, onSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'USER',
        department_id: '',
        phone: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens/closes or user changes
    useEffect(() => {
        if (show) {
            if (user) {
                // Mode édition
                setFormData({
                    email: user.email || '',
                    password: '', // Ne pas afficher le mot de passe en édition
                    full_name: user.full_name || '',
                    role: user.role || 'USER',
                    department_id: user.department_id || '',
                    phone: user.phone || '',
                });
            } else {
                // Mode création
                setFormData({
                    email: '',
                    password: '',
                    full_name: '',
                    role: 'USER',
                    department_id: '',
                    phone: '',
                });
            }
            setErrors({});
        }
    }, [show, user]);

    const roles = [
        { value: 'ADMIN', label: 'Administrateur', color: 'purple' },
        { value: 'DG', label: 'Direction Générale', color: 'blue' },
        { value: 'MANAGER', label: 'Manager', color: 'green' },
        { value: 'SUPERVISOR', label: 'Superviseur', color: 'amber' },
        { value: 'USER', label: 'Utilisateur', color: 'gray' },
        { value: 'VIEWER', label: 'Lecteur', color: 'slate' },
    ];

    const validate = () => {
        const newErrors = {};

        // Email
        if (!formData.email.trim()) {
            newErrors.email = 'Email requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email invalide';
        }

        // Password (requis uniquement en création)
        if (!user && !formData.password) {
            newErrors.password = 'Mot de passe requis';
        } else if (formData.password && formData.password.length < 8) {
            newErrors.password = 'Minimum 8 caractères';
        }

        // Full name
        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Nom complet requis';
        }

        // Department
        if (!formData.department_id) {
            newErrors.department_id = 'Département requis';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            // Préparer les données
            const dataToSend = { ...formData };

            // En mode édition, ne pas envoyer le password s'il est vide
            if (user && !dataToSend.password) {
                delete dataToSend.password;
            }

            await onSuccess(dataToSend);
            onClose();
        } catch (error) {
            console.error('Error submitting user:', error);
            setErrors({
                submit: error.response?.data?.message || 'Erreur lors de la sauvegarde',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error global */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {errors.submit}
                        </div>
                    )}

                    {/* Grid 2 colonnes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Mail className="w-4 h-4 inline mr-2" />
                                Email *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="utilisateur@batex-ci.com"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Full Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User className="w-4 h-4 inline mr-2" />
                                Nom complet *
                            </label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
                                    errors.full_name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Ali TRAORE"
                            />
                            {errors.full_name && (
                                <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mot de passe {!user && '*'}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 pr-10 ${
                                        errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder={user ? 'Laisser vide pour ne pas changer' : 'Minimum 8 caractères'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                            )}
                            {user && (
                                <p className="text-gray-500 text-xs mt-1">
                                    Laisser vide pour conserver le mot de passe actuel
                                </p>
                            )}
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Shield className="w-4 h-4 inline mr-2" />
                                Rôle *
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            >
                                {roles.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Building2 className="w-4 h-4 inline mr-2" />
                                Département *
                            </label>
                            <select
                                value={formData.department_id}
                                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
                                    errors.department_id ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Sélectionner...</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            {errors.department_id && (
                                <p className="text-red-500 text-sm mt-1">{errors.department_id}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Phone className="w-4 h-4 inline mr-2" />
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                                placeholder="+223 70 23 45 67"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Enregistrement...' : user ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;