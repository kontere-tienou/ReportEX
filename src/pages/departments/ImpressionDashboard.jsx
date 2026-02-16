import GenericDepartmentDashboard from '../../components/GenericDepartmentDashboard';
import { Palette, ShoppingCart, CheckCircle, TrendingUp } from 'lucide-react';

const ImpressionDashboard = () => {
    const metrics = [
        { label: 'Commandes', value: '45', subtext: 'En cours', color: '#ec4899', icon: ShoppingCart },
        { label: 'Designs', value: '23', subtext: 'Nouveaux ce mois', color: '#8b5cf6', icon: Palette },
        { label: 'Livraisons', value: '38', subtext: 'À temps (95%)', color: '#10b981', icon: CheckCircle },
        { label: 'Production', value: '850m²', subtext: 'Cette semaine', color: '#f59e0b', icon: TrendingUp },
    ];

    return (
        <GenericDepartmentDashboard
            departmentName="Impression"
            departmentIcon={Palette}
            departmentColor="#ec4899"
            description="Teinture & Impression Textile"
            metrics={metrics}
        />
    );
};

export default ImpressionDashboard;