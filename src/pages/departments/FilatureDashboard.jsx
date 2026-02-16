import GenericDepartmentDashboard from '../../components/GenericDepartmentDashboard';
import { Package, TrendingUp, CheckCircle, Activity } from 'lucide-react';

const FilatureDashboard = () => {
    const metrics = [
        { label: 'Production', value: '2500kg', subtext: 'Cette semaine', color: '#6366f1', icon: Package },
        { label: 'Rendement', value: '94%', subtext: '+2% vs mois dernier', color: '#10b981', icon: TrendingUp },
        { label: 'Qualité', value: '98.5%', subtext: 'Taux conformité', color: '#22c55e', icon: CheckCircle },
        { label: 'Machines Actives', value: '12/15', subtext: '80% capacité', color: '#3b82f6', icon: Activity },
    ];

    return (
        <GenericDepartmentDashboard
            departmentName="Filature"
            departmentIcon={Package}
            departmentColor="#6366f1"
            description="Production de Fil Textile"
            metrics={metrics}
        />
    );
};

export default FilatureDashboard;