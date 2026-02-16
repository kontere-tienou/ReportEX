import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/api';
import { ArrowLeft, Save, Send, Calendar } from 'lucide-react';

const NewUser = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState({
        period_start: '',
        period_end: '',
        data: {}
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const response = await reportService.getTemplates(user.department.id);
            setTemplates(response.data.templates);
            if (response.data.templates.length > 0) {
                setSelectedTemplate(response.data.templates[0]);
            }
        } catch (error) {
            console.error('Erreur chargement templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateChange = (templateId) => {
        const template = templates.find(t => t.id === parseInt(templateId));
        setSelectedTemplate(template);
        setFormData({ ...formData, data: {} });
    };

    const handleFieldChange = (fieldId, value) => {
        setFormData({
            ...formData,
            data: {
                ...formData.data,
                [fieldId]: value
            }
        });
    };

    const handleSubmit = async (submitForValidation = false) => {
        setSaving(true);
        try {
            // Créer le rapport
            const response = await reportService.createReport({
                template_id: selectedTemplate.id,
                period_start: formData.period_start,
                period_end: formData.period_end,
                data: formData.data
            });

            // Si soumission pour validation
            if (submitForValidation && response.data.report) {
                await reportService.submitReport(response.data.report.id);
            }

            navigate('/reports');
        } catch (error) {
            console.error('Erreur sauvegarde rapport:', error);
            alert('Erreur lors de la sauvegarde du rapport');
        } finally {
            setSaving(false);
        }
    };

    const renderField = (field) => {
        const value = formData.data[field.id] || '';

        switch (field.type) {
            case 'number':
                return (
                    <div key={field.id} className="mb-4">
                        <label className="label">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                            {field.unit && <span className="text-gray-500 text-sm ml-1">({field.unit})</span>}
                        </label>
                        <input
                            type="number"
                            className="input-field"
                            value={value}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            required={field.required}
                        />
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field.id} className="mb-4">
                        <label className="label">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                            className="input-field"
                            rows="4"
                            value={value}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            required={field.required}
                        ></textarea>
                    </div>
                );

            default:
                return (
                    <div key={field.id} className="mb-4">
                        <label className="label">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            value={value}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            required={field.required}
                        />
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (templates.length === 0) {
        return (
            <div className="card text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun template disponible
                </h3>
                <p className="text-gray-600">
                    Contactez l'administrateur pour configurer les templates de rapport
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/reports')}
                    className="btn-secondary"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Nouveau Rapport</h1>
                    <p className="text-gray-600 mt-1">{user.department.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulaire */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Sélection du template */}
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Type de rapport
                        </h2>
                        <select
                            className="input-field"
                            value={selectedTemplate?.id || ''}
                            onChange={(e) => handleTemplateChange(e.target.value)}
                        >
                            {templates.map((template) => (
                                <option key={template.id} value={template.id}>
                                    {template.name} ({template.frequency})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Période */}
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                            Période du rapport
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Date de début *</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={formData.period_start}
                                    onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Date de fin *</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={formData.period_end}
                                    onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Champs dynamiques */}
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Données du rapport
                        </h2>
                        {selectedTemplate && selectedTemplate.fields.map(field => renderField(field))}
                    </div>
                </div>

                {/* Panneau latéral */}
                <div className="space-y-6">
                    <div className="card sticky top-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={saving || !formData.period_start || !formData.period_end}
                                className="w-full btn-secondary flex items-center justify-center disabled:opacity-50"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                Sauvegarder comme brouillon
                            </button>
                            <button
                                onClick={() => handleSubmit(true)}
                                disabled={saving || !formData.period_start || !formData.period_end}
                                className="w-full btn-primary flex items-center justify-center disabled:opacity-50"
                            >
                                <Send className="w-5 h-5 mr-2" />
                                Soumettre pour validation
                            </button>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">📋 Aide</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Les champs marqués * sont obligatoires</li>
                                <li>• Sauvegardez régulièrement votre travail</li>
                                <li>• Une fois soumis, le rapport sera envoyé pour validation</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewReport;