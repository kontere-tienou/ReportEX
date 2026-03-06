import GenericDepartmentDashboard from '../../../components/GenericDepartmentDashboard.jsx';
import { ShoppingCart, Users, FileCheck, DollarSign } from 'lucide-react';

const AchatsDashboard = () => {
    const metrics = [
        { label: 'Commandes', value: '34', subtext: 'En cours', color: '#f97316', icon: ShoppingCart },
        { label: 'Fournisseurs', value: '67', subtext: 'Actifs', color: '#8b5cf6', icon: Users },
        { label: 'Validées', value: '28', subtext: 'Ce mois', color: '#10b981', icon: FileCheck },
        { label: 'Budget', value: '1.2M', subtext: 'Utilisé: 85%', color: '#3b82f6', icon: DollarSign },
    ];

    return (
        <GenericDepartmentDashboard
            departmentName="Achats"
            departmentIcon={ShoppingCart}
            departmentColor="#f97316"
            description="Approvisionnement & Fournisseurs"
            metrics={metrics}
        />
    );
};

export default AchatsDashboard;