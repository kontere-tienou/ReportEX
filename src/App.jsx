import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DepartmentLayout from './components/DepartmentLayout';
import Login from './pages/Login';
import Reports from './pages/Reports';
import NewReport from './pages/NewReport';

// Import tous les dashboards des départements
import {
    ComptabiliteDashboard,
    BureauEtudeDashboard,
    MaintenanceDashboard,
    FilatureDashboard,
    ImpressionDashboard,
    StockDashboard,
    AchatsDashboard,
    CommercialDashboard,
    InformatiqueDashboard,
    TicketsIT,
    SystemsMonitoring,
    SystemAdmin,
    RHDashboard,
    DirectionDashboard,
    VueConsolidee,
    Objectives,
    DepartmentsList,
    StatistiquesIT,
    NewReportIT,
    RapportsIT,
    ParametresIT,
    NotificationsIT,


} from './pages/departments';

// Composant de redirection automatique
import DepartmentRedirect from './components/DepartmentRedirect';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Route publique */}
                    <Route path="/login" element={<Login />} />

                    {/* Redirection racine vers le dashboard du département */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DepartmentRedirect />
                            </ProtectedRoute>
                        }
                    />
                    {/* Routes protégées - Direction */}
                    <Route
                        path="/departments/dir"
                        element={
                            <ProtectedRoute>
                                <DepartmentLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<DirectionDashboard />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="reports/new" element={<NewReport />} />
                        <Route path="overview" element={<VueConsolidee />} />
                        <Route path="departments" element={<DepartmentsList />} />
                        <Route path="objectives" element={<Objectives />} />
                        <Route path="stats" element={<div className="card">Statistiques (à venir)</div>} />
                        <Route path="notifications" element={<div className="card">Notifications (à venir)</div>} />
                        <Route path="settings" element={<div className="card">Paramètres (à venir)</div>} />
                    </Route>

                    {/* Routes protégées - Comptabilité */}
                    <Route
                        path="/departments/comptabilite"
                        element={
                            <ProtectedRoute>
                                <DepartmentLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<ComptabiliteDashboard />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="reports/new" element={<NewReport />} />
                        <Route path="bilans" element={<div className="card">Bilans (à venir)</div>} />
                        <Route path="budget" element={<div className="card">Budget (à venir)</div>} />
                        <Route path="stats" element={<div className="card">Statistiques (à venir)</div>} />
                        <Route path="notifications" element={<div className="card">Notifications (à venir)</div>} />
                        <Route path="settings" element={<div className="card">Paramètres (à venir)</div>} />
                    </Route>

                    {/* Routes protégées - Bureau d'Étude */}
                    <Route
                        path="/departments/bureau-etude"
                        element={
                            <ProtectedRoute>
                                <DepartmentLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<BureauEtudeDashboard />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="reports/new" element={<NewReport />} />
                        <Route path="projects" element={<div className="card">Projets (à venir)</div>} />
                        <Route path="research" element={<div className="card">Recherche (à venir)</div>} />
                        <Route path="stats" element={<div className="card">Statistiques (à venir)</div>} />
                        <Route path="notifications" element={<div className="card">Notifications (à venir)</div>} />
                        <Route path="settings" element={<div className="card">Paramètres (à venir)</div>} />
                    </Route>

                    {/* Routes protégées - Maintenance */}
                    <Route
                        path="/departments/maintenance"
                        element={
                            <ProtectedRoute>
                                <DepartmentLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<MaintenanceDashboard />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="reports/new" element={<NewReport />} />
                        <Route path="interventions" element={<div className="card">Interventions (à venir)</div>} />
                        <Route path="equipments" element={<div className="card">Équipements (à venir)</div>} />
                        <Route path="stats" element={<div className="card">Statistiques (à venir)</div>} />
                        <Route path="notifications" element={<div className="card">Notifications (à venir)</div>} />
                        <Route path="settings" element={<div className="card">Paramètres (à venir)</div>} />
                    </Route>

                    {/* Routes protégées - Filature */}
                    <Route
                        path="/departments/filature"
                        element={
                            <ProtectedRoute>
                                <DepartmentLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<FilatureDashboard />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="reports/new" element={<NewReport />} />
                        <Route path="production" element={<div className="card">Production (à venir)</div>} />
                        <Route path="quality" element={<div className="card">Qualité (à venir)</div>} />
                        <Route path="stats" element={<div className="card">Statistiques (à venir)</div>} />
                        <Route path="notifications" element={<div className="card">Notifications (à venir)</div>} />
                        <Route path="settings" element={<div className="card">Paramètres (à venir)</div>} />
                    </Route>

                    {/* Routes protégées - Impression */}
                    <Route
                        path="/departments/impression"
                        element={
                            <ProtectedRoute>
                                <DepartmentLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<ImpressionDashboard />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="reports/new" element={<NewReport />} />
                        <Route path="orders" element={<div className="card">Commandes (à venir)</div>} />
                        <Route path="designs" element={<div className="card">Designs (à venir)</div>} />
                        <Route path="stats" element={<div className="card">Statistiques (à venir)</div>} />
                        <Route path="notifications" element={<div className="card">Notifications (à venir)</div>} />
                        <Route path="settings" element={<div className="card">Paramètres (à venir)</div>} />
                    </Route>

                    {/* Routes protégées - Stock */}
                    <Route
                        path="/departments/stock"
                        element={
                            <ProtectedRoute>
                                <DepartmentLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<StockDashboard />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="reports/new" element={<NewReport />} />
                        <Route path="inventory" element={<div className="card">Inventaire (à venir)</div>} />
                        <Route path="movements" element={<div className="card">Mouvements (à venir)</div>} />
                        <Route path="stats" element={<div className="card">Statistiques (à venir)</div>} />
                        <Route path="notifications" element={<div className="card">Notifications (à venir)</div>} />
                        <Route path="settings" element={<div className="card">Paramètres (à venir)</div>} />
                    </Route>

                    {/* Routes protégées - Achats */}
                    <Route
                        path="/departments/achats"
                        element={
                            <ProtectedRoute>
                                <DepartmentLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<AchatsDashboard />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="reports/new" element={<NewReport />} />
                        <Route path="suppliers" element={<div className="card">Fournisseurs (à venir)</div>} />
                        <Route path="purchase-orders" element={<div className="card">Commandes (à venir)</div>} />
                        <Route path="stats" element={<div className="card">Statistiques (à venir)</div>} />
                        <Route path="notifications" element={<div className="card">Notifications (à venir)</div>} />
                        <Route path="settings" element={<div className="card">Paramètres (à venir)</div>} />
                    </Route>

                    {/* Routes protégées - Commercial */}
                    <Route
                        path="/departments/commercial"
                        element={
                            <ProtectedRoute>
                                <DepartmentLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<CommercialDashboard />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="reports/new" element={<NewReport />} />
                        <Route path="clients" element={<div className="card">Clients (à venir)</div>} />
                        <Route path="sales" element={<div className="card">Ventes (à venir)</div>} />
                        <Route path="stats" element={<div className="card">Statistiques (à venir)</div>} />
                        <Route path="notifications" element={<div className="card">Notifications (à venir)</div>} />
                        <Route path="settings" element={<div className="card">Paramètres (à venir)</div>} />
                    </Route>

                    {/* Routes protégées - Informatique */}
                    <Route
                        path="/departments/informatique"
                        element={
                            <ProtectedRoute>
                                <DepartmentLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<InformatiqueDashboard />} />
                        <Route path="reports" element={<RapportsIT />} />
                        <Route path="reports/new" element={<NewReportIT />} />
                        <Route path="reports/new" element={<NewReport />} />
                        <Route path="tickets" element={<TicketsIT />} />
                        <Route path="systems" element={<SystemsMonitoring />} />
                        <Route path="admin" element={<SystemAdmin />} />
                        <Route path="stats" element={<StatistiquesIT />} />
                        <Route path="settings" element={<ParametresIT />} />
                        <Route path="notifications" element={<NotificationsIT />} />
                    </Route>

                    {/* Routes protégées - RH */}
                    <Route
                        path="/departments/rh"
                        element={
                            <ProtectedRoute>
                                <DepartmentLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<RHDashboard />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="reports/new" element={<NewReport />} />
                        <Route path="employees" element={<div className="card">Employés (à venir)</div>} />
                        <Route path="leaves" element={<div className="card">Congés (à venir)</div>} />
                        <Route path="stats" element={<div className="card">Statistiques (à venir)</div>} />
                        <Route path="notifications" element={<div className="card">Notifications (à venir)</div>} />
                        <Route path="settings" element={<div className="card">Paramètres (à venir)</div>} />
                    </Route>

                    {/* Route 404 */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <SpeedInsights />
                <Analytics />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;