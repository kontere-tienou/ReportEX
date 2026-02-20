import { useState } from "react";
import { Calendar, Save, Send, X, FileText, Eye, Lock, Globe, AlertCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { reportService } from "../../../services/api.js";
import { useToast, ToastContainer } from "../../../components/ui/Toast.jsx";

const VISIBILITY = [
    {
        value: "private",
        label: "Privé",
        description: "Direction seulement",
        icon: Lock,
        color: "text-amber-600"
    },
    {
        value: "public",
        label: "Public",
        description: "Accès sur autorisation",
        icon: Globe,
        color: "text-green-600"
    },
];

export default function NewReportModal({ open, onClose, onCreated }) {
    const { user } = useAuth();
    const { toasts, addToast, removeToast } = useToast();

    const [formData, setFormData] = useState({
        period_start: "",
        period_end: "",
        visibility: "private",
        interventions: "",
        cout_total: "",
        observations: "",
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    if (!open) return null;

    const validate = () => {
        const newErrors = {};

        if (!formData.period_start) {
            newErrors.period_start = "Date de début requise";
        }

        if (!formData.period_end) {
            newErrors.period_end = "Date de fin requise";
        }

        if (formData.period_start && formData.period_end) {
            if (new Date(formData.period_start) > new Date(formData.period_end)) {
                newErrors.period_end = "La date de fin doit être après la date de début";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const canSubmit = formData.period_start && formData.period_end;

    const handleSubmit = async (submitForValidation) => {
        if (!validate()) {
            addToast("Veuillez remplir tous les champs obligatoires", "error");
            return;
        }

        setSaving(true);

        try {
            const payload = {
                period_start: formData.period_start,
                period_end: formData.period_end,
                visibility: formData.visibility,
                data: {
                    interventions: formData.interventions,
                    cout_total: formData.cout_total,
                    observations: formData.observations,
                },
            };

            const res = await reportService.createReport(payload);
            const report = res.data.report;

            if (submitForValidation && report?.id) {
                await reportService.submitReport(report.id);
                addToast("Rapport créé et soumis pour validation !", "success");
            } else {
                addToast("Rapport enregistré comme brouillon", "success");
            }

            onCreated?.();
            onClose?.();
        } catch (e) {
            const errorMsg = e?.response?.data?.message || "Erreur lors de la sauvegarde";
            addToast(errorMsg, "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div
                    className="absolute inset-0"
                    onClick={onClose}
                />

                <div className="fixed left-1/2 top-1/2 w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-white rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header avec gradient */}
                        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            Nouveau Rapport
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

                        {/* Body avec scroll */}
                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            {/* Alert info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-blue-900 font-medium">
                                        Créez un rapport pour la période sélectionnée
                                    </p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Vous pourrez soumettre le rapport pour validation ou le sauvegarder comme brouillon
                                    </p>
                                </div>
                            </div>

                            {/* Visibilité - Cards */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                    Visibilité du Rapport
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    {VISIBILITY.map((v) => {
                                        const Icon = v.icon;
                                        const isSelected = formData.visibility === v.value;

                                        return (
                                            <button
                                                key={v.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, visibility: v.value })}
                                                className={`
                          relative p-4 rounded-xl border-2 transition-all
                          ${isSelected
                                                    ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-200'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }
                        `}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <Icon className={`w-6 h-6 ${isSelected ? 'text-cyan-600' : 'text-gray-400'}`} />
                                                    <div className="flex-1 text-left">
                                                        <p className={`font-semibold ${isSelected ? 'text-cyan-900' : 'text-gray-900'}`}>
                                                            {v.label}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-0.5">
                                                            {v.description}
                                                        </p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-5 h-5 bg-cyan-600 rounded-full flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Période - Improved */}
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
                                            className={`
                        w-full px-4 py-2.5 rounded-lg border-2 transition-all
                        focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500
                        ${errors.period_start ? 'border-red-500' : 'border-gray-200'}
                      `}
                                            value={formData.period_start}
                                            onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
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
                                            className={`
                        w-full px-4 py-2.5 rounded-lg border-2 transition-all
                        focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500
                        ${errors.period_end ? 'border-red-500' : 'border-gray-200'}
                      `}
                                            value={formData.period_end}
                                            onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                                        />
                                        {errors.period_end && (
                                            <p className="text-xs text-red-600 mt-1">{errors.period_end}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Champs du rapport */}
                            <div className="space-y-5">
                                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
                                    Données du Rapport
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre d'interventions
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Ex: 15"
                                            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 transition-all"
                                            value={formData.interventions}
                                            onChange={(e) => setFormData({ ...formData, interventions: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Coût total (FCFA)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Ex: 500000"
                                            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 transition-all"
                                            value={formData.cout_total}
                                            onChange={(e) => setFormData({ ...formData, cout_total: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Observations / Commentaires
                                    </label>
                                    <textarea
                                        rows={5}
                                        placeholder="Décrivez les points importants de la période..."
                                        className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 transition-all resize-none"
                                        value={formData.observations}
                                        onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer avec actions */}
                        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                    * Champs obligatoires
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleSubmit(false)}
                                        disabled={!canSubmit || saving}
                                        className="
                      px-5 py-2.5 rounded-lg border-2 border-gray-300
                      hover:bg-gray-100 transition-all font-medium
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center space-x-2
                    "
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Brouillon</span>
                                    </button>

                                    <button
                                        onClick={() => handleSubmit(true)}
                                        disabled={!canSubmit || saving}
                                        className="
                      px-5 py-2.5 rounded-lg
                      bg-gradient-to-r from-cyan-600 to-blue-600
                      hover:from-cyan-700 hover:to-blue-700
                      text-white font-semibold transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed
                      shadow-lg shadow-cyan-500/30
                      flex items-center space-x-2
                    "
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>{saving ? "Envoi..." : "Soumettre"}</span>
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
}