import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Calendar, Save, AlertCircle, CheckCircle, Database } from 'lucide-react';
import axios from 'axios';

// Templates de saisie par département
const DEPARTMENT_DATA_TEMPLATES = {
    // IMPRESSION
    IMPRESSION: {
        endpoint: '/api/impression-data',
        title: 'Saisie Données Impression',
        icon: '🖨️',
        fields: [
            {
                key: 'date',
                label: 'Date',
                type: 'date',
                required: true,
                defaultValue: () => new Date().toISOString().split('T')[0],
            },
            {
                key: 'effectif',
                label: 'Effectif du Jour',
                type: 'number',
                required: true,
                min: 0,
                placeholder: '49',
            },
            {
                key: 'production_1er_choix',
                label: 'Production 1er Choix (pièces)',
                type: 'number',
                required: true,
                min: 0,
                help: 'Sans tâches ni décalage de dessin',
            },
            {
                key: 'production_2eme_choix',
                label: 'Production 2ème Choix (pièces)',
                type: 'number',
                required: true,
                min: 0,
                help: 'Défauts mineurs avec petites tâches',
            },
            {
                key: 'production_3eme_choix',
                label: 'Production 3ème Choix (pièces)',
                type: 'number',
                required: true,
                min: 0,
                help: 'Défauts majeurs (tâches, dessin décalé)',
            },
            {
                key: 'chiffon_kg',
                label: 'Chiffon - Tissus Déchirés (kg)',
                type: 'number',
                required: true,
                min: 0,
                step: 0.01,
            },
            {
                key: 'metres_imprimes',
                label: 'Mètres Imprimés Total',
                type: 'number',
                required: true,
                min: 0,
            },
            {
                key: 'remarques',
                label: 'Remarques / Observations',
                type: 'textarea',
                required: false,
                rows: 4,
                placeholder: 'Notes sur la production, incidents, pannes...',
            },
        ],
        machinesSection: {
            title: 'État des Machines',
            fields: [
                { key: 'tondeuse', label: 'Tondeuse (m)' },
                { key: 'caustic', label: 'Caustic (m)' },
                { key: 'blanch', label: 'Blanch (m)' },
                { key: 'laveuse_1', label: 'Laveuse 1 (m)' },
                { key: 'rotative_1', label: 'Rotative 1 (m)' },
                { key: 'vapo', label: 'Vapo (m)' },
                { key: 'rame_1', label: 'Rame 1 (m)' },
                { key: 'pliseuse_calandre', label: 'Pliseuse/Calandre (m)' },
            ],
        },
    },

    // CONFECTION
    CONFECTION: {
        endpoint: '/api/confection-data',
        title: 'Saisie Données Confection',
        icon: '✂️',
        fields: [
            {
                key: 'date',
                label: 'Date',
                type: 'date',
                required: true,
                defaultValue: () => new Date().toISOString().split('T')[0],
            },
            {
                key: 'effectif_couturieres',
                label: 'Effectif Couturières',
                type: 'number',
                required: true,
                min: 0,
                placeholder: '16',
            },
            {
                key: 'effectif_coupeurs',
                label: 'Effectif Coupeurs',
                type: 'number',
                required: true,
                min: 0,
                placeholder: '2',
            },
            {
                key: 'objectif_global',
                label: 'Objectif Global (Quantité)',
                type: 'number',
                required: true,
                min: 0,
            },
            {
                key: 'qte_realisee',
                label: 'Quantité Réalisée',
                type: 'number',
                required: true,
                min: 0,
            },
            {
                key: 'taux_qualite',
                label: 'Taux Qualité (%)',
                type: 'number',
                required: true,
                min: 0,
                max: 100,
                step: 0.1,
            },
            {
                key: 'taux_non_qualite',
                label: 'Taux Non-Qualité (%)',
                type: 'number',
                required: true,
                min: 0,
                max: 100,
                step: 0.1,
            },
            {
                key: 'dechet_kg',
                label: 'Déchet Moyen (kg)',
                type: 'number',
                required: true,
                min: 0,
                step: 0.01,
            },
            {
                key: 'taux_absenteisme',
                label: 'Taux d\'Absentéisme (%)',
                type: 'number',
                required: true,
                min: 0,
                max: 100,
                step: 0.1,
            },
            {
                key: 'articles_produits',
                label: 'Articles Produits (JSON)',
                type: 'textarea',
                required: false,
                rows: 3,
                placeholder: '["Ensemble homme (14)", "Blouses (6)", "Pantalons (2)"]',
                help: 'Liste des articles produits avec quantités',
            },
            {
                key: 'commandes_clients',
                label: 'Commandes Clients (JSON)',
                type: 'textarea',
                required: false,
                rows: 2,
                placeholder: '["SACAM", "Showroom"]',
            },
            {
                key: 'commentaires',
                label: 'Commentaires',
                type: 'textarea',
                required: false,
                rows: 4,
                placeholder: 'Détails production, finitions, formations...',
            },
        ],
    },

    // TEINTURE
    TEINTURE: {
        endpoint: '/api/teinture-data',
        title: 'Saisie Données Teinture',
        icon: '🎨',
        fields: [
            {
                key: 'date',
                label: 'Date',
                type: 'date',
                required: true,
                defaultValue: () => new Date().toISOString().split('T')[0],
            },
            {
                key: 'effectif',
                label: 'Effectif du Jour',
                type: 'number',
                required: true,
                min: 0,
                placeholder: '5',
            },
            {
                key: 'produit_fabrique',
                label: 'Produit Fabriqué',
                type: 'text',
                required: true,
                placeholder: 'F40X2',
            },
            {
                key: 'objectif_paquet',
                label: 'Objectif (Paquets)',
                type: 'number',
                required: true,
                min: 0,
            },
            {
                key: 'qte_realisee',
                label: 'Quantité Réalisée',
                type: 'number',
                required: true,
                min: 0,
            },
            {
                key: 'statut_production',
                label: 'Statut Production',
                type: 'select',
                required: true,
                options: ['Séchage', 'Trempage', 'Fini', 'En cours'],
            },
            {
                key: 'poids_theorique',
                label: 'Poids Théorique (kg)',
                type: 'number',
                required: true,
                min: 0,
                step: 0.001,
            },
            {
                key: 'performance',
                label: 'Performance (%)',
                type: 'number',
                required: true,
                min: 0,
                max: 100,
                step: 0.1,
            },
            {
                key: 'taux_qualite',
                label: 'Taux Qualité (%)',
                type: 'number',
                required: true,
                min: 0,
                max: 100,
                step: 0.1,
            },
            {
                key: 'taux_non_conformite',
                label: 'Taux Non-Conformité (%)',
                type: 'number',
                required: true,
                min: 0,
                max: 100,
                step: 0.1,
            },
            {
                key: 'taux_absenteisme',
                label: 'Taux d\'Absentéisme (%)',
                type: 'number',
                required: true,
                min: 0,
                max: 100,
                step: 0.1,
            },
            {
                key: 'dechet_m3',
                label: 'Déchet (m³)',
                type: 'number',
                required: true,
                min: 0,
                step: 0.01,
            },
            {
                key: 'temps_travaille',
                label: 'Temps Travaillé (H)',
                type: 'number',
                required: true,
                min: 0,
                step: 0.5,
            },
            {
                key: 'qte_emballe',
                label: 'Quantité Emballée (kg)',
                type: 'number',
                required: false,
                min: 0,
            },
            {
                key: 'pannes_incidents',
                label: 'Pannes / Incidents (JSON)',
                type: 'textarea',
                required: false,
                rows: 3,
                placeholder: '["Blocage Atnas (30 min)", "Manque vapeur"]',
            },
            {
                key: 'remarques',
                label: 'Remarques',
                type: 'textarea',
                required: false,
                rows: 4,
                placeholder: 'Détails production, problèmes rencontrés...',
            },
        ],
    },

    // Départements génériques (DG, RH, etc.)
    DEFAULT: {
        endpoint: '/api/department-data',
        title: 'Saisie Données Département',
        icon: '📊',
        fields: [
            {
                key: 'date',
                label: 'Date',
                type: 'date',
                required: true,
                defaultValue: () => new Date().toISOString().split('T')[0],
            },
            {
                key: 'indicateur_1',
                label: 'Indicateur Principal',
                type: 'number',
                required: true,
                min: 0,
            },
            {
                key: 'indicateur_2',
                label: 'Indicateur Secondaire',
                type: 'number',
                required: false,
                min: 0,
            },
            {
                key: 'observations',
                label: 'Observations',
                type: 'textarea',
                required: false,
                rows: 5,
            },
        ],
    },
};

export default function DataEntry() {
    const { user } = useAuth();
    const [template, setTemplate] = useState(null);
    const [formData, setFormData] = useState({});
    const [machinesData, setMachinesData] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Charger le template selon le département
        const deptCode = user?.department?.code?.toUpperCase() || 'DEFAULT';
        const tpl = DEPARTMENT_DATA_TEMPLATES[deptCode] || DEPARTMENT_DATA_TEMPLATES.DEFAULT;
        setTemplate(tpl);

        // Initialiser formData avec valeurs par défaut
        const initialData = {};
        tpl.fields.forEach((field) => {
            if (field.defaultValue) {
                initialData[field.key] = field.defaultValue();
            }
        });
        setFormData(initialData);

        // Initialiser machines si Impression
        if (tpl.machinesSection) {
            const initialMachines = {};
            tpl.machinesSection.fields.forEach((field) => {
                initialMachines[field.key] = '';
            });
            setMachinesData(initialMachines);
        }
    }, [user]);

    const handleChange = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
        setError('');
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
        setError('');
        setSuccess(false);

        try {
            // Validation
            const requiredFields = template.fields.filter((f) => f.required);
            for (const field of requiredFields) {
                if (!formData[field.key]) {
                    throw new Error(`${field.label} est requis`);
                }
            }

            // Préparer payload
            const payload = { ...formData };

            // Ajouter machines si Impression
            if (template.machinesSection) {
                payload.machines_data = machinesData;
            }

            // Parser JSON fields
            ['articles_produits', 'commandes_clients', 'pannes_incidents'].forEach((key) => {
                if (payload[key]) {
                    try {
                        payload[key] = JSON.parse(payload[key]);
                    } catch {
                        // Garder comme string si parse échoue
                    }
                }
            });

            // Envoyer au backend
            await axios.post(template.endpoint, payload);

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                // Reset form
                const initialData = {};
                template.fields.forEach((field) => {
                    if (field.defaultValue) {
                        initialData[field.key] = field.defaultValue();
                    } else {
                        initialData[field.key] = '';
                    }
                });
                setFormData(initialData);

                if (template.machinesSection) {
                    const initialMachines = {};
                    template.machinesSection.fields.forEach((field) => {
                        initialMachines[field.key] = '';
                    });
                    setMachinesData(initialMachines);
                }
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    if (!template) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-3">
                    <div className="text-4xl">{template.icon}</div>
                    <div>
                        <h1 className="text-3xl font-bold">{template.title}</h1>
                        <p className="text-cyan-100 mt-1">
                            {user?.department?.name || 'Département'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                        <p className="font-semibold text-green-900">Données enregistrées avec succès !</p>
                        <p className="text-sm text-green-700">Les données ont été ajoutées à la base.</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-center space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <div>
                        <p className="font-semibold text-red-900">Erreur</p>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-6">
                {/* Main Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {template.fields.map((field) => (
                        <div
                            key={field.key}
                            className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                        >
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            {field.type === 'textarea' ? (
                                <textarea
                                    value={formData[field.key] || ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    rows={field.rows || 3}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            ) : field.type === 'select' ? (
                                <select
                                    value={formData[field.key] || ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    required={field.required}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="">Sélectionner...</option>
                                    {field.options.map((opt) => (
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
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            )}

                            {field.help && (
                                <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Machines Section (Impression only) */}
                {template.machinesSection && (
                    <div className="pt-6 border-t">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Database className="w-5 h-5 mr-2 text-cyan-600" />
                            {template.machinesSection.title}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {template.machinesSection.fields.map((field) => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {field.label}
                                    </label>
                                    <input
                                        type="number"
                                        value={machinesData[field.key] || ''}
                                        onChange={(e) => handleMachineChange(field.key, e.target.value)}
                                        min="0"
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Enregistrer les Données
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                    💡 <strong>Astuce:</strong> Les données saisies ici seront utilisées pour générer
                    vos rapports avec calculs automatiques (totaux, moyennes, graphiques).
                </p>
            </div>
        </div>
    );
}