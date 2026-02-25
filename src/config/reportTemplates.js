/**
 * ==========================================
 * DEPARTMENT REPORT TEMPLATES
 * Configuration des modèles de rapports par département
 * ==========================================
 */

export const DEPARTMENT_REPORT_TEMPLATES = {
    // 1. Direction Générale
    DG: {
        id: 1,
        name: 'Direction Générale',
        fields: [
            {
                key: 'synthese_globale',
                label: 'Synthèse Globale',
                type: 'textarea',
                required: true,
                rows: 8,
                placeholder: 'Vue d\'ensemble de la période...',
            },
            {
                key: 'objectifs_atteints',
                label: 'Objectifs Atteints',
                type: 'list',
                required: true,
                placeholder: 'Ajouter un objectif...',
            },
            {
                key: 'indicateurs_cles',
                label: 'Indicateurs Clés',
                type: 'grid',
                required: true,
                columns: [
                    { key: 'indicateur', label: 'Indicateur', type: 'text' },
                    { key: 'valeur', label: 'Valeur', type: 'number' },
                    { key: 'cible', label: 'Cible', type: 'number' },
                    { key: 'ecart', label: 'Écart (%)', type: 'number' },
                ],
            },
            {
                key: 'decisions_strategiques',
                label: 'Décisions Stratégiques',
                type: 'textarea',
                required: false,
                rows: 5,
            },
        ],
    },

    // 2. Comptabilité
    COMPTA: {
        id: 2,
        name: 'Comptabilité',
        fields: [
            {
                key: 'chiffre_affaires',
                label: 'Chiffre d\'Affaires (FCFA)',
                type: 'number',
                required: true,
                placeholder: '0',
            },
            {
                key: 'charges_totales',
                label: 'Charges Totales (FCFA)',
                type: 'number',
                required: true,
                placeholder: '0',
            },
            {
                key: 'resultat_net',
                label: 'Résultat Net (FCFA)',
                type: 'number',
                required: true,
                calculated: (data) => (data.chiffre_affaires || 0) - (data.charges_totales || 0),
            },
            {
                key: 'tresorerie',
                label: 'Trésorerie (FCFA)',
                type: 'number',
                required: true,
            },
            {
                key: 'ecritures_comptables',
                label: 'Nombre d\'Écritures',
                type: 'number',
                required: true,
            },
            {
                key: 'factures_emises',
                label: 'Factures Émises',
                type: 'number',
                required: true,
            },
            {
                key: 'factures_recues',
                label: 'Factures Reçues',
                type: 'number',
                required: true,
            },
            {
                key: 'observations_comptables',
                label: 'Observations',
                type: 'textarea',
                required: false,
                rows: 5,
            },
        ],
    },

    // 3. Bureau d'Étude
    BUREAU_ETUDE: {
        id: 3,
        name: 'Bureau d\'Étude',
        fields: [
            {
                key: 'projets_en_cours',
                label: 'Projets en Cours',
                type: 'number',
                required: true,
            },
            {
                key: 'projets_termines',
                label: 'Projets Terminés',
                type: 'number',
                required: true,
            },
            {
                key: 'etudes_realisees',
                label: 'Études Réalisées',
                type: 'list',
                required: true,
                placeholder: 'Ajouter une étude...',
            },
            {
                key: 'innovations',
                label: 'Innovations / Améliorations',
                type: 'textarea',
                required: false,
                rows: 5,
            },
            {
                key: 'budget_recherche',
                label: 'Budget Recherche (FCFA)',
                type: 'number',
                required: false,
            },
        ],
    },

    // 4. Maintenance
    MAINTENANCE: {
        id: 4,
        name: 'Maintenance',
        fields: [
            {
                key: 'interventions_preventives',
                label: 'Interventions Préventives',
                type: 'number',
                required: true,
            },
            {
                key: 'interventions_curatives',
                label: 'Interventions Curatives',
                type: 'number',
                required: true,
            },
            {
                key: 'machines_en_panne',
                label: 'Machines en Panne',
                type: 'number',
                required: true,
            },
            {
                key: 'cout_total_maintenance',
                label: 'Coût Total (FCFA)',
                type: 'number',
                required: true,
            },
            {
                key: 'pieces_changees',
                label: 'Pièces Changées',
                type: 'list',
                required: false,
                placeholder: 'Ajouter une pièce...',
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

    // 5. Filature/Production
    FILATURE: {
        id: 5,
        name: 'Filature',
        fields: [
            {
                key: 'production_totale',
                label: 'Production Totale (kg)',
                type: 'number',
                required: true,
            },
            {
                key: 'production_conforme',
                label: 'Production Conforme (kg)',
                type: 'number',
                required: true,
            },
            {
                key: 'taux_conformite',
                label: 'Taux de Conformité (%)',
                type: 'number',
                calculated: (data) =>
                    data.production_totale > 0
                        ? ((data.production_conforme / data.production_totale) * 100).toFixed(2)
                        : 0,
            },
            {
                key: 'pannes_production',
                label: 'Temps de Panne (heures)',
                type: 'number',
                required: true,
            },
            {
                key: 'consommation_matieres',
                label: 'Consommation Matières (kg)',
                type: 'number',
                required: true,
            },
            {
                key: 'observations_production',
                label: 'Observations',
                type: 'textarea',
                required: false,
                rows: 5,
            },
        ],
    },

    // 6. Impression
    IMPRESSION: {
        id: 6,
        name: 'Impression',
        fields: [
            {
                key: 'commandes_traitees',
                label: 'Commandes Traitées',
                type: 'number',
                required: true,
            },
            {
                key: 'metres_imprimes',
                label: 'Mètres Imprimés',
                type: 'number',
                required: true,
            },
            {
                key: 'nouveaux_motifs',
                label: 'Nouveaux Motifs Créés',
                type: 'number',
                required: false,
            },
            {
                key: 'consommation_encre',
                label: 'Consommation Encre (L)',
                type: 'number',
                required: true,
            },
            {
                key: 'taux_defauts',
                label: 'Taux de Défauts (%)',
                type: 'number',
                required: true,
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

    // 7. Stock
    STOCK: {
        id: 7,
        name: 'Stock',
        fields: [
            {
                key: 'entrees_stock',
                label: 'Entrées Stock',
                type: 'number',
                required: true,
            },
            {
                key: 'sorties_stock',
                label: 'Sorties Stock',
                type: 'number',
                required: true,
            },
            {
                key: 'stock_actuel',
                label: 'Stock Actuel',
                type: 'number',
                required: true,
            },
            {
                key: 'alertes_rupture',
                label: 'Alertes Rupture',
                type: 'number',
                required: true,
            },
            {
                key: 'valorisation_stock',
                label: 'Valorisation Stock (FCFA)',
                type: 'number',
                required: true,
            },
            {
                key: 'inventaires_realises',
                label: 'Inventaires Réalisés',
                type: 'number',
                required: false,
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

    // 8. Achats
    ACHAT: {
        id: 8,
        name: 'Achats',
        fields: [
            {
                key: 'demandes_achat',
                label: 'Demandes d\'Achat (DA)',
                type: 'number',
                required: true,
            },
            {
                key: 'bons_commande',
                label: 'Bons de Commande (BC)',
                type: 'number',
                required: true,
            },
            {
                key: 'montant_total_achats',
                label: 'Montant Total Achats (FCFA)',
                type: 'number',
                required: true,
            },
            {
                key: 'nouveaux_fournisseurs',
                label: 'Nouveaux Fournisseurs',
                type: 'number',
                required: false,
            },
            {
                key: 'delai_moyen_livraison',
                label: 'Délai Moyen Livraison (jours)',
                type: 'number',
                required: false,
            },
            {
                key: 'litiges_fournisseurs',
                label: 'Litiges Fournisseurs',
                type: 'number',
                required: false,
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

    // 9. Commercial
    COMMERCIAL: {
        id: 9,
        name: 'Commercial',
        fields: [
            {
                key: 'chiffre_affaires',
                label: 'Chiffre d\'Affaires (FCFA)',
                type: 'number',
                required: true,
            },
            {
                key: 'nouveaux_clients',
                label: 'Nouveaux Clients',
                type: 'number',
                required: true,
            },
            {
                key: 'commandes_recues',
                label: 'Commandes Reçues',
                type: 'number',
                required: true,
            },
            {
                key: 'commandes_livrees',
                label: 'Commandes Livrées',
                type: 'number',
                required: true,
            },
            {
                key: 'taux_satisfaction',
                label: 'Taux Satisfaction (%)',
                type: 'number',
                required: false,
            },
            {
                key: 'reclamations',
                label: 'Réclamations',
                type: 'number',
                required: false,
            },
            {
                key: 'actions_marketing',
                label: 'Actions Marketing',
                type: 'textarea',
                required: false,
                rows: 5,
            },
        ],
    },

    // 10. IT
    IT: {
        id: 10,
        name: 'Informatique',
        fields: [
            {
                key: 'tickets_ouverts',
                label: 'Tickets Ouverts',
                type: 'number',
                required: true,
            },
            {
                key: 'tickets_resolus',
                label: 'Tickets Résolus',
                type: 'number',
                required: true,
            },
            {
                key: 'delai_moyen_resolution',
                label: 'Délai Moyen Résolution (h)',
                type: 'number',
                required: false,
            },
            {
                key: 'incidents_majeurs',
                label: 'Incidents Majeurs',
                type: 'number',
                required: true,
            },
            {
                key: 'sauvegardes_realisees',
                label: 'Sauvegardes Réalisées',
                type: 'number',
                required: true,
            },
            {
                key: 'mises_a_jour',
                label: 'Mises à Jour Effectuées',
                type: 'number',
                required: false,
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

    // 11. RH
    RH: {
        id: 11,
        name: 'Ressources Humaines',
        fields: [
            {
                key: 'effectif_total',
                label: 'Effectif Total',
                type: 'number',
                required: true,
            },
            {
                key: 'nouvelles_embauches',
                label: 'Nouvelles Embauches',
                type: 'number',
                required: true,
            },
            {
                key: 'departs',
                label: 'Départs',
                type: 'number',
                required: true,
            },
            {
                key: 'conges_valides',
                label: 'Congés Validés',
                type: 'number',
                required: true,
            },
            {
                key: 'formations_dispensees',
                label: 'Formations Dispensées',
                type: 'number',
                required: false,
            },
            {
                key: 'masse_salariale',
                label: 'Masse Salariale (FCFA)',
                type: 'number',
                required: true,
            },
            {
                key: 'absenteisme',
                label: 'Taux d\'Absentéisme (%)',
                type: 'number',
                required: false,
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

/**
 * Get template for department
 */
export const getTemplateForDepartment = (departmentCode) => {
    return DEPARTMENT_REPORT_TEMPLATES[departmentCode] || null;
};

/**
 * Get field configuration
 */
export const getFieldConfig = (departmentCode, fieldKey) => {
    const template = DEPARTMENT_REPORT_TEMPLATES[departmentCode];
    if (!template) return null;

    return template.fields.find((f) => f.key === fieldKey);
};

/**
 * Validate report data against template
 */
export const validateReportData = (departmentCode, data) => {
    const template = DEPARTMENT_REPORT_TEMPLATES[departmentCode];
    if (!template) return { valid: false, errors: ['Template non trouvé'] };

    const errors = [];

    template.fields.forEach((field) => {
        if (field.required && !data[field.key]) {
            errors.push(`${field.label} est requis`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
    };
};

/**
 * Calculate derived fields
 */
export const calculateDerivedFields = (departmentCode, data) => {
    const template = DEPARTMENT_REPORT_TEMPLATES[departmentCode];
    if (!template) return data;

    const calculatedData = { ...data };

    template.fields.forEach((field) => {
        if (field.calculated && typeof field.calculated === 'function') {
            calculatedData[field.key] = field.calculated(calculatedData);
        }
    });

    return calculatedData;
};

export default DEPARTMENT_REPORT_TEMPLATES;