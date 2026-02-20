import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reportService } from "../../../services/api.js";
import { useAuth } from "../../../context/AuthContext.jsx";

import {
    Plus, FileText, Calendar, Filter, LayoutGrid, List,
    CheckCircle, XCircle, Clock, AlertCircle, Eye, Search
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
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
      <Icon className="w-4 h-4 mr-1" />
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
    );
};

export default function Reports() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const isDirection = useMemo(() => {
        // adapte selon ton backend: role = 'direction' ou department_id = 11 etc
        return user?.role === "direction" || user?.department_id === 11 || user?.department?.id === 11;
    }, [user]);

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState("all");
    const [view, setView] = useState("grid"); // grid | list
    const [q, setQ] = useState("");

    const [openNew, setOpenNew] = useState(false);

    const loadReports = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter !== "all") params.status = filter;
            if (q) params.q = q;

            // direction => tous les rapports
            const res = isDirection
                ? await reportService.getAllReports(params)
                : await reportService.getMyReports(params);

            setReports(res.data.reports || []);
        } catch (e) {
            console.error("Erreur chargement rapports:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, [filter, isDirection]);

    // search debounce simple
    useEffect(() => {
        const t = setTimeout(() => loadReports(), 350);
        return () => clearTimeout(t);
    }, [q]);

    const goDetails = (id) => navigate(`/reports/${id}`);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isDirection ? "Rapports (Direction)" : "Mes Rapports"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isDirection
                            ? "Vue consolidée des rapports de tous les départements"
                            : "Gérez et consultez vos rapports"}
                    </p>
                </div>

                {!isDirection && (
                    <button
                        onClick={() => setOpenNew(true)}
                        className="inline-flex items-center rounded-lg bg-primary-600 text-white px-4 py-2 font-medium hover:bg-primary-700"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nouveau Rapport
                    </button>
                )}
            </div>

            {/* Toolbar */}
            <div className="rounded-xl border bg-white p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filtrer:</span>

                    {[
                        { value: "all", label: "Tous" },
                        { value: "brouillon", label: "Brouillons" },
                        { value: "soumis", label: "Soumis" },
                        { value: "valide", label: "Validés" },
                        { value: "rejete", label: "Rejetés" },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setFilter(opt.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === opt.value
                                    ? "bg-primary-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Rechercher..."
                            className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 w-[240px] focus:outline-none focus:ring-2 focus:ring-primary-600"
                        />
                    </div>

                    <button
                        onClick={() => setView("list")}
                        className={`p-2 rounded-lg border ${view === "list" ? "bg-gray-100" : "bg-white hover:bg-gray-50"}`}
                        title="Liste"
                    >
                        <List className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setView("grid")}
                        className={`p-2 rounded-lg border ${view === "grid" ? "bg-gray-100" : "bg-white hover:bg-gray-50"}`}
                        title="Thumbnails"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : reports.length === 0 ? (
                <div className="rounded-xl border bg-white p-10 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun rapport</h3>
                    <p className="text-gray-600">
                        {isDirection ? "Aucun rapport disponible selon les filtres." : "Créez votre premier rapport."}
                    </p>

                    {!isDirection && (
                        <button
                            onClick={() => setOpenNew(true)}
                            className="mt-5 inline-flex items-center rounded-lg bg-primary-600 text-white px-4 py-2 font-medium hover:bg-primary-700"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Créer un rapport
                        </button>
                    )}
                </div>
            ) : view === "grid" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {reports.map((r) => (
                        <div
                            key={r.id}
                            className="rounded-xl border bg-white p-5 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => goDetails(r.id)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{r.template_name}</h3>
                                    <p className="text-sm text-gray-600">
                                        {r.frequency?.charAt(0).toUpperCase() + r.frequency?.slice(1)} • {r.department_name || "—"}
                                    </p>
                                </div>
                                <StatusBadge status={r.status} />
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Période: {new Date(r.period_start).toLocaleDateString()} - {new Date(r.period_end).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Créé le {new Date(r.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            {r.status === "rejete" && r.rejection_reason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-red-700">
                                        <strong>Raison:</strong> {r.rejection_reason}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <div className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                                    <Eye className="w-4 h-4 mr-1" />
                                    Voir les détails
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // LIST VIEW
                <div className="rounded-xl border bg-white overflow-hidden">
                    <div className="grid grid-cols-12 bg-gray-50 text-xs font-semibold text-gray-600 px-4 py-3">
                        <div className="col-span-4">Rapport</div>
                        <div className="col-span-2">Département</div>
                        <div className="col-span-3">Période</div>
                        <div className="col-span-2">Statut</div>
                        <div className="col-span-1 text-right">Voir</div>
                    </div>

                    {reports.map((r) => (
                        <div
                            key={r.id}
                            className="grid grid-cols-12 px-4 py-3 border-t hover:bg-gray-50 cursor-pointer items-center"
                            onClick={() => goDetails(r.id)}
                        >
                            <div className="col-span-4">
                                <p className="font-medium text-gray-900">{r.template_name}</p>
                                <p className="text-xs text-gray-500">{r.frequency}</p>
                            </div>
                            <div className="col-span-2 text-sm text-gray-700">{r.department_name || "—"}</div>
                            <div className="col-span-3 text-sm text-gray-700">
                                {new Date(r.period_start).toLocaleDateString()} - {new Date(r.period_end).toLocaleDateString()}
                            </div>
                            <div className="col-span-2">
                                <StatusBadge status={r.status} />
                            </div>
                            <div className="col-span-1 flex justify-end">
                                <Eye className="w-4 h-4 text-gray-500" />
                            </div>
                        </div>
                    ))}
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
