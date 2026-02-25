// Configuration des départements avec leurs interfaces spécifiques

export const DEPARTMENTS = {
    COMPTABILITE: {
        id: 2,
        code: 'COMPTA',
        name: 'Comptabilité',
        color: '#10b981',
        icon: '💰',
        dashboardPath: '/departments/comptabilite'
    },
    BUREAU_ETUDE: {
        id: 3,
        code: 'BED',
        name: 'Bureau d\'Étude & Développement',
        color: '#8b5cf6',
        icon: '🔬',
        dashboardPath: '/departments/bureau-etude'
    },
    MAINTENANCE: {
        id: 4,
        code: 'MAINT',
        name: 'Maintenance',
        color: '#f59e0b',
        icon: '🔧',
        dashboardPath: '/departments/maintenance'
    },
    FILATURE: {
        id: 5,
        code: 'FILAT',
        name: 'Filature',
        color: '#6366f1',
        icon: '🧵',
        dashboardPath: '/departments/filature'
    },
    IMPRESSION: {
        id: 6,
        code: 'IMPR',
        name: 'Impression',
        color: '#ec4899',
        icon: '🎨',
        dashboardPath: '/departments/impression'
    },
    STOCK: {
        id: 7,
        code: 'STOCK',
        name: 'Stock',
        color: '#14b8a6',
        icon: '📦',
        dashboardPath: '/departments/stock'
    },
    ACHATS: {
        id: 8,
        code: 'ACHAT',
        name: 'Achats',
        color: '#f97316',
        icon: '🛒',
        dashboardPath: '/departments/achats'
    },
    COMMERCIAL: {
        id: 9,
        code: 'COMM',
        name: 'Commercial',
        color: '#3b82f6',
        icon: '💼',
        dashboardPath: '/departments/commercial'
    },
    INFORMATIQUE: {
        id: 10,
        code: 'IT',
        name: 'Informatique',
        color: '#06b6d4',
        icon: '💻',
        dashboardPath: '/departments/informatique'
    },
    RH: {
        id: 11,
        code: 'RH',
        name: 'Ressources Humaines',
        color: '#ef4444',
        icon: '👥',
        dashboardPath: '/departments/rh'
    },
    DIR: {
        id: 1,
        code: 'DIR',
        name: 'Direction Générale',
        color: '#4a5dc0',
        icon: '👥',
        dashboardPath: '/departments/dir'
    }
};

// Fonction helper pour obtenir les infos du département par ID
export const getDepartmentById = (id) => {
    return Object.values(DEPARTMENTS).find(dept => dept.id === id);
};

// Fonction helper pour obtenir les infos du département par code
export const getDepartmentByCode = (code) => {
    return Object.values(DEPARTMENTS).find(dept => dept.code === code);
};

// Menu de navigation spécifique par département
export const getDepartmentMenuItems = (departmentId) => {
    const baseItems = [
        { name: 'Tableau de bord', href: 'dashboard', icon: 'LayoutDashboard' },
        { name: 'Mes Rapports', href: 'reports', icon: 'FileText' },
        { name: 'Statistiques', href: 'stats', icon: 'BarChart3' },
        { name: 'Notifications', href: 'notifications', icon: 'Bell' },
    ];

    // Items spécifiques par département
    const departmentSpecificItems = {
        2: [ // Comptabilité
            { name: 'Bilans', href: 'bilans', icon: 'DollarSign' },
            { name: 'Budget', href: 'budget', icon: 'TrendingUp' },
            {name:'Journaux Comptables', href:'journal',icon:'TrendingUp'},
            {name:'Comptabilité Analytique', href:'analyse',icon:'TrendingUp'},
            {name:'Rapprochements Bancaires', href:'banque',icon:'TrendingUp'},
            {name:'Factures Clients', href:'factures',icon:'TrendingUp'},
            {name:'États Financiers & Rapports', href:'raports',icon:'TrendingUp'}
        ],
        3: [ // Bureau d'Étude
            { name: 'Projets', href: 'projects', icon: 'Lightbulb' },
            { name: 'Recherche', href: 'research', icon: 'Search' }
        ],
        4: [ // Maintenance
            { name: 'Interventions', href: 'interventions', icon: 'Tool' },
            { name: 'Équipements', href: 'equipments', icon: 'Cpu' }
        ],
        5: [ // Filature
            { name: 'Production', href: 'production', icon: 'Package' },
            { name: 'Qualité', href: 'quality', icon: 'CheckCircle' }
        ],
        6: [ // Impression
            { name: 'Commandes', href: 'orders', icon: 'ShoppingCart' },
            { name: 'Designs', href: 'designs', icon: 'Palette' }
        ],
        7: [ // Stock
            { name: 'Inventaire', href: 'inventory', icon: 'Archive' },
            { name: 'Mouvements', href: 'movements', icon: 'ArrowRightLeft' }
        ],
        8: [ // Achats
            { name: 'Fournisseurs', href: 'suppliers', icon: 'Users' },
            { name: 'Commandes', href: 'purchase-orders', icon: 'FileCheck' }
        ],
        9: [ // Commercial
            { name: 'Clients', href: 'clients', icon: 'UserCheck' },
            { name: 'Ventes', href: 'sales', icon: 'TrendingUp' }
        ],
        10: [ // Informatique
            { name: 'Tickets', href: 'tickets', icon: 'AlertCircle' },
            { name: 'Systèmes', href: 'systems', icon: 'Server' },
            { name: 'Administration', href: 'admin', icon: 'Shield' }
        ],
        11: [ // RH
            { name: 'Employés', href: 'employees', icon: 'Users' },
            { name: 'Congés', href: 'leaves', icon: 'Calendar' },
            {name:'Contrats', href:'contrats', icon: 'Calendar' },
            {name:'Recrutement', href:'recrutements', icon: 'Calendar' },
            {name:'Paie & Notes de frais', href:'paroll', icon: 'Calendar' },
            {name:'Sanctions / Absences' , href: 'sanctions', icon: 'Calendar' },
            {name:'Historique RH', href:'historicalRH', icon: 'Calendar' },
        ],
        1: [ // Direction
            { name: 'Vue Consolidée', href: 'overview', icon: 'Eye' },
            { name: 'Départements', href: 'departments', icon: 'Building' },
            { name: 'Objectifs', href: 'objectives', icon: 'Target' }
        ]
    };

    const specificItems = departmentSpecificItems[departmentId] || [];

    return [
        ...baseItems,
        ...specificItems,

    ];
};

export default DEPARTMENTS;