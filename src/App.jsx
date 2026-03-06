import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import NotFoundRedirect from "./pages/NotFoundRedirect.jsx";

import DepartmentDashboardRouter from "./pages/departments/dashboard/DepartmentDashboardRouter.jsx";
import {
    DepartmentsList,
    SystemAdmin,
} from "./pages/departments/dashboard/index.js";

import { AuthProvider } from "./context/AuthContext.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DepartmentRedirect from "./components/DepartmentRedirect.jsx";
import DepartmentLayout from "./components/DepartmentLayout.jsx";

import Reports from "./pages/departments/reports/Reports.jsx";
import ReportBuilder from "./pages/departments/reports/builder/ReportBuilder.jsx";
import ReportDetails from "./pages/departments/reports/reportDetails.jsx";

import ParametresIT from "./pages/departments/subIT/ParametresIT.jsx";
import Data from "./pages/departments/dataEntry/dataPage.jsx";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    {/* LOGIN */}
                    <Route path="/login" element={<Login />} />

                    <Route
                        path="/departments/:deptName"
                        element={
                            <ProtectedRoute>
                                <DepartmentLayout />
                            </ProtectedRoute>
                        }
                    >

                        {/* Dashboard */}
                        <Route index element={<DepartmentDashboardRouter />} />
                        <Route path="dashboard" element={<DepartmentDashboardRouter />} />

                        {/* Shared */}
                        <Route path="notifications" element={<div className="card">Notifications</div>} />
                        <Route path="settings" element={<ParametresIT />} />
                        <Route path="data" element={<Data />} />

                        {/* Reports*/}
                        <Route path="reports">
                            <Route index element={<Reports />} />
                            <Route path="builder" element={<ReportBuilder />} />
                            <Route path=":id" element={<ReportDetails />} />
                        </Route>

                        {/* RH */}
                        <Route path="employees" element={<div className="card">Employés</div>} />
                        <Route path="leaves" element={<div className="card">Congés</div>} />

                        {/* Commercial */}
                        <Route path="clients" element={<div className="card">Clients</div>} />
                        <Route path="sales" element={<div className="card">Ventes</div>} />

                        {/* Achats */}
                        <Route path="suppliers" element={<div className="card">Fournisseurs</div>} />
                        <Route path="purchase-orders" element={<div className="card">Commandes</div>} />
                        <Route path="purchase-request" element={<div className="card">Demande d'appro</div>} />
                        <Route path="purchases-buil" element={<div className="card">Bon de Commande</div>} />
                        <Route path="reception" element={<div className="card">Réception Marchandises</div>} />

                        {/* Impression */}
                        <Route path="orders" element={<div className="card">Commandes</div>} />
                        <Route path="designs" element={<div className="card">Designs</div>} />

                        {/* Filature */}
                        <Route path="production" element={<div className="card">Production</div>} />
                        <Route path="quality" element={<div className="card">Qualité</div>} />

                        {/* Maintenance */}
                        <Route path="interventions" element={<div className="card">Interventions</div>} />
                        <Route path="equipments" element={<div className="card">Équipements</div>} />

                        {/* Bureau étude */}
                        <Route path="projects" element={<div className="card">Projets</div>} />
                        <Route path="research" element={<div className="card">Recherche</div>} />

                        {/* Comptabilité */}
                        <Route path="bilans" element={<div className="card">Bilans</div>} />
                        <Route path="budget" element={<div className="card">Budget</div>} />
                        <Route path="journal" element={<div className="card">Journal</div>} />
                        <Route path="analyse" element={<div className="card">Analyse</div>} />
                        <Route path="banque" element={<div className="card">Banque</div>} />
                        <Route path="factures" element={<div className="card">Factures</div>} />
                        <Route path="raports" element={<div className="card">Rapport Etat Financier</div>} />

                        {/* Direction */}
                        <Route path="overview" element={<div className="card">Overview</div>} />
                        <Route path="departments" element={<DepartmentsList />} />
                        <Route path="objectives" element={<div className="card">Objectifs</div>} />

                        {/* IT */}
                        <Route path="tickets" element={<div className="card">Tickets</div>} />
                        <Route path="systems" element={<div className="card">Systèmes</div>} />
                        <Route path="admin" element={<SystemAdmin />} />

                        {/* Stock */}
                        <Route path="inventory" element={<div className="card">Inventaire</div>} />
                        <Route path="movements" element={<div className="card">Mouvements</div>} />

                        {/* ================================================= */}
                        {/* DEPARTMENT 404 */}
                        {/* ================================================= */}

                        <Route path="*" element={<NotFoundRedirect to="dashboard" />} />

                    </Route>


                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DepartmentRedirect />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<NotFoundRedirect to="/" />} />

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;