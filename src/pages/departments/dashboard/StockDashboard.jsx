import GenericDepartmentDashboard from '../../../components/GenericDepartmentDashboard.jsx';
import { Archive, Package, ArrowRightLeft, AlertTriangle } from 'lucide-react';

const StockDashboard = () => {
    const metrics = [
        { label: 'Articles en Stock', value: '1,245', subtext: 'Références actives', color: '#14b8a6', icon: Archive },
        { label: 'Valeur Stock', value: '2.8M', subtext: 'FCFA', color: '#10b981', icon: Package },
        { label: 'Mouvements', value: '156', subtext: 'Cette semaine', color: '#3b82f6', icon: ArrowRightLeft },
        { label: 'Alertes', value: '8', subtext: 'Stock faible', color: '#f59e0b', icon: AlertTriangle },
    ];

    return (
        <GenericDepartmentDashboard
            departmentName="Stock"
            departmentIcon={Archive}
            departmentColor="#14b8a6"
            description="Gestion Inventaire & Magasin"
            metrics={metrics}
        />
    );
};

export default StockDashboard;