import { useState, useEffect, useMemo } from 'react';
import { X, Building2, Code, Palette, FileText, User } from 'lucide-react';

const DepartmentModal = ({ show, onClose, department, onSuccess, users = [] }) => {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        icon: 'building',
        color: 'blue',
        description: '',
        manager: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            if (department) {
                setFormData({
                    code: department.code || '',
                    name: department.name || '',
                    icon: department.icon || 'building',
                    color: department.color || 'blue',
                    description: department.description || '',
                    manager:
                        department.manager_id ??
                        department.manager?.id ??
                        '',
                });
            } else {
                setFormData({
                    code: '',
                    name: '',
                    icon: 'building',
                    color: 'blue',
                    description: '',
                    manager: '',
                });
            }
            setErrors({});
        }
    }, [show, department]);

    const icons = [
        'building', 'users', 'briefcase', 'calculator', 'shopping-cart',
        'package', 'warehouse', 'printer', 'flask', 'scissors',
        'wrench', 'zap', 'monitor', 'pie-chart', 'trending-up'
    ];

    const colors = [
        { value: 'blue', label: 'Bleu', class: 'bg-blue-500' },
        { value: 'green', label: 'Vert', class: 'bg-green-500' },
        { value: 'red', label: 'Rouge', class: 'bg-red-500' },
        { value: 'yellow', label: 'Jaune', class: 'bg-yellow-500' },
        { value: 'purple', label: 'Violet', class: 'bg-purple-500' },
        { value: 'pink', label: 'Rose', class: 'bg-pink-500' },
        { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
        { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
        { value: 'gray', label: 'Gris', class: 'bg-gray-500' },
    ];

    const previewColorMap = {
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        red: 'bg-red-100 text-red-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        purple: 'bg-purple-100 text-purple-800',
        pink: 'bg-pink-100 text-pink-800',
        cyan: 'bg-cyan-100 text-cyan-800',
        orange: 'bg-orange-100 text-orange-800',
        gray: 'bg-gray-100 text-gray-800',
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.code.trim()) {
            newErrors.code = 'Code requis';
        } else if (!/^[A-Z_]+$/.test(formData.code)) {
            newErrors.code = 'Code doit être en MAJUSCULES (ex: RH, COMPTA)';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Nom requis';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const availableManagers = useMemo(() => {
        const list = Array.isArray(users) ? users : [];

        // mode edit
        if (department?.id) {
            return list.filter((u) => {
                if (!u?.id) return false;
                if (u.is_active === false) return false;
                const userDeptId = u.department_id ?? u.department?.id;
                return Number(userDeptId) === Number(department.id);
            });
        }

        // mode create => tous les users actifs
        return list.filter((u) => u?.id && u.is_active !== false);
    }, [users, department]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            const payload = {
                code: formData.code.trim(),
                name: formData.name.trim(),
                icon: formData.icon,
                color: formData.color,
                description: formData.description?.trim() || '',
                manager_id: formData.manager || null,
            };

            await onSuccess(payload);
            onClose();
        } catch (error) {
            console.error('Error submitting department:', error);
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
                        {department ? 'Modifier le département' : 'Nouveau département'}
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
                        {/* Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Code className="w-4 h-4 inline mr-2" />
                                Code *
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) =>
                                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                                }
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 uppercase ${
                                    errors.code ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="RH, COMPTA, IT"
                                disabled={!!department}
                            />
                            {errors.code && (
                                <p className="text-red-500 text-sm mt-1">{errors.code}</p>
                            )}
                            {department && (
                                <p className="text-gray-500 text-xs mt-1">
                                    Le code ne peut pas être modifié
                                </p>
                            )}
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Building2 className="w-4 h-4 inline mr-2" />
                                Nom *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Ressources Humaines"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Icon */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Icône
                            </label>
                            <select
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            >
                                {icons.map((icon) => (
                                    <option key={icon} value={icon}>
                                        {icon}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Palette className="w-4 h-4 inline mr-2" />
                                Couleur
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {colors.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: color.value })}
                                        className={`w-10 h-10 rounded-lg ${color.class} ${
                                            formData.color === color.value
                                                ? 'ring-4 ring-offset-2 ring-gray-400'
                                                : 'hover:ring-2 ring-gray-200'
                                        } transition-all`}
                                        title={color.label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Responsable selection */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User className="w-4 h-4 inline mr-2" />
                                Responsable
                            </label>

                            <select
                                value={formData.manager || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        manager: e.target.value ? Number(e.target.value) : '',
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="">Sélectionner un responsable</option>

                                {availableManagers.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.full_name || u.username || `Utilisateur #${u.id}`}
                                        {u.email ? ` (${u.email})` : ''}
                                    </option>
                                ))}
                            </select>

                            {department && availableManagers.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1">
                                    Aucun utilisateur actif dans ce département.
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FileText className="w-4 h-4 inline mr-2" />
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                                placeholder="Description du département..."
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3">Aperçu:</p>
                        <div
                            className={`inline-flex items-center px-4 py-2 rounded-lg ${
                                previewColorMap[formData.color] || previewColorMap.blue
                            }`}
                        >
                            <span className="font-medium">{formData.name || 'Nom du département'}</span>
                            {formData.code && (
                                <span className="ml-2 text-xs opacity-75">({formData.code})</span>
                            )}
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
                            {loading ? 'Enregistrement...' : department ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DepartmentModal;