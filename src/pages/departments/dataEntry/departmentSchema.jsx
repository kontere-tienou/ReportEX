
export const FALLBACK_SCHEMAS = {
    // ==========================================
    // IMPRESSION
    // ==========================================
    IMPRESSION: {
        endpoint: '/api/impression-data',
        tableName: 'impression_data',
        icon: '🖨️',
        title: 'Saisie Données Impression',
        fields: [
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'effectif', label: 'Effectif du Jour', type: 'number', required: true, min: 0 },
            { key: 'production_1er_choix', label: 'Production 1er Choix (pièces)', type: 'number', required: true, min: 0 },
            { key: 'production_2eme_choix', label: 'Production 2ème Choix (pièces)', type: 'number', required: true, min: 0 },
            { key: 'production_3eme_choix', label: 'Production 3ème Choix (pièces)', type: 'number', required: true, min: 0 },
            { key: 'chiffon_kg', label: 'Chiffon - Tissus Déchirés (kg)', type: 'number', required: true, min: 0, step: 0.01 },
            { key: 'metres_imprimes', label: 'Mètres Imprimés Total', type: 'number', required: true, min: 0 },
            { key: 'remarques', label: 'Remarques / Observations', type: 'textarea', required: false, rows: 4 },
        ],
        machines: [
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

    // ==========================================
    // CONFECTION
    // ==========================================
    CONFECTION: {
        endpoint: '/api/confection-data',
        tableName: 'confection_data',
        icon: '✂️',
        title: 'Saisie Données Confection',
        fields: [
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'effectif_couturieres', label: 'Effectif Couturières', type: 'number', required: true, min: 0 },
            { key: 'effectif_coupeurs', label: 'Effectif Coupeurs', type: 'number', required: true, min: 0 },
            { key: 'objectif_global', label: 'Objectif Global (Quantité)', type: 'number', required: true, min: 0 },
            { key: 'qte_realisee', label: 'Quantité Réalisée', type: 'number', required: true, min: 0 },
            { key: 'taux_qualite', label: 'Taux Qualité (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'taux_non_qualite', label: 'Taux Non-Qualité (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'dechet_kg', label: 'Déchet Moyen (kg)', type: 'number', required: true, min: 0, step: 0.01 },
            { key: 'taux_absenteisme', label: 'Taux d\'Absentéisme (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'articles_produits', label: 'Articles Produits (JSON)', type: 'textarea', required: false, rows: 3 },
            { key: 'commandes_clients', label: 'Commandes Clients (JSON)', type: 'textarea', required: false, rows: 2 },
            { key: 'commentaires', label: 'Commentaires', type: 'textarea', required: false, rows: 4 },
        ],
    },

    // ==========================================
    // TEINTURE
    // ==========================================
    TEINTURE: {
        endpoint: '/api/teinture-data',
        tableName: 'teinture_data',
        icon: '🎨',
        title: 'Saisie Données Teinture',
        fields: [
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'effectif', label: 'Effectif du Jour', type: 'number', required: true, min: 0 },
            { key: 'produit_fabrique', label: 'Produit Fabriqué', type: 'text', required: true },
            { key: 'objectif_paquet', label: 'Objectif (Paquets)', type: 'number', required: true, min: 0 },
            { key: 'qte_realisee', label: 'Quantité Réalisée', type: 'number', required: true, min: 0 },
            { key: 'statut_production', label: 'Statut Production', type: 'select', required: true, options: ['Séchage', 'Trempage', 'Fini', 'En cours'] },
            { key: 'poids_theorique', label: 'Poids Théorique (kg)', type: 'number', required: true, min: 0, step: 0.001 },
            { key: 'performance', label: 'Performance (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'taux_qualite', label: 'Taux Qualité (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'taux_non_conformite', label: 'Taux Non-Conformité (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'taux_absenteisme', label: 'Taux d\'Absentéisme (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'dechet_m3', label: 'Déchet (m³)', type: 'number', required: true, min: 0, step: 0.01 },
           // { key: 'temps_travaille', label: 'Temps Travaillé (H)', type: 'number', required: true, min: 0, step: 0.5 },
            { key: 'qte_emballe', label: 'Quantité Emballée (kg)', type: 'number', required: false, min: 0 },
            { key: 'pannes_incidents', label: 'Pannes / Incidents (JSON)', type: 'textarea', required: false, rows: 3 },
            { key: 'remarques', label: 'Remarques', type: 'textarea', required: false, rows: 4 },
        ],
    },

    // ==========================================
    // PRODUCTION
    // ==========================================
    PRODUCTION: {
        endpoint: '/api/production-data',
        tableName: 'production_data',
        icon: '🏭',
        title: 'Saisie Données Production',
        fields: [
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'effectif_total', label: 'Effectif Total', type: 'number', required: true, min: 0 },
            { key: 'objectif_journalier', label: 'Objectif Journalier', type: 'number', required: true, min: 0 },
            { key: 'production_realisee', label: 'Production Réalisée', type: 'number', required: true, min: 0 },
            { key: 'taux_rendement', label: 'Taux de Rendement (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'heures_travaillees', label: 'Heures Travaillées', type: 'number', required: true, min: 0, step: 0.5 },
            { key: 'heures_arret', label: 'Heures d\'Arrêt', type: 'number', required: true, min: 0, step: 0.1 },
            { key: 'taux_disponibilite', label: 'Taux de Disponibilité (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'rebuts_kg', label: 'Rebuts (kg)', type: 'number', required: true, min: 0, step: 0.01 },
            { key: 'incidents_production', label: 'Incidents Production', type: 'textarea', required: false, rows: 4 },
        ],
    },

    // IT
    // ==========================================
    INFORMATIQUE: {
        endpoint: '/api/it-data',
        tableName: 'it_data',
        icon: '💻',
        title: 'Saisie Données IT',
        fields: [
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'nb_incidents_ouverts', label: 'Incidents Ouverts', type: 'number', required: true, min: 0 },
            { key: 'nb_incidents_resolus', label: 'Incidents Résolus', type: 'number', required: true, min: 0 },
            { key: 'nb_incidents_en_cours', label: 'Incidents En Cours', type: 'number', required: true, min: 0 },
            { key: 'temps_resolution_moyen', label: 'Temps Résolution Moyen (h)', type: 'number', required: true, min: 0, step: 0.1 },
            { key: 'taux_disponibilite_systeme', label: 'Taux Disponibilité Système (%)', type: 'number', required: true, min: 0, max: 100, step: 0.01 },
            { key: 'nb_demandes_assistance', label: 'Demandes d\'Assistance', type: 'number', required: true, min: 0 },
            { key: 'taux_satisfaction_utilisateurs', label: 'Taux Satisfaction Utilisateurs (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'maintenance_preventive_effectuee', label: 'Maintenance Préventive', type: 'number', required: false, min: 0 },
            { key: 'incidents_critiques', label: 'Incidents Critiques', type: 'textarea', required: false, rows: 3 },
            { key: 'observations', label: 'Observations', type: 'textarea', required: false, rows: 4 },
        ],
    },

    // RH (RESSOURCES HUMAINES)
    // ==========================================
    RH: {
        endpoint: '/api/rh-data',
        tableName: 'rh_data',
        icon: '👥',
        title: 'Saisie Données RH',
        fields: [
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'effectif_total', label: 'Effectif Total', type: 'number', required: true, min: 0 },
            { key: 'nb_presents', label: 'Nombre de Présents', type: 'number', required: true, min: 0 },
            { key: 'nb_absents', label: 'Nombre d\'Absents', type: 'number', required: true, min: 0 },
            { key: 'taux_absenteisme', label: 'Taux d\'Absentéisme (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'nb_conges', label: 'Nombre de Congés', type: 'number', required: true, min: 0 },
            { key: 'nb_arrets_maladie', label: 'Arrêts Maladie', type: 'number', required: true, min: 0 },
            { key: 'nb_recrutements', label: 'Recrutements', type: 'number', required: false, min: 0 },
            { key: 'nb_departs', label: 'Départs', type: 'number', required: false, min: 0 },
            { key: 'nb_formations', label: 'Formations Réalisées', type: 'number', required: false, min: 0 },
            { key: 'heures_supplementaires', label: 'Heures Supplémentaires', type: 'number', required: false, min: 0, step: 0.5 },
            { key: 'incidents_rh', label: 'Incidents RH', type: 'textarea', required: false, rows: 3 },
            { key: 'observations', label: 'Observations', type: 'textarea', required: false, rows: 4 },
        ],
    },

    // ACHAT
    // ==========================================
    ACHAT: {
        endpoint: '/api/achat-data',
        tableName: 'achat_data',
        icon: '🛒',
        title: 'Saisie Données Achats',
        fields: [
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'nb_commandes_passees', label: 'Commandes Passées', type: 'number', required: true, min: 0 },
            { key: 'nb_commandes_recues', label: 'Commandes Reçues', type: 'number', required: true, min: 0 },
            { key: 'nb_commandes_en_attente', label: 'Commandes En Attente', type: 'number', required: true, min: 0 },
            { key: 'montant_achats_jour', label: 'Montant Achats du Jour (FCFA)', type: 'number', required: true, min: 0, step: 0.01 },
            { key: 'nb_fournisseurs_contactes', label: 'Fournisseurs Contactés', type: 'number', required: true, min: 0 },
            { key: 'delai_moyen_livraison', label: 'Délai Moyen Livraison (jours)', type: 'number', required: true, min: 0, step: 0.1 },
            { key: 'taux_conformite_livraisons', label: 'Taux Conformité Livraisons (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'nb_litiges', label: 'Nombre de Litiges', type: 'number', required: false, min: 0 },
            { key: 'economies_realisees', label: 'Économies Réalisées (FCFA)', type: 'number', required: false, min: 0, step: 0.01 },
            { key: 'fournisseurs_evalues', label: 'Fournisseurs Évalués', type: 'textarea', required: false, rows: 3 },
            { key: 'observations', label: 'Observations', type: 'textarea', required: false, rows: 4 },
        ],
    },
    // BUREAU D'ETUDE
    // ==========================================
    BUREAU_ETUDE: {
        endpoint: '/api/bureau-etude-data',
        tableName: 'bureau_etude_data',
        icon: '📐',
        title: 'Saisie Données Bureau d\'Étude',
        fields: [
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'nb_projets_en_cours', label: 'Projets En Cours', type: 'number', required: true, min: 0 },
            { key: 'nb_projets_termines', label: 'Projets Terminés', type: 'number', required: true, min: 0 },
            { key: 'nb_etudes_lancees', label: 'Études Lancées', type: 'number', required: true, min: 0 },
            { key: 'nb_prototypes_realises', label: 'Prototypes Réalisés', type: 'number', required: true, min: 0 },
            { key: 'nb_modifications_demandees', label: 'Modifications Demandées', type: 'number', required: true, min: 0 },
            { key: 'taux_validation_prototypes', label: 'Taux Validation Prototypes (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'heures_etude', label: 'Heures d\'Étude', type: 'number', required: true, min: 0, step: 0.5 },
            { key: 'delai_moyen_etude', label: 'Délai Moyen Étude (jours)', type: 'number', required: true, min: 0, step: 0.1 },
            { key: 'projets_details', label: 'Détails Projets', type: 'textarea', required: false, rows: 4 },
            { key: 'observations', label: 'Observations', type: 'textarea', required: false, rows: 4 },
        ],
    },

    // COMMERCIAL
    // ==========================================
    COMMERCIAL: {
        endpoint: '/api/commercial-data',
        tableName: 'commercial_data',
        icon: '💼',
        title: 'Saisie Données Commerciales',
        fields: [
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'nb_visites_clients', label: 'Visites Clients', type: 'number', required: true, min: 0 },
            { key: 'nb_devis_emis', label: 'Devis Émis', type: 'number', required: true, min: 0 },
            { key: 'nb_commandes_recues', label: 'Commandes Reçues', type: 'number', required: true, min: 0 },
            { key: 'ca_journalier', label: 'CA Journalier (FCFA)', type: 'number', required: true, min: 0, step: 0.01 },
            { key: 'taux_transformation_devis', label: 'Taux Transformation Devis (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'nb_nouveaux_clients', label: 'Nouveaux Clients', type: 'number', required: true, min: 0 },
            { key: 'nb_clients_perdus', label: 'Clients Perdus', type: 'number', required: false, min: 0 },
            { key: 'nb_reclamations', label: 'Réclamations Clients', type: 'number', required: false, min: 0 },
            { key: 'taux_satisfaction_clients', label: 'Taux Satisfaction (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'actions_commerciales', label: 'Actions Commerciales', type: 'textarea', required: false, rows: 3 },
            { key: 'observations', label: 'Observations', type: 'textarea', required: false, rows: 4 },
        ],
    },
    COMPTABILITE: {
        endpoint: '/api/comptabilite-data',
        tableName: 'comptabilite_data',
        icon: '💰',
        title: 'Saisie Données Comptabilité',
        description: 'Gérez vos données comptables quotidiennes',
        color: 'from-emerald-600 to-teal-600',
        fields: [
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'ca', label: 'Chiffre d\'Affaires (FCFA)', type: 'number', required: true, min: 0, step: 1 },
            { key: 'commandes', label: 'Nombre de Commandes', type: 'number', required: true, min: 0 },
            { key: 'caisse_entrees', label: 'Entrées de Caisse (FCFA)', type: 'number', required: true, min: 0, step: 1 },
            { key: 'caisse_sorties', label: 'Sorties de Caisse (FCFA)', type: 'number', required: true, min: 0, step: 1 },
            { key: 'observations', label: 'Observations', type: 'textarea', required: false, rows: 4 },
        ],
        stats: { total: 0, thisMonth: 0, thisWeek: 0, today: 0 }
    },

    // DG (Direction Générale) - DEFAULT
    // ==========================================
    DG: {
        endpoint: '/api/dg-data',
        tableName: 'dg_data',
        icon: '🎯',
        title: 'Saisie Données Direction Générale',
        fields: [
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'indicateur_performance_global', label: 'Performance Globale (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'ca_cumule', label: 'CA Cumulé (FCFA)', type: 'number', required: true, min: 0, step: 0.01 },
            { key: 'taux_atteinte_objectifs', label: 'Taux Atteinte Objectifs (%)', type: 'number', required: true, min: 0, max: 100, step: 0.1 },
            { key: 'nb_reunions', label: 'Réunions Tenues', type: 'number', required: false, min: 0 },
            { key: 'decisions_strategiques', label: 'Décisions Stratégiques', type: 'textarea', required: false, rows: 4 },
            { key: 'observations', label: 'Observations', type: 'textarea', required: false, rows: 4 },
        ],
    },

    // ==========================================
    // DEFAULT (Fallback pour autres départements)
    // ==========================================
    DEFAULT: {
        endpoint: '/api/department-data',
        tableName: 'department_data',
        icon: '📊',
        title: 'Saisie Données Département',
        fields: [
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'indicateur_1', label: 'Indicateur Principal', type: 'number', required: true, min: 0 },
            { key: 'indicateur_2', label: 'Indicateur Secondaire', type: 'number', required: false, min: 0 },
            { key: 'observations', label: 'Observations', type: 'textarea', required: false, rows: 5 },
        ],
        stats: {
            total: 0,
            thisMonth: 0,
            thisWeek: 0,
            today: 0
        }
    },
};

/**
 * Get fallback schema for department
 */
export const getFallbackSchema = (deptCode) => {
    const code = deptCode?.toUpperCase().replace(/\s+/g, '_') || 'DEFAULT';
    return FALLBACK_SCHEMAS[code] || FALLBACK_SCHEMAS.DEFAULT;
};

/**
 * Get all available departments from fallback
 */
export const getAllFallbackDepartments = () => {
    return Object.keys(FALLBACK_SCHEMAS)
        .filter(key => key !== 'DEFAULT')
        .map(key => ({
            code: key,
            name: key.replace(/_/g, ' '),
            icon: FALLBACK_SCHEMAS[key].icon,
            color: FALLBACK_SCHEMAS[key].color,
            description: FALLBACK_SCHEMAS[key].description
        }));
};