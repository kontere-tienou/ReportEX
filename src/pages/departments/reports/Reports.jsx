import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import {
    Plus,
    FileText,
    Calendar,
    Filter,
    LayoutGrid,
    List,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Eye,
    Search,
    User2,
    Building2,
    Download,
    Lock,
    Wand2,
} from "lucide-react";
import {reportService} from "./services/reportApi.js";

const statusBadgeMap = {
    brouillon: { bg: "bg-gray-100", text: "text-gray-700", icon: Clock },
    soumis: { bg: "bg-blue-100", text: "text-blue-700", icon: AlertCircle },
    valide: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
    rejete: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
};

const StatusBadge = ({ status }) => {
    const badge = statusBadgeMap[status] || statusBadgeMap.brouillon;
    const Icon = badge.icon;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
      <Icon className="w-4 h-4 mr-1" />
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
    );
};

export default function Reports() {
    const navigate = useNavigate();
    const { deptName } = useParams();
    const { user } = useAuth();

    const isDirection = useMemo(() => {
        return ["DG"].includes(user?.role?.toUpperCase());
    }, [user?.role]);

    const [reports, setReports] = useState([]);
    const [departmentStats, setDepartmentStats] = useState({
        total: 0,
        brouillon: 0,
        soumis: 0,
        valide: 0,
        rejete: 0,
    });




    const [loading, setLoading] = useState(true);
    //const [filter, setFilter] = useState("mes-rapports");
    const [filter, setFilter] = useState(isDirection ? "tous" : "mes-rapports");
    const [view, setView] = useState("grid");
    const [searchTerm, setSearchTerm] = useState("");

    const loadDepartmentStats = async () => {
        if (!isDirection || !user?.department_id) return;

        try {
            const res = await reportService.getDepartmentStats(user.department_id);
            const stats = res.data?.stats || res.data?.data?.stats || {};

            setDepartmentStats({
                total: parseInt(stats.total) || 0,
                brouillon: parseInt(stats.drafts || stats.brouillon) || 0,
                soumis: parseInt(stats.pending || stats.soumis) || 0,
                valide: parseInt(stats.validated || stats.valide) || 0,
                rejete: parseInt(stats.rejected || stats.rejete) || 0,
            });
        } catch (e) {
            console.error("Erreur stats département:", e);
        }
    };

    /*const loadReports = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;

            let reportsData = [];

            if (filter === "mes-rapports") {
                const res = await reportService.getMy(params);
                reportsData = res.data?.data?.reports || res.data?.reports || [];
            } else if (filter === "tous") {
                if (isDirection) {
                    const res = await reportService.getAll(params);
                    reportsData = res.data?.data?.reports || res.data?.reports || [];
                } else {
                    const [myRes, deptRes] = await Promise.all([
                        reportService.getMy(params),
                        reportService.getAll({
                            ...params,
                            department_id: user.department_id,
                            visibility: "department",
                        }).catch(() => ({ data: { reports: [] } })),
                    ]);
                    const myReports = myRes.data?.data?.reports || myRes.data?.reports || [];
                    const deptReports = deptRes.data?.data?.reports || deptRes.data?.reports || [];

                    const combined = [...myReports];
                    deptReports.forEach((dr) => {
                        if (!combined.find((mr) => mr.id === dr.id)) {
                            combined.push(dr);
                        }
                    });

                    reportsData = combined;
                }
            } else {
                params.status = filter;
                const res = isDirection
                    ? await reportService.getAll(params)
                    : await reportService.getMy(params);
                reportsData = res.data?.data?.reports || res.data?.reports || [];
            }

            setReports(reportsData);
        } catch (e) {
            console.error("Erreur chargement rapports:", e);
        } finally {
            setLoading(false);
        }
    };*/
    const loadReports = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;

            let reportsData = [];

            if (filter === "mes-rapports") {
                const res = await reportService.getMy(params);
                reportsData = res.data?.data?.reports || res.data?.reports || [];
            } else if (filter === "tous") {
                if (isDirection) {
                    const res = await reportService.getAll(params);
                    reportsData = res.data?.data?.reports || res.data?.reports || [];
                } else {
                    const [myRes, publicRes] = await Promise.all([
                        reportService.getMy(params),
                        reportService.getAll({ ...params, visibility: "public" }),
                    ]);

                    const myReports = myRes.data?.data?.reports || myRes.data?.reports || [];
                    const publicReports = publicRes.data?.data?.reports || publicRes.data?.reports || [];

                    const combined = [...myReports];
                    publicReports.forEach((pr) => {
                        if (!combined.find((r) => r.id === pr.id)) {
                            combined.push(pr);
                        }
                    });

                    reportsData = combined;
                }
            } else {
                params.status = filter;

                if (isDirection) {
                    const res = await reportService.getAll(params);
                    reportsData = res.data?.data?.reports || res.data?.reports || [];
                } else {
                    const [myRes, publicRes] = await Promise.all([
                        reportService.getMy(params),
                        reportService.getAll({ ...params, status: filter, visibility: "public" }),
                    ]);

                    const myReports = myRes.data?.data?.reports || myRes.data?.reports || [];
                    const publicReports = publicRes.data?.data?.reports || publicRes.data?.reports || [];

                    const combined = [...myReports];
                    publicReports.forEach((pr) => {
                        if (!combined.find((r) => r.id === pr.id)) {
                            combined.push(pr);
                        }
                    });

                    reportsData = combined;
                }
            }

            setReports(reportsData);
        } catch (e) {
            console.error("Erreur chargement rapports:", e);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (isDirection) {
            loadDepartmentStats();
        }
        loadReports();
    }, [filter, isDirection]);

    useEffect(() => {
        const timer = setTimeout(() => loadReports(), 350);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const goDetails = (report) => {
        navigate(`/departments/${deptName}/reports/${report.id}`);
    };

    const handleCreateCustomReport = () => {
        navigate(`/departments/${deptName}/reports/builder`);
    };

    const isReportAccessible = (report) => {
        const isOwner = report.user_id === user.id;
        const isDG = isDirection;
        const sameDept = report.department_id === user.department_id;
        const isPublic = report.visibility === "public";
        const isDepartment = report.visibility === "department";

        if (isOwner || isDG) return true;
        if (isPublic) return true;
        if (isDepartment && sameDept) return true;
        return false;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isDirection ? "Tous les Rapports" : "Mes Rapports"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isDirection ? "Vue consolidée" : `Département ${user?.department?.name || ""}`}
                    </p>
                </div>

                <div className="flex gap-2">
                    {!isDirection && (
                        <button
                            onClick={handleCreateCustomReport}
                            className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 font-medium hover:from-purple-700 hover:to-pink-700 shadow-lg"
                        >
                            <Wand2 className="w-5 h-5 mr-2" />
                            Generer un rapport
                        </button>
                    )}
                </div>
            </div>


            {/* Banner Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                    <Wand2 className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-purple-900">
                            ✨ Nouveau : Créateur de Rapports Personnalisés
                        </p>
                        <p className="text-xs text-purple-700 mt-1">
                            Créez des rapports sur mesure avec graphiques et métriques en glissant-déposant les composants.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-xl border bg-white p-4 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Afficher:</span>

                    {/* Conditional filter buttons based on role */}
                    {!isDirection && (
                        <button
                            onClick={() => setFilter("mes-rapports")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === "mes-rapports" ? "bg-cyan-600 text-white" : "bg-gray-100 text-gray-700"
                            }`}
                        >
                            Mes Rapports
                        </button>
                    )}

                    <button
                        onClick={() => setFilter("tous")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === "tous" ? "bg-cyan-600 text-white" : "bg-gray-100 text-gray-700"
                        }`}
                    >
                        Tous
                    </button>

                    <div className="h-6 w-px bg-gray-300 mx-2"></div>

                    <button
                        onClick={() => setFilter("soumis")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === "soumis" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                        }`}
                    >
                        Soumis
                    </button>

                    <button
                        onClick={() => setFilter("valide")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === "valide" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"
                        }`}
                    >
                        Validés
                    </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher..."
                            className="pl-9 pr-3 py-2 rounded-lg border w-full focus:ring-2 focus:ring-cyan-600"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setView("list")}
                            className={`p-2 rounded-lg border ${view === "list" ? "bg-gray-100" : "bg-white"}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setView("grid")}
                            className={`p-2 rounded-lg border ${view === "grid" ? "bg-gray-100" : "bg-white"}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                </div>
            ) : reports.length === 0 ? (
                <div className="rounded-xl border bg-white p-10 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun rapport</h3>
                    <p className="text-gray-600 mb-6">
                        {filter === "mes-rapports"
                            ? "Vous n'avez pas encore créé de rapport."
                            : "Aucun rapport disponible."}
                    </p>
                    {!isDirection && filter === "mes-rapports" && (
                        <button
                            onClick={handleCreateCustomReport}
                            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg shadow-lg"
                        >
                            <Wand2 className="w-5 h-5 mr-2" />
                            Créer mon premier rapport
                        </button>
                    )}
                </div>
            ) : view === "grid" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {reports.map((r) => {
                        const accessible = isReportAccessible(r);
                        const isOwner = r.user_id === user.id;

                        return (
                            <div
                                key={r.id}
                                className={`rounded-xl border bg-white p-5 transition-shadow cursor-pointer ${
                                    accessible ? "hover:shadow-lg" : "opacity-75"
                                }`}
                                onClick={() => goDetails(r)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building2 className="w-4 h-4 text-gray-500" />
                                            <span className="text-xs font-medium text-gray-600">
                        {r.department_name || "—"}
                      </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Rapport #{r.id}
                                        </h3>
                                    </div>
                                    <StatusBadge status={r.status} />
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {new Date(r.period_start).toLocaleDateString()} - {new Date(r.period_end).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <User2 className="w-4 h-4 mr-2" />
                                        {r.author_name}
                                        {isOwner && (
                                            <span className="ml-2 text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                        Vous
                      </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t">
                                    <span className="text-xs text-gray-500 capitalize">{r.visibility}</span>
                                    <span className="text-sm font-medium text-cyan-600">
                    {accessible ? "Voir détails →" : "Demander accès →"}
                  </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-xl border bg-white overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Département</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Auteur</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Période</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Statut</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reports.map((r, idx) => (
                            <tr
                                key={r.id}
                                className={`border-t cursor-pointer hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                onClick={() => goDetails(r)}
                            >
                                <td className="px-4 py-3 text-sm">#{r.id}</td>
                                <td className="px-4 py-3 text-sm">{r.department_name}</td>
                                <td className="px-4 py-3 text-sm">{r.author_name}</td>
                                <td className="px-4 py-3 text-sm">
                                    {new Date(r.period_start).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={r.status} />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}