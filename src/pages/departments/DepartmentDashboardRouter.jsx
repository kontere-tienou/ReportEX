import {Navigate, useParams} from "react-router-dom";

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
    RHDashboard,
    DirectionDashboard,
} from ".";

const DepartmentDashboardRouter = () => {
    const { deptName } = useParams();

    const dashboards = {
        dir: <DirectionDashboard />,
        comptabilite: <ComptabiliteDashboard />,
        bureauetude: <BureauEtudeDashboard />,
        maintenance: <MaintenanceDashboard />,
        filature: <FilatureDashboard />,
        impression: <ImpressionDashboard />,
        stock: <StockDashboard />,
        achats: <AchatsDashboard />,
        commercial: <CommercialDashboard />,
        informatique: <InformatiqueDashboard />,
        rh: <RHDashboard />,
    };
    return dashboards[deptName] || <div><Navigate to="/" />Département non trouvé</div>;
};

export default DepartmentDashboardRouter;
