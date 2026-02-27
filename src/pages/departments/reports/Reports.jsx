import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { reportService } from "../../../services/api.js";
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
    TrendingUp,
    Download,
    Lock,
} from "lucide-react";
import NewReportModal from "./NewReportModal.jsx";

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
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}
        >
      <Icon className="w-4 h-4 mr-1" />
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
    );
};

export default function Reports() {
    const navigate = useNavigate();
    const { deptName } = useParams();
    const { user } = useAuth();

    // Check if user is DG/Admin
    const isDirection = useMemo(() => {
        return ["DG", "ADMIN"].includes(user?.role?.toUpperCase());
    }, [user]);

    // State
    const [reports, setReports] = useState([]);
    const [departmentStats, setDepartmentStats] = useState({
        total: 0,
        brouillon: 0,
        soumis: 0,
        valide: 0,
        rejete: 0,
    });
    const [loading, setLoading] = useState(true);

    // Filters - Updated with new options
    const [filter, setFilter] = useState("mes-rapports");
    const [view, setView] = useState("grid");
    const [searchTerm, setSearchTerm] = useState("");

    // Modal
    const [openNew, setOpenNew] = useState(false);

// Helpers
    const extractReports = (res) => {
        const payload = res?.data?.data ?? res?.data ?? {};
        return payload?.reports ?? [];
    };

    const extractStats = (res) => {
        const payload = res?.data?.data ?? res?.data ?? {};
        return payload?.stats ?? {};
    };

// /reports peut renvoyer 403 selon visibility => on retourne [] sans bruit
    const safeGetAllReports = async (params) => {
        try {
            return await reportService.getAllReports(params);
        } catch (err) {
            if (err?.response?.status === 403) return { data: { reports: [] } };
            throw err;
        }
    };

// /reports/stats/:id peut renvoyer 403 => stats = 0 sans bruit
    const safeGetDepartmentStats = async (deptId, params) => {
        try {
            return await reportService.getDepartmentStats(deptId, params);
        } catch (err) {
            if (err?.response?.status === 403) return { data: { stats: {} } };
            throw err;
        }
    };

// ==============================
// Load department stats
// ==============================
    const loadDepartmentStats = async () => {
        if (!user?.department_id) return;

        try {
            // IMPORTANT: ici tu passes bien un OBJET params (pas une string)
            const res = await safeGetDepartmentStats(user.department_id, {
                visibility: "department", // stats de son département
            });

            const stats = extractStats(res);

            setDepartmentStats({
                total: parseInt(stats.total) || 0,
                brouillon: parseInt(stats.drafts || stats.brouillon) || 0,
                soumis: parseInt(stats.pending || stats.soumis) || 0,
                valide: parseInt(stats.validated || stats.valide) || 0,
                rejete: parseInt(stats.rejected || stats.rejete) || 0,
            });
        } catch (_) {
            // silence (pas de console.error)
            setDepartmentStats({ total: 0, brouillon: 0, soumis: 0, valide: 0, rejete: 0 });
        }
    };

// ==============================
// Load reports based on filter
// ==============================
    const loadReports = async () => {
        setLoading(true);

        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;

            let reportsData = [];

            if (filter === "mes-rapports") {
                const res = await reportService.getMyReports(params);
                reportsData = extractReports(res);
            } else if (filter === "tous") {
                if (isDirection) {
                    // DG/Admin voit tout
                    const res = await reportService.getAllReports(params);
                    reportsData = extractReports(res);
                } else {
                    // Non-DG :
                    // - mes rapports
                    // - public (tous départements)
                    // - department (uniquement mon département)
                    const [myRes, publicRes, deptRes] = await Promise.all([
                        reportService.getMyReports(params),
                        safeGetAllReports({ ...params, visibility: "public" }),
                        safeGetAllReports({
                            ...params,
                            department_id: user.department_id,
                            visibility: "department",
                        }),
                    ]);

                    const myReports = extractReports(myRes);
                    const publicReports = extractReports(publicRes);
                    const deptReports = extractReports(deptRes);

                    // merge + dedupe par id
                    const map = new Map();
                    [...myReports, ...publicReports, ...deptReports].forEach((r) => {
                        if (r?.id != null) map.set(r.id, r);
                    });

                    reportsData = Array.from(map.values());
                }
            } else {
                // Filter par statut (soumis, valide, rejete)
                const statusParams = { ...params, status: filter };

                if (isDirection) {
                    const res = await reportService.getAllReports(statusParams);
                    reportsData = extractReports(res);
                } else {
                    const res = await reportService.getMyReports(statusParams);
                    reportsData = extractReports(res);
                }
            }

            setReports(reportsData);
        } catch (_) {
            // silence (pas de console.error)
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDepartmentStats();
        loadReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, isDirection]);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => loadReports(), 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const goDetails = (report) => {
        // Check if user can access this report
        const isOwner = report.user_id === user.id;
        const isDG = isDirection;
        const sameDept = report.department_id === user.department_id;
        const isPublic = report.visibility === "public";
        const isDepartment = report.visibility === "department";

        // Determine if user needs to request access
        const needsAccess =
            !isOwner &&
            !isDG &&
            report.visibility === "private" &&
            !sameDept;

        if (needsAccess) {
            // Will handle access request in ReportDetails page
            navigate(`/departments/${deptName}/reports/${report.id}`);
        } else {
            navigate(`/departments/${deptName}/reports/${report.id}`);
        }
    };

    const handleExportReports = () => {
        alert("Export fonctionnalité à venir");
    };

    // Check if report is accessible
    const isReportAccessible = (report) => {
        const isOwner = report.user_id === user.id;
        const isDG = isDirection;
        const sameDept = report.department_id === user.department_id;
        const isPublic = report.visibility === "public";
        const isDepartment = report.visibility === "department";

        // Owner and DG can access everything
        if (isOwner || isDG) return true;

        // Public reports accessible to all
        if (isPublic) return true;

        // Department reports accessible to same department
        if (isDepartment && sameDept) return true;

        // Private reports need access request
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
                        {isDirection
                            ? "Vue consolidée de tous les départements"
                            : `Département ${user?.department?.name || ""}`}
                    </p>
                </div>

                <div className="flex gap-2">
                    {isDirection && (
                        <button
                            onClick={handleExportReports}
                            className="inline-flex items-center rounded-lg bg-gray-600 text-white px-4 py-2 font-medium hover:bg-gray-700"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </button>
                    )}
                    {!isDirection && (
                        <button
                            onClick={() => setOpenNew(true)}
                            className="inline-flex items-center rounded-lg bg-cyan-600 text-white px-4 py-2 font-medium hover:bg-cyan-700"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nouveau Rapport
                        </button>
                    )}
                </div>
            </div>

            {/* Department Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl border p-5 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-xs text-blue-100 mb-1">Total Département</p>
                            <p className="text-3xl font-bold">{departmentStats.total}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-full">
                            <Building2 className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-xs text-blue-100 mt-2">
                        {user?.department?.name || "Département"}
                    </p>
                </div>

                <div className="bg-white rounded-xl border p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Brouillons</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {departmentStats.brouillon}
                            </p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-full">
                            <Clock className="w-5 h-5 text-gray-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Soumis</p>
                            <p className="text-2xl font-bold text-blue-900">
                                {departmentStats.soumis}
                            </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <AlertCircle className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Validés</p>
                            <p className="text-2xl font-bold text-green-900">
                                {departmentStats.valide}
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Rejetés</p>
                            <p className="text-2xl font-bold text-red-900">
                                {departmentStats.rejete}
                            </p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full">
                            <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="rounded-xl border bg-white p-4 space-y-4">
                {/* Status Filter - Updated */}
                <div className="flex flex-wrap items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Afficher:</span>

                    <button
                        onClick={() => setFilter("mes-rapports")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === "mes-rapports"
                                ? "bg-cyan-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Mes Rapports
                    </button>

                    <button
                        onClick={() => setFilter("tous")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === "tous"
                                ? "bg-cyan-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Tous
                    </button>

                    <div className="h-6 w-px bg-gray-300 mx-2"></div>

                    <button
                        onClick={() => setFilter("soumis")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === "soumis"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Soumis
                    </button>

                    <button
                        onClick={() => setFilter("valide")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === "valide"
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Validés
                    </button>

                    <button
                        onClick={() => setFilter("rejete")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === "rejete"
                                ? "bg-red-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Rejetés
                    </button>
                </div>

                {/* Search and View */}
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher par auteur, département..."
                            className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-cyan-600"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setView("list")}
                            className={`p-2 rounded-lg border ${
                                view === "list" ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                            }`}
                            title="Vue liste"
                        >
                            <List className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setView("grid")}
                            className={`p-2 rounded-lg border ${
                                view === "grid" ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                            }`}
                            title="Vue grille"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                </div>
            ) : reports.length === 0 ? (
                <div className="rounded-xl border bg-white p-10 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Aucun rapport
                    </h3>
                    <p className="text-gray-600">
                        {filter === "mes-rapports"
                            ? "Vous n'avez pas encore créé de rapport."
                            : "Aucun rapport disponible selon les filtres."}
                    </p>

                    {!isDirection && filter === "mes-rapports" && (
                        <button
                            onClick={() => setOpenNew(true)}
                            className="mt-5 inline-flex items-center rounded-lg bg-cyan-600 text-white px-4 py-2 font-medium hover:bg-cyan-700"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Créer un rapport
                        </button>
                    )}
                </div>
            ) : view === "grid" ? (
                // GRID VIEW
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {reports.map((r) => {
                        const accessible = isReportAccessible(r);
                        const isOwner = r.user_id === user.id;

                        return (
                            <div
                                key={r.id}
                                className={`rounded-xl border bg-white p-5 transition-shadow cursor-pointer group ${
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
                                            {!accessible && !isDirection && (
                                                <span className="flex items-center text-xs text-amber-600">
                          <Lock className="w-3 h-3 mr-1" />
                          Privé
                        </span>
                                            )}
                                        </div>
                                        <h3
                                            className={`text-lg font-semibold text-gray-900 ${
                                                accessible ? "group-hover:text-cyan-600" : ""
                                            } transition-colors`}
                                        >
                                            Rapport #{r.id}
                                        </h3>
                                    </div>
                                    <StatusBadge status={r.status} />
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>
                      {new Date(r.period_start).toLocaleDateString()} -{" "}
                                            {new Date(r.period_end).toLocaleDateString()}
                    </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <User2 className="w-4 h-4 mr-2" />
                                        <span>{r.author_name || "—"}</span>
                                        {isOwner && (
                                            <span className="ml-2 text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                        Vous
                      </span>
                                        )}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-2" />
                                        <span>
                      Créé le {new Date(r.created_at).toLocaleDateString()}
                    </span>
                                    </div>
                                </div>

                                {r.status === "rejete" && r.rejection_reason && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                        <p className="text-xs text-red-700">
                                            <strong>Rejeté:</strong> {r.rejection_reason}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t">
                                    <div className="flex items-center text-xs text-gray-500 capitalize">
                                        <Eye className="w-3 h-3 mr-1" />
                                        {r.visibility || "private"}
                                    </div>
                                    <span
                                        className={`text-sm font-medium ${
                                            accessible
                                                ? "text-cyan-600 group-hover:underline"
                                                : "text-amber-600"
                                        }`}
                                    >
                    {accessible ? "Voir détails →" : "Demander accès →"}
                  </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // LIST VIEW
                <div className="rounded-xl border bg-white overflow-hidden">
                    <div className="grid grid-cols-12 bg-gray-50 text-xs font-semibold text-gray-600 px-4 py-3">
                        <div className="col-span-1">ID</div>
                        <div className="col-span-2">Département</div>
                        <div className="col-span-2">Auteur</div>
                        <div className="col-span-3">Période</div>
                        <div className="col-span-2">Statut</div>
                        <div className="col-span-1">Visibilité</div>
                        <div className="col-span-1 text-right">Accès</div>
                    </div>

                    {reports.map((r) => {
                        const accessible = isReportAccessible(r);
                        const isOwner = r.user_id === user.id;

                        return (
                            <div
                                key={r.id}
                                className={`grid grid-cols-12 px-4 py-3 border-t hover:bg-gray-50 cursor-pointer items-center ${
                                    !accessible ? "opacity-75" : ""
                                }`}
                                onClick={() => goDetails(r)}
                            >
                                <div className="col-span-1 text-sm font-mono text-gray-900">
                                    #{r.id}
                                </div>
                                <div className="col-span-2 text-sm text-gray-700">
                                    {r.department_name || "—"}
                                </div>
                                <div className="col-span-2 text-sm text-gray-700">
                                    {r.author_name || "—"}
                                    {isOwner && (
                                        <span className="ml-2 text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                      Vous
                    </span>
                                    )}
                                </div>
                                <div className="col-span-3 text-sm text-gray-700">
                                    {new Date(r.period_start).toLocaleDateString()} -{" "}
                                    {new Date(r.period_end).toLocaleDateString()}
                                </div>
                                <div className="col-span-2">
                                    <StatusBadge status={r.status} />
                                </div>
                                <div className="col-span-1 text-xs text-gray-600 capitalize">
                                    {r.visibility || "—"}
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    {accessible ? (
                                        <Eye className="w-4 h-4 text-cyan-600" />
                                    ) : (
                                        <Lock className="w-4 h-4 text-amber-600" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal create report */}
            <NewReportModal
                open={openNew}
                onClose={() => setOpenNew(false)}
                onCreated={loadReports}
            />
        </div>
    );
}