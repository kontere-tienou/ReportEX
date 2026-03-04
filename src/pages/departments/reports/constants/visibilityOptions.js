// pages/departments/reports/constants/visibilityOptions.js

import { Lock, FileText, Globe } from 'lucide-react';

export const VISIBILITY_OPTIONS = [
    {
        value: 'private',
        label: 'Privé',
        description: 'Direction seulement',
        icon: Lock,
    },
    {
        value: 'department',
        label: 'Département',
        description: 'Membres du département',
        icon: FileText,
    },
    {
        value: 'public',
        label: 'Public',
        description: 'Tous les utilisateurs',
        icon: Globe,
    },
];