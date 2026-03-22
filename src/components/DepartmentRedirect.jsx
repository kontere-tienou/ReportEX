import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDepartmentById } from '../config/departments';

const DepartmentRedirect = () => {
    const { user } = useAuth();

    if (!user || !user.department) {
        return <Navigate to="/login" />;
    }

    // Obtenir le dashboard du département
    const department = getDepartmentById(user.department.id);

    if (!department) {
        console.error('Département non trouvé:', user.department.id);
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">
                        Erreur de configuration
                    </h1>
                    <p className="text-gray-600">
                        Département non configuré. Veuillez contacter l'administrateur.
                    </p>
                </div>
            </div>
        );
    }

    // Rediriger vers le dashboard du département
    return <Navigate to={department.dashboardPath} replace />;
};

export default DepartmentRedirect;