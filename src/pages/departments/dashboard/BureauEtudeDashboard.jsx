import GenericDepartmentDashboard from '../../../components/GenericDepartmentDashboard.jsx';
import { Lightbulb, Search, FileText, TrendingUp } from 'lucide-react';

const BureauEtudeDashboard = () => {
    const metrics = [
        { label: 'Projets en Cours', value: '12', subtext: '+3 ce mois', color: '#8b5cf6', icon: Lightbulb },
        { label: 'Recherches', value: '8', subtext: 'Actives', color: '#06b6d4', icon: Search },
        { label: 'Prototypes', value: '5', subtext: 'En développement', color: '#10b981', icon: FileText },
        { label: 'Innovations', value: '15', subtext: 'Cette année', color: '#f59e0b', icon: TrendingUp },
    ];

    return (
        <GenericDepartmentDashboard
            departmentName="Bureau d'Étude & Développement"
            departmentIcon={Lightbulb}
            departmentColor="#8b5cf6"
            description="Recherche, Innovation & Développement"
            metrics={metrics}
        />
    );
};

export default BureauEtudeDashboard;