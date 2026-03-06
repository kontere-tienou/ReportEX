import GenericDepartmentDashboard from '../../../components/GenericDepartmentDashboard.jsx';
import { Users, Calendar, TrendingUp, UserPlus } from 'lucide-react';

const RHDashboard = () => {
    const metrics = [
        { label: 'Employés', value: '156', subtext: 'Personnel actif', color: '#ef4444', icon: Users },
        { label: 'Recrutements', value: '8', subtext: 'En cours', color: '#10b981', icon: UserPlus },
        { label: 'Congés', value: '12', subtext: 'À valider', color: '#f59e0b', icon: Calendar },
        { label: 'Présence', value: '94%', subtext: 'Taux moyen', color: '#3b82f6', icon: TrendingUp },
    ];

    return (
        <GenericDepartmentDashboard
            departmentName="Ressources Humaines"
            departmentIcon={Users}
            departmentColor="#ef4444"
            description="Gestion du Personnel"
            metrics={metrics}
        />
    );
};

export default RHDashboard;