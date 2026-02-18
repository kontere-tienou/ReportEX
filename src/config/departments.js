// Configuration des départements avec leurs interfaces spécifiques

export const DEPARTMENTS = {
    COMPTABILITE: {
        id: 1,
        code: 'COMPTA',
        name: 'Comptabilité',
        color: '#10b981', // green
        icon: '💰',
        dashboardPath: '/departments/comptabilite'
    },
    BUREAU_ETUDE: {
        id: 2,
        code: 'BED',
        name: 'Bureau d\'Étude & Développement',
        color: '#8b5cf6', // purple
        icon: '🔬',
        dashboardPath: '/departments/bureau-etude'
    },
    MAINTENANCE: {
        id: 3,
        code: 'MAINT',
        name: 'Maintenance',
        color: '#f59e0b', // amber
        icon: '🔧',
        dashboardPath: '/departments/maintenance'
    },
    FILATURE: {
        id: 4,
        code: 'FILAT',
        name: 'Filature',
        color: '#6366f1', // indigo
        icon: '🧵',
        dashboardPath: '/departments/filature'
    },
    IMPRESSION: {
        id: 5,
        code: 'IMPR',
        name: 'Impression',
        color: '#ec4899', // pink
        icon: '🎨',
        dashboardPath: '/departments/impression'
    },
    STOCK: {
        id: 6,
        code: 'STOCK',
        name: 'Stock',
        color: '#14b8a6', // teal
        icon: '📦',
        dashboardPath: '/departments/stock'
    },
    ACHATS: {
        id: 7,
        code: 'ACHAT',
        name: 'Achats',
        color: '#f97316', // orange
        icon: '🛒',
        dashboardPath: '/departments/achats'
    },
    COMMERCIAL: {
        id: 8,
        code: 'COMM',
        name: 'Commercial',
        color: '#3b82f6', // blue
        icon: '💼',
        dashboardPath: '/departments/commercial'
    },
    INFORMATIQUE: {
        id: 9,
        code: 'IT',
        name: 'Informatique',
        color: '#06b6d4', // cyan
        icon: '💻',
        dashboardPath: '/departments/informatique'
    },
    RH: {
        id: 10,
        code: 'RH',
        name: 'Ressources Humaines',
        color: '#ef4444', // red
        icon: '👥',
        dashboardPath: '/departments/rh'
    },
    DIR: {
        id: 11,
        code: 'DIR',
        name: 'Direction Générale',
        color: '#4a5dc0', // red
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
        1: [ // Comptabilité
            { name: 'Bilans', href: 'bilans', icon: 'DollarSign' },
            { name: 'Budget', href: 'budget', icon: 'TrendingUp' }
        ],
        2: [ // Bureau d'Étude
            { name: 'Projets', href: 'projects', icon: 'Lightbulb' },
            { name: 'Recherche', href: 'research', icon: 'Search' }
        ],
        3: [ // Maintenance
            { name: 'Interventions', href: 'interventions', icon: 'Tool' },
            { name: 'Équipements', href: 'equipments', icon: 'Cpu' }
        ],
        4: [ // Filature
            { name: 'Production', href: 'production', icon: 'Package' },
            { name: 'Qualité', href: 'quality', icon: 'CheckCircle' }
        ],
        5: [ // Impression
            { name: 'Commandes', href: 'orders', icon: 'ShoppingCart' },
            { name: 'Designs', href: 'designs', icon: 'Palette' }
        ],
        6: [ // Stock
            { name: 'Inventaire', href: 'inventory', icon: 'Archive' },
            { name: 'Mouvements', href: 'movements', icon: 'ArrowRightLeft' }
        ],
        7: [ // Achats
            { name: 'Fournisseurs', href: 'suppliers', icon: 'Users' },
            { name: 'Commandes', href: 'purchase-orders', icon: 'FileCheck' }
        ],
        8: [ // Commercial
            { name: 'Clients', href: 'clients', icon: 'UserCheck' },
            { name: 'Ventes', href: 'sales', icon: 'TrendingUp' }
        ],
        9: [ // Informatique
            { name: 'Tickets', href: 'tickets', icon: 'AlertCircle' },
            { name: 'Systèmes', href: 'systems', icon: 'Server' },
            { name: 'Administration', href: 'admin', icon: 'Shield' }
        ],
        10: [ // RH
            { name: 'Employés', href: 'employees', icon: 'Users' },
            { name: 'Congés', href: 'leaves', icon: 'Calendar' }
        ],
        11: [ // Direction
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