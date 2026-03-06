import { useState, useEffect } from 'react';
import { X, Save, Database, Calendar, Hash, Type, AlignLeft } from 'lucide-react';
import { dataService } from './service/dataService';
import { useToast } from '../../../components/ui/Toast';

export default function DataEntryModal({
                                           isOpen,
                                           onClose,
                                           onSuccess,
                                           editingData = null,
                                           schema,
                                           deptCode,
                                           departmentName
                                       }) {
    const { addToast } = useToast();

    const [formData, setFormData] = useState({});
    const [machinesData, setMachinesData] = useState({});
    const [loading, setLoading] = useState(false);

    const isEdit = !!editingData;

    // Initialize form data based on schema
    useEffect(() => {
        if (isOpen && schema) {
            document.body.style.overflow = 'hidden';

            if (editingData) {
                // Mode édition - use existing data
                setFormData(editingData);
                if (editingData.machines_data) {
                    try {
                        const parsed = typeof editingData.machines_data === 'string'
                            ? JSON.parse(editingData.machines_data)
                            : editingData.machines_data;
                        setMachinesData(parsed);
                    } catch (e) {
                        console.error('Error parsing machines data:', e);
                    }
                }
            } else {
                // Mode création - initialize with defaults based on schema
                const initialData = {};
                schema.fields.forEach((field) => {
                    if (field.type === 'date') {
                        initialData[field.key] = new Date().toISOString().split('T')[0];
                    } else if (field.type === 'select' && field.defaultValue) {
                        initialData[field.key] = field.defaultValue;
                    } else if (field.type === 'number') {
                        initialData[field.key] = '';
                    } else {
                        initialData[field.key] = '';
                    }
                });
                setFormData(initialData);

                // Initialize machines data if schema has machines
                if (schema.machines && schema.machines.length > 0) {
                    const initialMachines = {};
                    schema.machines.forEach((machine) => {
                        initialMachines[machine.key] = '';
                    });
                    setMachinesData(initialMachines);
                }
            }
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, editingData, schema]);

    const handleChange = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleMachineChange = (key, value) => {
        setMachinesData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation based on schema
            const requiredFields = schema.fields.filter((f) => f.required);
            for (const field of requiredFields) {
                const value = formData[field.key];
                if (value === undefined || value === null || value === '') {
                    addToast(`${field.label} est requis`, 'warning', 3000);
                    setLoading(false);
                    return;
                }

                // Number validation
                if (field.type === 'number') {
                    const numValue = Number(value);
                    if (isNaN(numValue)) {
                        addToast(`${field.label} doit être un nombre`, 'warning', 3000);
                        setLoading(false);
                        return;
                    }
                    if (field.min !== undefined && numValue < field.min) {
                        addToast(`${field.label} doit être ≥ ${field.min}`, 'warning', 3000);
                        setLoading(false);
                        return;
                    }
                    if (field.max !== undefined && numValue > field.max) {
                        addToast(`${field.label} doit être ≤ ${field.max}`, 'warning', 3000);
                        setLoading(false);
                        return;
                    }
                }
            }

            // Préparer payload
            const payload = { ...formData };

            // Convert number fields to numbers
            schema.fields.forEach(field => {
                if (field.type === 'number' && payload[field.key]) {
                    payload[field.key] = Number(payload[field.key]);
                }
            });

            // Ajouter machines si présentes
            if (schema.machines && Object.keys(machinesData).length > 0) {
                payload.machines_data = machinesData;
            }

            console.log('Submitting payload:', payload);

            // Envoyer au backend
            if (isEdit) {
                await dataService.update(deptCode, editingData.id, payload);
                addToast('Données modifiées avec succès !', 'success', 3000);
            } else {
                await dataService.create(deptCode, payload);
                addToast('Données enregistrées avec succès !', 'success', 3000);
            }

            onSuccess();
        } catch (err) {
            console.error('Submit error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde';
            addToast(errorMsg, 'error', 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Get icon for field type
    const getFieldIcon = (type) => {
        switch(type) {
            case 'date': return <Calendar className="w-4 h-4 text-gray-400" />;
            case 'number': return <Hash className="w-4 h-4 text-gray-400" />;
            case 'textarea': return <AlignLeft className="w-4 h-4 text-gray-400" />;
            default: return <Type className="w-4 h-4 text-gray-400" />;
        }
    };

    if (!isOpen || !schema) return null;

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with department info */}
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center space-x-3 text-white">
                        <div className="text-3xl">{schema.icon || '📋'}</div>
                        <div>
                            <h2 className="text-xl font-bold">
                                {isEdit ? 'Modifier' : 'Nouvelle'} Saisie
                            </h2>
                            <p className="text-sm text-cyan-100">
                                {schema.title || departmentName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body - Scrollable with dynamic fields */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="data-entry-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {schema.fields.map((field) => (
                                <div
                                    key={field.key}
                                    className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                                >
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <div className="flex items-center space-x-2">
                                            {getFieldIcon(field.type)}
                                            <span>{field.label}</span>
                                            {field.required && (
                                                <span className="text-red-500 text-xs">*</span>
                                            )}
                                        </div>
                                    </label>

                                    {field.type === 'textarea' ? (
                                        <textarea
                                            value={formData[field.key] || ''}
                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                            rows={field.rows || 3}
                                            placeholder={field.placeholder || `Saisir ${field.label.toLowerCase()}`}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                                        />
                                    ) : field.type === 'select' ? (
                                        <select
                                            value={formData[field.key] || ''}
                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        >
                                            <option value="">Sélectionner...</option>
                                            {field.options?.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={field.type}
                                            value={formData[field.key] || ''}
                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                            min={field.min}
                                            max={field.max}
                                            step={field.step}
                                            placeholder={field.placeholder || `Saisir ${field.label.toLowerCase()}`}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        />
                                    )}

                                    {field.help && (
                                        <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Machines Section - Only shown if schema has machines */}
                        {schema.machines && schema.machines.length > 0 && (
                            <div className="pt-6 border-t">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Database className="w-5 h-5 mr-2 text-cyan-600" />
                                    État des Machines
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {schema.machines.map((machine) => (
                                        <div key={machine.key}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {machine.label}
                                            </label>
                                            <input
                                                type="number"
                                                value={machinesData[machine.key] || ''}
                                                onChange={(e) => handleMachineChange(machine.key, e.target.value)}
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        form="data-entry-form"
                        disabled={loading}
                        className="inline-flex items-center px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                {isEdit ? 'Mettre à jour' : 'Enregistrer'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}