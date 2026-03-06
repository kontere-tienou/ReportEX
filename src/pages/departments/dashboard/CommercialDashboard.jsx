import GenericDepartmentDashboard from '../../../components/GenericDepartmentDashboard.jsx';
import { TrendingUp, UserCheck, DollarSign, Target } from 'lucide-react';

const CommercialDashboard = () => {
    const metrics = [
        { label: 'CA du Mois', value: '3.2M', subtext: '+15% vs mois dernier', color: '#3b82f6', icon: DollarSign },
        { label: 'Clients Actifs', value: '245', subtext: '+12 nouveaux', color: '#10b981', icon: UserCheck },
        { label: 'Ventes', value: '89', subtext: 'Commandes traitées', color: '#8b5cf6', icon: TrendingUp },
        { label: 'Objectif', value: '85%', subtext: 'Atteint', color: '#f59e0b', icon: Target },
    ];

    return (
        <GenericDepartmentDashboard
            departmentName="Commercial"
            departmentIcon={TrendingUp}
            departmentColor="#3b82f6"
            description="Ventes & Relations Clients"
            metrics={metrics}
        />
    );
};

export default CommercialDashboard;