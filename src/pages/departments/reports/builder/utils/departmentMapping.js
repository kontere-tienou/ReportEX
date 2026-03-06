// utils/departmentMapping.js
export const departmentCodeMap = {
    'impression': 'IMPRESSION',
    'confection': 'CONFECTION',
    'teinture': 'TEINTURE',
    'production': 'PRODUCTION',
    'it': 'IT',
    'rh': 'RH',
    'achat': 'ACHATS',
    'achats': 'ACHATS',
    'bureau-etude': 'BUREAU_ETUDE',
    'bureau_etude': 'BUREAU_ETUDE',
    'commercial': 'COMMERCIAL',
    'comptabilite': 'COMPTABILITE',
    'dg': 'DG',
};

export const getDepartmentDisplayName = (deptCode) => {
    const displayNames = {
        'IMPRESSION': 'Impression',
        'CONFECTION': 'Confection',
        'TEINTURE': 'Teinture',
        'PRODUCTION': 'Production',
        'IT': 'Informatique',
        'RH': 'Ressources Humaines',
        'ACHATS': 'Achats',
        'BUREAU_ETUDE': "Bureau d'Études",
        'COMMERCIAL': 'Commercial',
        'COMPTABILITE': 'Comptabilité',
        'DG': 'Direction Générale',
    };
    return displayNames[deptCode] || deptCode || 'Département';
};

export const getUserInitials = (user) => {
    if (!user) return '?';
    if (user.full_name) {
        return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user.name) {
        return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user.email) {
        return user.email.charAt(0).toUpperCase();
    }
    return 'U';
};