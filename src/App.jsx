import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login.jsx";
import DepartmentDashboardRouter from "./pages/departments/DepartmentDashboardRouter.jsx";
import {
    DepartmentsList,
    NotificationsIT,
    Objectives,
    SystemAdmin,
    SystemsMonitoring,
    TicketsIT,
    VueConsolidee
} from "./pages/departments/index.js";
import {AuthProvider} from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Reports from "./pages/departments/reports/Reports.jsx";
import DepartmentRedirect from "./components/DepartmentRedirect.jsx";
import DepartmentLayout from "./components/DepartmentLayout.jsx";
import ParametresIT from "./pages/departments/subIT/ParametresIT.jsx";
import ReportDetails from "./pages/departments/reports/ReportDetails.jsx";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* STRUCTURE UNIQUE POUR TOUS LES DÉPARTEMENTS */}
                    <Route
                        path="/departments/:deptName"
                        element={
                            <ProtectedRoute>
                                <DepartmentLayout />
                            </ProtectedRoute>
                        }
                    >
                        {/* 1. Routes Communes (Accessibles via /departments/rh/profile, /departments/it/profile, etc.) */}
                        <Route path="notifications" element={<NotificationsIT />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="reports/:id" element={<ReportDetails />} />
                        <Route path="settings" element={<ParametresIT/>}/>

                        {/* 2. Le Dashboard dynamique */}
                        <Route index element={<DepartmentDashboardRouter />} />
                        <Route path="dashboard" element={<DepartmentDashboardRouter />} />

                        {/*
                        /////////////////////////////////////////////////////////////////////////////////////////////////
                        3. Routes  Spécifiques par département)
                        /////////////////////////////////////////////////////////////////////////////////////////////////
                        */}

                        {/* Routes protégées - RH */}
                        <Route path="employees" element={<div className="card">Employés (à venir)</div>} />
                        <Route path="leaves" element={<div className="card">Congés (à venir)</div>} />

                        {/* Routes protégées - Commercial */}
                        <Route path="clients" element={<div className="card">Clients (à venir)</div>} />
                        <Route path="sales" element={<div className="card">Ventes (à venir)</div>} />

                        {/* Routes protégées - Achats */}
                        <Route path="suppliers" element={<div className="card">Fournisseurs (à venir)</div>} />
                        <Route path="purchase-orders" element={<div className="card">Commandes (à venir)</div>} />


                        {/* Routes protégées - Impression */}
                        <Route path="orders" element={<div className="card">Commandes (à venir)</div>} />
                        <Route path="designs" element={<div className="card">Designs (à venir)</div>} />

                        {/* Routes protégées - Filature */}
                        <Route path="production" element={<div className="card">Production (à venir)</div>} />
                        <Route path="quality" element={<div className="card">Qualité (à venir)</div>} />

                        {/* Routes protégées - Maintenance */}
                        <Route path="interventions" element={<div className="card">Interventions (à venir)</div>} />
                        <Route path="equipments" element={<div className="card">Équipements (à venir)</div>} />

                        {/* Routes protégées - Bureau d'Étude */}
                        <Route path="projects" element={<div className="card">Projets (à venir)</div>} />
                        <Route path="research" element={<div className="card">Recherche (à venir)</div>} />

                        {/* Routes protégées - Comptabilité */}
                        <Route path="bilans" element={<div className="card">Bilans (à venir)</div>} />
                        <Route path="budget" element={<div className="card">Budget (à venir)</div>} />

                        {/* Routes protégées - Direction */}
                        <Route path="overview" element={<VueConsolidee />} />
                        <Route path="departments" element={<DepartmentsList />} />
                        <Route path="objectives" element={<Objectives />} />

                        {/* Routes protégées - Informatique */}
                        <Route path="tickets" element={<TicketsIT />} />
                        <Route path="systems" element={<SystemsMonitoring />} />
                        <Route path="admin" element={<SystemAdmin />} />
                        {/*<Route path="parametres" element={<Parametres />}*/}

                        {/* Routes protégées - Stock */}
                        <Route path="inventory" element={<div className="card">Inventaire</div>} />
                        <Route path="movements" element={<div className="card">Mouvements (à venir)</div>}/>

                    </Route>

                    {/* Redirection racine */}
                    <Route path="/" element={<ProtectedRoute><DepartmentRedirect /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;