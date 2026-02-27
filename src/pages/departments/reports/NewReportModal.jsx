import { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Save, Send, AlertCircle, FileText, Lock, Globe } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { reportService } from '../../../services/api';
import { useToast, ToastContainer } from '../../../components/ui/Toast';
import ReportFieldRenderer from './ReportFieldRenderer.jsx';
import {
    getTemplateForDepartment,
    validateReportData,
    calculateDerivedFields,
} from '../../../config/reportTemplates';

/**
 * ==========================================
 * NEW REPORT MODAL - FIXED
 * ==========================================
 */

const VISIBILITY_OPTIONS = [
    {
        value: 'private',
        label: 'Privé',
        description: 'Direction seulement',
        icon: Lock,
        color: 'text-amber-600',
    },
    {
        value: 'department',
        label: 'Département',
        description: 'Membres du département',
        icon: FileText,
        color: 'text-blue-600',
    },
    {
        value: 'public',
        label: 'Public',
        description: 'Tous les utilisateurs',
        icon: Globe,
        color: 'text-green-600',
    },
];

const NewReportModal = ({ open, onClose, onCreated }) => {
    const { user } = useAuth();
    const { toasts, addToast, removeToast } = useToast();

    const [formData, setFormData] = useState({
        period_start: '',
        period_end: '',
        visibility: 'private', // STRING pas array
    });

    const [reportData, setReportData] = useState({});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Get template for user's department
    const template = useMemo(() => {
        if (!user?.department?.code) return null;
        return getTemplateForDepartment(user.department.code);
    }, [user]);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            setFormData({
                period_start: '',
                period_end: '',
                visibility: 'private',
            });
            setReportData({});
            setErrors({});
        }
    }, [open]);

    // Calculate derived fields whenever data changes
    useEffect(() => {
        if (!template || !user?.department?.code) return;

        const calculatedData = calculateDerivedFields(
            user.department.code,
            reportData
        );

        // Only update if values actually changed
        if (JSON.stringify(calculatedData) !== JSON.stringify(reportData)) {
            setReportData(calculatedData);
        }
    }, [reportData, template, user]);

    if (!open) return null;

    if (!template) {
        return (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-6 max-w-md">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Erreur de Configuration
                    </h3>
                    <p className="text-gray-700">
                        Aucun template de rapport n'est configuré pour votre département.
                    </p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        );
    }

    const validate = () => {
        const newErrors = {};

        // Period validation
        if (!formData.period_start) {
            newErrors.period_start = 'Date de début requise';
        }

        if (!formData.period_end) {
            newErrors.period_end = 'Date de fin requise';
        }

        if (formData.period_start && formData.period_end) {
            if (new Date(formData.period_start) > new Date(formData.period_end)) {
                newErrors.period_end = 'La date de fin doit être après la date de début';
            }
        }

        // Validate report data against template
        if (user?.department?.code) {
            const validation = validateReportData(user.department.code, reportData);
            if (!validation.valid) {
                validation.errors.forEach((error) => {
                    const field = template.fields.find((f) => error.includes(f.label));
                    if (field) {
                        newErrors[field.key] = error;
                    }
                });
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const canSubmit = formData.period_start && formData.period_end;

    const handleSubmit = async (submitForValidation) => {
        if (!validate()) {
            addToast('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        setSaving(true);

        try {
            const finalData = calculateDerivedFields(
                user.department.code,
                reportData
            );

            const payload = {
                period_start: formData.period_start,
                period_end: formData.period_end,
                visibility: formData.visibility, // STRING
                data: finalData,
            };

            const res = await reportService.createReport(payload);
            const report = res.data.data?.report || res.data.report;

            if (submitForValidation && report?.id) {
                await reportService.submitReport(report.id);
                addToast('Rapport créé et soumis pour validation !', 'success');
            } else {
                addToast('Rapport enregistré comme brouillon', 'success');
            }

            if (onCreated) onCreated();
            if (onClose) onClose();
        } catch (e) {
            const errorMsg =
                e?.response?.data?.message || 'Erreur lors de la sauvegarde';
            addToast(errorMsg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleFieldChange = (fieldKey, value) => {
        setReportData({
            ...reportData,
            [fieldKey]: value,
        });

        if (errors[fieldKey]) {
            setErrors({
                ...errors,
                [fieldKey]: undefined,
            });
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="absolute inset-0" onClick={onClose} />

                <div className="fixed left-1/2 top-1/2 w-[95vw] max-w-5xl -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-white rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            Nouveau Rapport - {template.name}
                                        </h2>
                                        <p className="text-sm text-cyan-100">
                                            {user.department.name}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            {/* Alert info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-blue-900 font-medium">
                                        Créez un rapport pour la période sélectionnée
                                    </p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Les champs marqués d'un * sont obligatoires. Les champs
                                        calculés se remplissent automatiquement.
                                    </p>
                                </div>
                            </div>

                            {/* Visibility - SINGLE SELECT */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                    Visibilité du Rapport
                                </label>
                                <div className="grid grid-cols-3 gap-4">
                                    {VISIBILITY_OPTIONS.map((v) => {
                                        const Icon = v.icon;
                                        const isSelected = formData.visibility === v.value;

                                        return (
                                            <button
                                                key={v.value}
                                                type="button"
                                                onClick={() =>
                                                    setFormData({ ...formData, visibility: v.value })
                                                }
                                                className={`relative p-4 rounded-xl border-2 transition-all ${
                                                    isSelected
                                                        ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-200'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <Icon
                                                        className={`w-6 h-6 ${isSelected ? 'text-cyan-600' : 'text-gray-400'}`}
                                                    />
                                                    <div className="flex-1 text-left">
                                                        <p
                                                            className={`font-semibold ${isSelected ? 'text-cyan-900' : 'text-gray-900'}`}
                                                        >
                                                            {v.label}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-0.5">
                                                            {v.description}
                                                        </p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-5 h-5 bg-cyan-600 rounded-full flex items-center justify-center">
                                                            <svg
                                                                className="w-3 h-3 text-white"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Period */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-900 mb-4 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-cyan-600" />
                                    Période du Rapport *
                                </label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-2">
                                            Date de début
                                        </label>
                                        <input
                                            type="date"
                                            className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all
                        focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500
                        ${errors.period_start ? 'border-red-500' : 'border-gray-200'}`}
                                            value={formData.period_start}
                                            onChange={(e) =>
                                                setFormData({ ...formData, period_start: e.target.value })
                                            }
                                        />
                                        {errors.period_start && (
                                            <p className="text-xs text-red-600 mt-1">
                                                {errors.period_start}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-2">
                                            Date de fin
                                        </label>
                                        <input
                                            type="date"
                                            className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all
                        focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500
                        ${errors.period_end ? 'border-red-500' : 'border-gray-200'}`}
                                            value={formData.period_end}
                                            onChange={(e) =>
                                                setFormData({ ...formData, period_end: e.target.value })
                                            }
                                        />
                                        {errors.period_end && (
                                            <p className="text-xs text-red-600 mt-1">
                                                {errors.period_end}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Fields from Template */}
                            <div className="space-y-5">
                                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
                                    Données du Rapport
                                </h3>

                                {template.fields.map((field) => (
                                    <ReportFieldRenderer
                                        key={field.key}
                                        field={field}
                                        value={reportData[field.key]}
                                        onChange={(value) => handleFieldChange(field.key, value)}
                                        errors={errors[field.key]}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">* Champs obligatoires</p>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit(false)}
                                        disabled={!canSubmit || saving}
                                        className="px-5 py-2.5 rounded-lg border-2 border-gray-300
                      hover:bg-gray-100 transition-all font-medium
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center space-x-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Brouillon</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleSubmit(true)}
                                        disabled={!canSubmit || saving}
                                        className="px-5 py-2.5 rounded-lg
                      bg-gradient-to-r from-cyan-600 to-blue-600
                      hover:from-cyan-700 hover:to-blue-700
                      text-white font-semibold transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed
                      shadow-lg shadow-cyan-500/30
                      flex items-center space-x-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>{saving ? 'Envoi...' : 'Soumettre'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default NewReportModal;