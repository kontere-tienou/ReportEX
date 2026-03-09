// hooks/useBuilderToolbar.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { schemaService } from '../../../dataEntry/service/schemaService';

// Component generator function for all departments
const generateComponents = (deptCode, schema) => {
    if (!schema || !schema.fields) {
        console.warn('No schema or fields found for department:', deptCode);
        return [];
    }

    const numericFields = schema.fields.filter(f => f.type === 'number');
    const components = [];

    // Generate base components for each numeric field
    numericFields.forEach((field) => {
        // Metric: Sum
        components.push({
            id: `sum_${field.key}_${crypto.randomUUID()}`,
            type: 'metric',
            name: `Total ${field.label}`,
            icon: 'TrendingUp',
            description: 'Somme',
            category: 'metric',
            fieldKey: field.key,
            config: {
                calculation: 'sum',
                field: field.key,
                label: `Total ${field.label}`,
                format: field.label?.includes('%') ? 'percent' :
                    field.label?.includes('FCFA') ? 'currency' : 'number',
                tableName: schema.tableName,
            },
        });

        // Metric: Average
        components.push({
            id: `avg_${field.key}_${crypto.randomUUID()}`,
            type: 'metric',
            name: `Moyenne ${field.label}`,
            icon: 'Activity',
            description: 'Moyenne',
            category: 'metric',
            fieldKey: field.key,
            config: {
                calculation: 'avg',
                field: field.key,
                label: `Moyenne ${field.label}`,
                format: field.label?.includes('%') ? 'percent' :
                    field.label?.includes('FCFA') ? 'currency' : 'decimal',
                tableName: schema.tableName,
            },
        });

        // Metric: Max
        components.push({
            id: `max_${field.key}_${crypto.randomUUID()}`,
            type: 'metric',
            name: `Maximum ${field.label}`,
            icon: 'Maximize2',
            description: 'Max',
            category: 'metric',
            fieldKey: field.key,
            config: {
                calculation: 'max',
                field: field.key,
                label: `Max ${field.label}`,
                format: field.label?.includes('%') ? 'percent' :
                    field.label?.includes('FCFA') ? 'currency' : 'number',
                tableName: schema.tableName,
            },
        });

        // Metric: Min
        components.push({
            id: `min_${field.key}_${crypto.randomUUID()}`,
            type: 'metric',
            name: `Minimum ${field.label}`,
            icon: 'Minimize2',
            description: 'Min',
            category: 'metric',
            fieldKey: field.key,
            config: {
                calculation: 'min',
                field: field.key,
                label: `Min ${field.label}`,
                format: field.label?.includes('%') ? 'percent' :
                    field.label?.includes('FCFA') ? 'currency' : 'number',
                tableName: schema.tableName,
            },
        });

        // Chart: Bar (if field is numeric and not a percentage for better visualization)
        if (!field.label?.includes('%')) {
            components.push({
                id: `bar_${field.key}_${crypto.randomUUID()}`,
                type: 'chart',
                name: `Graphique ${field.label}`,
                icon: 'BarChart3',
                description: 'Barres',
                category: 'chart',
                fieldKey: field.key,
                config: {
                    chartType: 'bar',
                    xAxis: 'date',
                    yAxis: field.key,
                    title: `Évolution ${field.label}`,
                    tableName: schema.tableName,
                },
            });

            // Chart: Line
            components.push({
                id: `line_${field.key}_${crypto.randomUUID()}`,
                type: 'chart',
                name: `Tendance ${field.label}`,
                icon: 'LineChart',
                description: 'Ligne',
                category: 'chart',
                fieldKey: field.key,
                config: {
                    chartType: 'line',
                    xAxis: 'date',
                    yAxis: field.key,
                    title: `Tendance ${field.label}`,
                    tableName: schema.tableName,
                },
            });
        }
    });

    // Add department-specific components
    const departmentSpecificComponents = getDepartmentSpecificComponents(deptCode, schema);
    components.push(...departmentSpecificComponents);

    // Add table component
    components.push({
        id: `table_all_${crypto.randomUUID()}`,
        type: 'table',
        name: 'Tableau Détaillé',
        icon: 'Table2',
        description: 'Toutes données',
        category: 'table',
        config: {
            columns: schema.fields?.slice(0, 8).map((f) => f.key) || ['date'],
            limit: 10,
            title: `Détails ${schema.tableName || 'Données'}`,
            tableName: schema.tableName,
        },
    });

    // Add text block
    components.push({
        id: `text_block_${crypto.randomUUID()}`,
        type: 'text',
        name: 'Bloc de Texte',
        icon: 'FileText',
        description: 'Commentaire',
        category: 'text',
        config: {
            content: 'Votre analyse ici...',
        },
    });

    return components;
};

// Department-specific components generator
const getDepartmentSpecificComponents = (deptCode, schema) => {
    const components = [];

    switch (deptCode) {
        case 'IMPRESSION':
            components.push(
                {
                    id: `pie_qualite_${crypto.randomUUID()}`,
                    type: 'chart',
                    name: 'Répartition Qualité',
                    icon: 'PieChart',
                    description: 'Circulaire',
                    category: 'chart',
                    config: {
                        chartType: 'pie',
                        fields: ['production_1er_choix', 'production_2eme_choix', 'production_3eme_choix'],
                        labels: ['1er Choix', '2ème Choix', '3ème Choix'],
                        title: 'Répartition par Qualité',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `production_machines_${crypto.randomUUID()}`,
                    type: 'chart',
                    name: 'Production par Machine',
                    icon: 'BarChart3',
                    description: 'Machines',
                    category: 'chart',
                    config: {
                        chartType: 'bar',
                        xAxis: 'date',
                        yAxis: schema.machines?.map(m => m.key) || [],
                        labels: schema.machines?.map(m => m.label) || [],
                        title: 'Production par Machine',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `taux_qualite_global_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Taux Qualité Global',
                    icon: 'Percent',
                    description: 'Qualité',
                    category: 'metric',
                    config: {
                        calculation: 'percent',
                        field: 'production_1er_choix',
                        reference: 'metres_imprimes',
                        label: 'Taux Qualité Global',
                        format: 'percent',
                        tableName: schema.tableName,
                    },
                }
            );
            break;

        case 'CONFECTION':
            components.push(
                {
                    id: `taux_rendement_conf_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Taux de Rendement',
                    icon: 'Percent',
                    description: 'Objectif vs Réalisé',
                    category: 'metric',
                    config: {
                        calculation: 'percent',
                        field: 'qte_realisee',
                        reference: 'objectif_global',
                        label: 'Taux de Rendement',
                        format: 'percent',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `evolution_qualite_${crypto.randomUUID()}`,
                    type: 'chart',
                    name: 'Évolution Qualité',
                    icon: 'LineChart',
                    description: 'Qualité',
                    category: 'chart',
                    config: {
                        chartType: 'line',
                        xAxis: 'date',
                        yAxis: ['taux_qualite', 'taux_non_qualite'],
                        labels: ['Taux Qualité', 'Taux Non-Qualité'],
                        title: 'Évolution de la Qualité',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `productivite_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Productivité',
                    icon: 'Activity',
                    description: 'Par couturière',
                    category: 'metric',
                    config: {
                        calculation: 'avg_per_worker',
                        field: 'qte_realisee',
                        reference: 'effectif_couturieres',
                        label: 'Productivité par Couturière',
                        format: 'number',
                        tableName: schema.tableName,
                    },
                }
            );
            break;

        case 'TEINTURE':
            components.push(
                {
                    id: `performance_teinture_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Performance Moyenne',
                    icon: 'Activity',
                    description: 'Performance',
                    category: 'metric',
                    config: {
                        calculation: 'avg',
                        field: 'performance',
                        label: 'Performance Moyenne',
                        format: 'percent',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `statut_production_${crypto.randomUUID()}`,
                    type: 'chart',
                    name: 'Statut Production',
                    icon: 'PieChart',
                    description: 'Répartition',
                    category: 'chart',
                    config: {
                        chartType: 'pie',
                        fields: ['qte_realisee', 'objectif_paquet'],
                        labels: ['Réalisé', 'Objectif'],
                        title: 'Avancement Production',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `rendement_teinture_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Taux de Rendement',
                    icon: 'Percent',
                    description: 'Objectif',
                    category: 'metric',
                    config: {
                        calculation: 'percent',
                        field: 'qte_realisee',
                        reference: 'objectif_paquet',
                        label: 'Taux de Rendement',
                        format: 'percent',
                        tableName: schema.tableName,
                    },
                }
            );
            break;

        case 'PRODUCTION':
            components.push(
                {
                    id: `rendement_prod_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Taux Rendement',
                    icon: 'Percent',
                    description: 'Rendement',
                    category: 'metric',
                    config: {
                        calculation: 'avg',
                        field: 'taux_rendement',
                        label: 'Rendement Moyen',
                        format: 'percent',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `disponibilite_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Taux Disponibilité',
                    icon: 'Activity',
                    description: 'Disponibilité',
                    category: 'metric',
                    config: {
                        calculation: 'avg',
                        field: 'taux_disponibilite',
                        label: 'Disponibilité Moyenne',
                        format: 'percent',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `arrets_production_${crypto.randomUUID()}`,
                    type: 'chart',
                    name: 'Arrêts Production',
                    icon: 'BarChart3',
                    description: 'Heures d\'arrêt',
                    category: 'chart',
                    config: {
                        chartType: 'bar',
                        xAxis: 'date',
                        yAxis: 'heures_arret',
                        title: 'Heures d\'Arrêt par Jour',
                        tableName: schema.tableName,
                    },
                }
            );
            break;

        case 'IT':
            components.push(
                {
                    id: `resolution_it_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Taux Résolution',
                    icon: 'Activity',
                    description: 'Résolution',
                    category: 'metric',
                    config: {
                        calculation: 'avg',
                        field: 'taux_satisfaction_utilisateurs',
                        label: 'Satisfaction Utilisateurs',
                        format: 'percent',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `incidents_evolution_${crypto.randomUUID()}`,
                    type: 'chart',
                    name: 'Évolution Incidents',
                    icon: 'LineChart',
                    description: 'Incidents',
                    category: 'chart',
                    config: {
                        chartType: 'line',
                        xAxis: 'date',
                        yAxis: ['nb_incidents_ouverts', 'nb_incidents_resolus'],
                        labels: ['Ouverts', 'Résolus'],
                        title: 'Évolution des Incidents',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `disponibilite_systeme_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Disponibilité Système',
                    icon: 'Activity',
                    description: 'Système',
                    category: 'metric',
                    config: {
                        calculation: 'avg',
                        field: 'taux_disponibilite_systeme',
                        label: 'Disponibilité Moyenne',
                        format: 'percent',
                        tableName: schema.tableName,
                    },
                }
            );
            break;

        case 'RH':
            components.push(
                {
                    id: `absentéisme_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: "Taux d'Absentéisme",
                    icon: 'Percent',
                    description: 'Absences',
                    category: 'metric',
                    config: {
                        calculation: 'avg',
                        field: 'taux_absenteisme',
                        label: "Taux d'Absentéisme Moyen",
                        format: 'percent',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `presence_${crypto.randomUUID()}`,
                    type: 'chart',
                    name: 'Présence vs Absences',
                    icon: 'PieChart',
                    description: 'Présence',
                    category: 'chart',
                    config: {
                        chartType: 'pie',
                        fields: ['nb_presents', 'nb_absents'],
                        labels: ['Présents', 'Absents'],
                        title: 'Taux de Présence',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `mouvements_personnel_${crypto.randomUUID()}`,
                    type: 'chart',
                    name: 'Mouvements Personnel',
                    icon: 'BarChart3',
                    description: 'Recrutements/Départs',
                    category: 'chart',
                    config: {
                        chartType: 'bar',
                        xAxis: 'date',
                        yAxis: ['nb_recrutements', 'nb_departs'],
                        labels: ['Recrutements', 'Départs'],
                        title: 'Mouvements du Personnel',
                        tableName: schema.tableName,
                    },
                }
            );
            break;

        case 'ACHATS':
            components.push(
                {
                    id: `total_commandes_passees_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Total Commandes Passées',
                    icon: 'TrendingUp',
                    description: 'Commandes',
                    category: 'metric',
                    fieldKey: 'nb_commandes_passees',
                    config: {
                        calculation: 'sum',
                        field: 'nb_commandes_passees',
                        label: 'Total Commandes Passées',
                        format: 'number',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `total_commandes_recues_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Total Commandes Reçues',
                    icon: 'TrendingUp',
                    description: 'Commandes',
                    category: 'metric',
                    fieldKey: 'nb_commandes_recues',
                    config: {
                        calculation: 'sum',
                        field: 'nb_commandes_recues',
                        label: 'Total Commandes Reçues',
                        format: 'number',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `montant_achats_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Montant Total Achats',
                    icon: 'TrendingUp',
                    description: 'Montant',
                    category: 'metric',
                    fieldKey: 'montant_achats_jour',
                    config: {
                        calculation: 'sum',
                        field: 'montant_achats_jour',
                        label: 'Montant Total Achats',
                        format: 'currency',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `delai_moyen_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Délai Moyen Livraison',
                    icon: 'Activity',
                    description: 'Délai',
                    category: 'metric',
                    fieldKey: 'delai_moyen_livraison',
                    config: {
                        calculation: 'avg',
                        field: 'delai_moyen_livraison',
                        label: 'Délai Moyen Livraison',
                        format: 'number',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `taux_conformite_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Taux Conformité',
                    icon: 'Percent',
                    description: 'Conformité',
                    category: 'metric',
                    fieldKey: 'taux_conformite_livraisons',
                    config: {
                        calculation: 'avg',
                        field: 'taux_conformite_livraisons',
                        label: 'Taux Conformité Moyen',
                        format: 'percent',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `evolution_commandes_${crypto.randomUUID()}`,
                    type: 'chart',
                    name: 'Évolution Commandes',
                    icon: 'LineChart',
                    description: 'Commandes',
                    category: 'chart',
                    config: {
                        chartType: 'line',
                        xAxis: 'date',
                        yAxis: ['nb_commandes_passees', 'nb_commandes_recues'],
                        labels: ['Commandes Passées', 'Commandes Reçues'],
                        title: 'Évolution des Commandes',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `comparaison_commandes_${crypto.randomUUID()}`,
                    type: 'chart',
                    name: 'Comparaison Commandes',
                    icon: 'BarChart3',
                    description: 'Comparaison',
                    category: 'chart',
                    config: {
                        chartType: 'bar',
                        xAxis: 'date',
                        yAxis: ['nb_commandes_passees', 'nb_commandes_recues'],
                        labels: ['Passées', 'Reçues'],
                        title: 'Commandes Passées vs Reçues',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `litiges_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Nombre de Litiges',
                    icon: 'Activity',
                    description: 'Litiges',
                    category: 'metric',
                    fieldKey: 'nb_litiges',
                    config: {
                        calculation: 'sum',
                        field: 'nb_litiges',
                        label: 'Total Litiges',
                        format: 'number',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `economies_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Économies Réalisées',
                    icon: 'TrendingUp',
                    description: 'Économies',
                    category: 'metric',
                    fieldKey: 'economies_realisees',
                    config: {
                        calculation: 'sum',
                        field: 'economies_realisees',
                        label: 'Économies Totales',
                        format: 'currency',
                        tableName: schema.tableName,
                    },
                }
            );
            break;

        case 'BUREAU_ETUDE':
            components.push(
                {
                    id: `projets_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Projets en Cours',
                    icon: 'Activity',
                    description: 'Projets',
                    category: 'metric',
                    fieldKey: 'nb_projets_en_cours',
                    config: {
                        calculation: 'avg',
                        field: 'nb_projets_en_cours',
                        label: 'Projets en Cours (Moyenne)',
                        format: 'number',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `avancement_projets_${crypto.randomUUID()}`,
                    type: 'chart',
                    name: 'Avancement Projets',
                    icon: 'PieChart',
                    description: 'Projets',
                    category: 'chart',
                    config: {
                        chartType: 'pie',
                        fields: ['nb_projets_en_cours', 'nb_projets_termines'],
                        labels: ['En Cours', 'Terminés'],
                        title: 'État des Projets',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `validation_prototypes_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Taux Validation',
                    icon: 'Percent',
                    description: 'Prototypes',
                    category: 'metric',
                    config: {
                        calculation: 'avg',
                        field: 'taux_validation_prototypes',
                        label: 'Taux Validation Prototypes',
                        format: 'percent',
                        tableName: schema.tableName,
                    },
                }
            );
            break;

        case 'COMMERCIAL':
            components.push(
                {
                    id: `ca_total_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'CA Total',
                    icon: 'TrendingUp',
                    description: 'Chiffre d\'Affaires',
                    category: 'metric',
                    fieldKey: 'ca_journalier',
                    config: {
                        calculation: 'sum',
                        field: 'ca_journalier',
                        label: 'Chiffre d\'Affaires Total',
                        format: 'currency',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `taux_transformation_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Taux Transformation',
                    icon: 'Percent',
                    description: 'Devis → Commandes',
                    category: 'metric',
                    config: {
                        calculation: 'avg',
                        field: 'taux_transformation_devis',
                        label: 'Taux Transformation Moyen',
                        format: 'percent',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `evolution_commerciale_${crypto.randomUUID()}`,
                    type: 'chart',
                    name: 'Performance Commerciale',
                    icon: 'LineChart',
                    description: 'CA & Commandes',
                    category: 'chart',
                    config: {
                        chartType: 'line',
                        xAxis: 'date',
                        yAxis: ['ca_journalier', 'nb_commandes_recues'],
                        labels: ['CA Journalier', 'Commandes'],
                        title: 'Performance Commerciale',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `satisfaction_clients_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Satisfaction Clients',
                    icon: 'Activity',
                    description: 'Taux satisfaction',
                    category: 'metric',
                    config: {
                        calculation: 'avg',
                        field: 'taux_satisfaction_clients',
                        label: 'Taux Satisfaction Moyen',
                        format: 'percent',
                        tableName: schema.tableName,
                    },
                }
            );
            break;

        case 'COMPTABILITE':
            components.push(
                {
                    id: `ratio_couverture_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Ratio de Couverture',
                    icon: 'Percent',
                    description: 'Entrées/Sorties',
                    category: 'metric',
                    config: {
                        calculation: 'ratio',
                        field1: 'caisse_entrees',
                        field2: 'caisse_sorties',
                        label: 'Ratio Entrées/Sorties',
                        format: 'percent',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `marge_moyenne_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Marge Moyenne par Commande',
                    icon: 'TrendingUp',
                    description: 'CA/Commandes',
                    category: 'metric',
                    config: {
                        calculation: 'avg_per_order',
                        field: 'ca',
                        reference: 'commandes',
                        label: 'Marge Moyenne',
                        format: 'currency',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `ca_tendance_${crypto.randomUUID()}`,
                    type: 'chart',
                    name: 'Évolution du CA',
                    icon: 'LineChart',
                    description: 'Tendance',
                    category: 'chart',
                    fieldKey: 'ca',
                    config: {
                        chartType: 'line',
                        xAxis: 'date',
                        yAxis: 'ca',
                        title: 'Évolution du Chiffre d\'Affaires',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `comparaison_caisse_${crypto.randomUUID()}`,
                    type: 'chart',
                    name: 'Comparaison Caisse',
                    icon: 'BarChart3',
                    description: 'Entrées vs Sorties',
                    category: 'chart',
                    config: {
                        chartType: 'bar',
                        xAxis: 'date',
                        yAxis: ['caisse_entrees', 'caisse_sorties'],
                        title: 'Entrées et Sorties de Caisse',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `repartition_mouvements_${crypto.randomUUID()}`,
                    type: 'chart',
                    name: 'Répartition Mouvements',
                    icon: 'PieChart',
                    description: 'Circulaire',
                    category: 'chart',
                    config: {
                        chartType: 'pie',
                        fields: ['caisse_entrees', 'caisse_sorties', 'solde_caisse'],
                        labels: ['Entrées', 'Sorties', 'Solde'],
                        title: 'Répartition des Mouvements',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `solde_moyen_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Solde Moyen',
                    icon: 'Activity',
                    description: 'Moyenne',
                    category: 'metric',
                    config: {
                        calculation: 'avg',
                        field: 'solde_caisse',
                        label: 'Solde Moyen',
                        format: 'currency',
                        tableName: schema.tableName,
                    },
                }
            );
            break;

        case 'DG':
            components.push(
                {
                    id: `performance_globale_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Performance Globale',
                    icon: 'Activity',
                    description: 'KPI Global',
                    category: 'metric',
                    config: {
                        calculation: 'avg',
                        field: 'indicateur_performance_global',
                        label: 'Performance Globale',
                        format: 'percent',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `ca_cumule_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'CA Cumulé',
                    icon: 'TrendingUp',
                    description: 'Chiffre d\'Affaires',
                    category: 'metric',
                    fieldKey: 'ca_cumule',
                    config: {
                        calculation: 'sum',
                        field: 'ca_cumule',
                        label: 'CA Cumulé',
                        format: 'currency',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `objectifs_${crypto.randomUUID()}`,
                    type: 'metric',
                    name: 'Atteinte Objectifs',
                    icon: 'Percent',
                    description: 'Objectifs',
                    category: 'metric',
                    config: {
                        calculation: 'avg',
                        field: 'taux_atteinte_objectifs',
                        label: 'Taux Atteinte Objectifs',
                        format: 'percent',
                        tableName: schema.tableName,
                    },
                },
                {
                    id: `dashboard_dg_${crypto.randomUUID()}`,
                    type: 'chart',
                    name: 'Tableau de Bord DG',
                    icon: 'LineChart',
                    description: 'KPIs principaux',
                    category: 'chart',
                    config: {
                        chartType: 'line',
                        xAxis: 'date',
                        yAxis: ['indicateur_performance_global', 'taux_atteinte_objectifs'],
                        labels: ['Performance', 'Objectifs'],
                        title: 'Indicateurs de Performance',
                        tableName: schema.tableName,
                    },
                }
            );
            break;
    }

    return components;
};

// Main hook
export const useBuilderToolbar = ({ departmentCode, onAddComponent, user }) => {
    const [availableComponents, setAvailableComponents] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [schema, setSchema] = useState(null);
    const [error, setError] = useState(null);

    // Load schema and components with user context
    useEffect(() => {
        const loadSchemaAndComponents = async () => {
            if (!departmentCode) {
                setError('Code département manquant');
                setLoading(false);
                return;
            }

            if (!user) {
                setError('Utilisateur non authentifié');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const deptSchema = await schemaService.getDepartmentSchema(departmentCode);
                if (!deptSchema) {
                    throw new Error('Schéma non trouvé');
                }
                setSchema(deptSchema);
                const components = generateComponents(departmentCode, deptSchema);
                setAvailableComponents(components);

            } catch (error) {
                console.error('Error loading schema:', error);
                setError(error.message);
                setAvailableComponents([]);
            } finally {
                setLoading(false);
            }
        };

        loadSchemaAndComponents();
    }, [departmentCode, user]);

    // Filter components based on category and search
    const filteredComponents = useMemo(() => {
        return availableComponents.filter((c) => {
            const matchCategory = activeCategory === 'all' || c.category === activeCategory;
            const matchSearch =
                searchTerm === '' ||
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchCategory && matchSearch;
        });
    }, [availableComponents, activeCategory, searchTerm]);

    // Get counts by category
    const categoryCounts = useMemo(() => {
        const counts = {};
        availableComponents.forEach(c => {
            counts[c.category] = (counts[c.category] || 0) + 1;
        });
        return counts;
    }, [availableComponents]);

    // Handlers
    const handleCategoryChange = useCallback((category) => {
        setActiveCategory(category);
    }, []);

    const handleSearchChange = useCallback((term) => {
        setSearchTerm(term);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchTerm('');
    }, []);

    const handleAddComponent = useCallback((component) => {
        onAddComponent(component);
    }, [onAddComponent]);

    return {
        // State
        availableComponents,
        activeCategory,
        searchTerm,
        loading,
        schema,
        error,
        filteredComponents,
        categoryCounts,

        // Handlers
        handleCategoryChange,
        handleSearchChange,
        handleClearSearch,
        handleAddComponent,
    };
};