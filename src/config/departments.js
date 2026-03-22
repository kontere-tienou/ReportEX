import {
    LayoutDashboard,
    Eye,
    Activity,
    AlertTriangle,
    TrendingUp,
    CheckCircle,
    FileText,
    BarChart,
    BookOpen,
    PieChart,
    RefreshCw,
    Receipt,
    Wrench,
    Calendar,
    Cpu,
    Package,
    History,
    Fuel,
    Printer,
    Clock,
    Users,
    ArrowLeftRight,
    FolderTree,
    FilePlus,
    ShoppingCart,
    PackageCheck,
    Truck,
    UserPlus,
    ShoppingBag,
    DollarSign,
    Monitor,
    AlertCircle,
    Shield,
    Key,
    Building,
    ToggleLeft,
    Menu,
    Settings,
    ClipboardList,
    List,
    FlaskConical,
    Beaker,
    TrendingDown,
    Palette,
    ArrowDownCircle,
    ArrowUpCircle,
    Book
} from "lucide-react";

export const DEPARTMENTS = {

    DIR: {
        id: 1,
        code: 'DIR',
        name: 'Direction Générale',
        color: '#4a5dc0',
        icon: '👥',
        dashboardPath: '/departments/dir'
    },

    COMPTABILITE: {
        id: 2,
        code: 'COMPTABILITE',
        name: 'Comptabilité',
        color: '#10b981',
        icon: '💰',
        dashboardPath: '/departments/comptabilite'
    },

    BUREAU_ETUDE: {
        id: 3,
        code: 'BED',
        name: "Bureau d'Étude & Développement",
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

    CONFECTION: {
        id: 12,
        code: 'CONF',
        name: 'Confection',
        color: '#a855f7',
        icon: '🧵',
        dashboardPath: '/departments/confection'
    },

    LABORATOIRE: {
        id: 13,
        code: 'LABO',
        name: 'Laboratoire Qualité',
        color: '#06b6d4',
        icon: '🔬',
        dashboardPath: '/departments/laboratoire'
    },

    CONTROLE: {
        id: 14,
        code: 'CONTROLE',
        name: 'Contrôle de Gestion',
        color: '#0ea5e9',
        icon: '📈',
        dashboardPath: '/departments/controle'
    },

    MAGASIN: {
        id: 15,
        code: 'MAGASIN',
        name: 'Magasin',
        color: '#ec4899',
        icon: '🧺',
        dashboardPath: '/departments/magasin'
    },

    CAISSE: {
        id: 16,
        code: 'CAISSE',
        name: 'Caisse',
        color: '#84cc16',
        icon: '💵',
        dashboardPath: '/departments/caisse'
    },

    VAPO: {
        id: 17,
        code: 'VAPO',
        name: 'Vapo / Énergie',
        color: '#64748b',
        icon: '⚡',
        dashboardPath: '/departments/vapo'
    },

    STOCK_MATERIEL: {
        id: 18,
        code: 'STOCKMAT',
        name: 'Stock Matériel',
        color: '#14b8a6',
        icon: '⚙️',
        dashboardPath: '/departments/stock-materiel'
    }

};


export const getDepartmentById = (id) => {
    return Object.values(DEPARTMENTS).find(dept => dept.id === id);
};

export const getDepartmentByCode = (code) => {
    return Object.values(DEPARTMENTS).find(dept => dept.code === code);
};

export const getDepartmentByColor = (color) => {
    return Object.values(DEPARTMENTS).find(dept => dept.color === color);
};

const baseItems = [
    { name: 'Tableau de bord', href: 'dashboard', icon: LayoutDashboard }
];
const departmentSpecificItems = {

    1: [

        { name: 'Vue d\'ensemble', href: 'overview', icon: Eye },
        { name: 'Activité récente', href: 'activity', icon: Activity },
        { name: 'Alertes', href: 'alerts', icon: AlertTriangle },
        { name: 'KPIs Usine', href: 'kpis', icon: TrendingUp },
        { name: 'Validations', href: 'approvals', icon: CheckCircle },
        { name: 'Rapports Consolidés', href: 'reports', icon: FileText },
        { name: 'Performance', href: 'performance', icon: BarChart }
    ],

    2: [
        { name: 'Journaux Comptables', href: 'journals', icon: BookOpen },
        { name: 'Budgets', href: 'budgets', icon: PieChart },
        { name: 'Rapprochements', href: 'reconciliation', icon: RefreshCw },
        { name: 'Mes Rapports', href: 'reports', icon: Printer },
        { name: 'Données', href: 'data', icon: 'data' },
        { name: 'Factures Clients', href: 'customer-invoices', icon: Receipt }
    ],

    4: [
        { name: 'Demandes Intervention', href: 'maintenance-requests', icon: Wrench },
        { name: 'Planning Préventif', href: 'preventive-planning', icon: Calendar },
        { name: 'Machines', href: 'machines', icon: Cpu },
        { name: 'Données', href: 'data', icon: 'data' },
        { name: 'Mes Rapports', href: 'reports', icon: 'FileText' },
        { name: 'Historique', href: 'history', icon: History }
    ],

    6: [
        { name: 'Ordres d\'Impression', href: 'print-orders', icon: Printer },
        { name: 'Suivi Production', href: 'production-tracking', icon: Activity },
        { name: 'Machines', href: 'machines', icon: Cpu },
        { name: 'Données', href: 'data', icon: 'data' },
        { name: 'Mes Rapports', href: 'reports', icon: 'FileText' },
        { name: 'Temps d\'Arrêt', href: 'downtime', icon: Clock }
    ],

    9: [ // commercial
        { name: 'Clients', href: 'customers', icon: Users },
        { name: 'Prospects', href: 'prospects', icon: UserPlus },
        { name: 'Devis', href: 'quotes', icon: FileText },
        { name: 'Données', href: 'data', icon: 'data' },
        { name: 'Commandes Clients', href: 'customer-orders', icon: ShoppingBag },
        { name: 'Mes Rapports', href: 'reports', icon: 'FileText' },
    ],

    10: [ // Informatique
        { name: 'Inventaire Matériel', href: 'data', icon: Monitor },
        { name: 'Tickets Support', href: 'tickets', icon: AlertCircle },
        { name: 'Maintenance IT', href: 'it-maintenance', icon: Wrench },
        { name: 'Rôles', href: 'roles', icon: Shield },
        { name: 'Permissions', href: 'permissions', icon: Key },
        { name: 'Systèmes', href: 'systems', icon: 'Server' },
        { name: 'Administration', href: 'admin', icon: 'Shield' },
        { name: 'Mes Rapports', href: 'reports', icon: 'FileText' },
    ],

    11: [ // RH
        { name: 'Employés', href: 'employees', icon: Users },
        { name: 'Contrats', href: 'contracts', icon: FileText },
        { name: 'Congés', href: 'leaves', icon: Calendar },
        { name: 'Données', href: 'data', icon: 'data' },
        { name: 'Recrutement', href: 'recruitment', icon: UserPlus }
    ],

    13: [ // labo
        { name: 'Tests & Contrôles', href: 'tests', icon: FlaskConical },
        { name: 'Échantillons', href: 'samples', icon: Beaker },
        { name: 'Données', href: 'data', icon: 'data' },
        { name: 'Rapports Qualité', href: 'reports', icon: FileText }

    ],

    15: [
        { name: 'Stock Pagne', href: 'fabric-stock', icon: Package },
        { name: 'Motifs', href: 'patterns', icon: Palette },
        { name: 'Inventaire', href: 'inventory', icon: ClipboardList },
        { name: 'Données', href: 'data', icon: 'data' },
        { name: 'Mes Rapports', href: 'reports', icon: 'FileText' },
    ],

    16: [
        { name: 'Encaissements', href: 'receipts', icon: ArrowDownCircle },
        { name: 'Décaissements', href: 'payments', icon: ArrowUpCircle },
        { name: 'Journal de Caisse', href: 'cash-journal', icon: Book },
        { name: 'Données', href: 'data', icon: 'data' },
        { name: 'Mes Rapports', href: 'reports', icon: 'FileText' },
    ]

};


export const getDepartmentMenuItems = (departmentId) => {

    const specificItems = departmentSpecificItems[departmentId] || [];

    return [
        ...baseItems,
        ...specificItems
    ];

};

export default DEPARTMENTS;