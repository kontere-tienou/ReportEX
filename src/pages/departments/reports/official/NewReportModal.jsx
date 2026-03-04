// pages/departments/reports/NewReportModal.jsx
import { useState, useEffect, useMemo } from 'react';
import {
    X,
    Calendar,
    Save,
    Send,
    AlertCircle,
    FileText,
    Lock,
    Globe,
    Layout,
    ChevronRight
} from 'lucide-react';
import {reportService} from "../services/reportApi.js";
import {ToastContainer, useToast} from "../../../../components/ui/index.js";
import {useAuth} from "../../../../context/AuthContext.jsx";
import {
    MetricBlock,
    TextBlock,
    TableBlock,
    ChartBlock,
} from '../builder/components/';
import ComponentPreview from "../builder/ComponentPreview.jsx";

/**
 * ==========================================
 * NEW REPORT MODAL - DRAG & DROP UNIFIÉ
 * Un seul modèle pour tous les rapports
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

    // État du formulaire
    const [formData, setFormData] = useState({
        period_start: '',
        period_end: '',
        visibility: 'private',
        title: '',
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Réinitialiser le formulaire
    useEffect(() => {
        if (open) {
            setFormData({
                period_start: '',
                period_end: '',
                visibility: 'private',
                title: '',
            });
            setErrors({});
        }
    }, [open]);

    // Validation
    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Le titre du rapport est requis';
        }

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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const canSubmit = formData.title && formData.period_start && formData.period_end;

    // Création du rapport
    const handleCreate = async () => {
        if (!validate()) {
            addToast('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        setSaving(true);

        try {
            const payload = {
                title: formData.title,
                period_start: formData.period_start,
                period_end: formData.period_end,
                visibility: formData.visibility,
                type: 'custom', // TOUS les rapports sont personnalisés
                layout: [], // Layout vide pour commencer
                data: {}, // Pas de données pré-définies
            };

            const res = await reportService.create(payload);
            const report = res.data.data?.report || res.data.report;

            addToast('Rapport créé avec succès ! Vous pouvez maintenant ajouter des composants.', 'success');

            if (onCreated) onCreated(report);
            if (onClose) onClose();
        } catch (e) {
            const errorMsg = e?.response?.data?.message || 'Erreur lors de la création';
            addToast(errorMsg, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="absolute inset-0" onClick={onClose} />

                <div className="fixed left-1/2 top-1/2 w-[95vw] max-w-3xl -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-white rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Layout className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            Nouveau Rapport - Drag & Drop
                                        </h2>
                                        <p className="text-sm text-white/80">
                                            {user?.department?.name || 'Département'}
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
                            {/* Info */}
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-purple-900 font-medium">
                                        Créez votre rapport avec le système Drag & Drop
                                    </p>
                                    <p className="text-xs text-purple-700 mt-1">
                                        Après la création, vous pourrez ajouter des graphiques, tableaux, métriques et textes par glisser-déposer.
                                    </p>
                                </div>
                            </div>

                            {/* Titre */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Titre du rapport <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => {
                                        setFormData({ ...formData, title: e.target.value });
                                        if (errors.title) setErrors({ ...errors, title: undefined });
                                    }}
                                    placeholder="ex: Analyse mensuelle des performances"
                                    className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all
                                        focus:ring-4 focus:ring-purple-100 focus:border-purple-500
                                        ${errors.title ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                {errors.title && (
                                    <p className="text-xs text-red-600 mt-1">{errors.title}</p>
                                )}
                            </div>

                            {/* Visibilité */}
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
                                                onClick={() => setFormData({ ...formData, visibility: v.value })}
                                                className={`relative p-4 rounded-xl border-2 transition-all ${
                                                    isSelected
                                                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex flex-col items-center text-center">
                                                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                                                    <p className={`font-semibold text-sm ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                                                        {v.label}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {v.description}
                                                    </p>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Période */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-900 mb-4 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-purple-600" />
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
                                                focus:ring-4 focus:ring-purple-100 focus:border-purple-500
                                                ${errors.period_start ? 'border-red-500' : 'border-gray-200'}`}
                                            value={formData.period_start}
                                            onChange={(e) => {
                                                setFormData({ ...formData, period_start: e.target.value });
                                                if (errors.period_start) setErrors({ ...errors, period_start: undefined });
                                            }}
                                        />
                                        {errors.period_start && (
                                            <p className="text-xs text-red-600 mt-1">{errors.period_start}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-2">
                                            Date de fin
                                        </label>
                                        <input
                                            type="date"
                                            className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all
                                                focus:ring-4 focus:ring-purple-100 focus:border-purple-500
                                                ${errors.period_end ? 'border-red-500' : 'border-gray-200'}`}
                                            value={formData.period_end}
                                            onChange={(e) => {
                                                setFormData({ ...formData, period_end: e.target.value });
                                                if (errors.period_end) setErrors({ ...errors, period_end: undefined });
                                            }}
                                        />
                                        {errors.period_end && (
                                            <p className="text-xs text-red-600 mt-1">{errors.period_end}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                    <span className="text-red-500">*</span> Champs obligatoires
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-5 py-2.5 rounded-lg border-2 border-gray-300
                                            hover:bg-gray-100 transition-all font-medium"
                                    >
                                        Annuler
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleCreate}
                                        disabled={!canSubmit || saving}
                                        className="px-5 py-2.5 rounded-lg
                                            bg-gradient-to-r from-purple-600 to-indigo-600
                                            hover:from-purple-700 hover:to-indigo-700
                                            text-white font-semibold transition-all
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            shadow-lg shadow-purple-500/30
                                            flex items-center space-x-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{saving ? 'Création...' : 'Créer le rapport'}</span>
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
                    from { opacity: 0; }
                    to { opacity: 1; }
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