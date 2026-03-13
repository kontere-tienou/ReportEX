import { useState, useEffect, useMemo } from "react";
import {
    TrendingUp,
    PieChart,
    FileText,
    Calculator,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    DollarSign,
    Wallet,
    CreditCard,
    Activity,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    LineChart,
    Line,
} from "recharts";

import { departmentDataApi } from "../../../services/departmentDataApi.js";
import {
    formatMoneyFCFA,
    formatNumberValue,
} from "../reports/builder/utils/tableFormaterUtils.js";

const DEPT_CODE = "COMPTABILITE";

/**
 * ==========================================
 * COMPTABILITÉ FIELD MAPPING
 * Basé sur le schéma departmentSchemas.js
 * ==========================================
 */
const FIELD_MAP = {
    // Recettes
    caisse_entrees: "caisse_entrees",
    // Dépenses
    caisse_sorties: "caisse_sorties",
    // Solde
    solde_caisse: "solde_caisse",
    // CA (pour compatibilité)
    ca: "ca",
};

/**
 * Format compact pour grandes valeurs
 */
const formatCompactCurrency = (value) => {
    const num = Number(value || 0);
    if (Number.isNaN(num)) return "—";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M FCFA`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K FCFA`;
    return formatMoneyFCFA(num);
};

const calcPercent = (num, den) => {
    if (!den) return 0;
    return Math.round((Number(num) / Number(den)) * 100);
};

const getMonthLabel = (dateValue) => {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return String(dateValue);
    return d.toLocaleDateString("fr-FR", { month: "short" });
};

/**
 * Agrégation par mois
 */
const aggregateByMonth = (rows) => {
    const map = new Map();

    rows.forEach((row) => {
        const rawDate = row.date;
        const key = rawDate?.slice?.(0, 7) || rawDate;
        const monthLabel = getMonthLabel(rawDate);

        if (!map.has(key)) {
            map.set(key, {
                mois: monthLabel,
                entrees: 0,
                sorties: 0,
                solde: 0,
            });
        }

        const current = map.get(key);
        current.entrees += Number(row.caisse_entrees || 0);
        current.sorties += Number(row.caisse_sorties || 0);
        current.solde += Number(row.solde_caisse || 0);
    });

    return [...map.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, value]) => value);
};

/**
 * Custom Tooltip pour les graphiques
 */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg text-xs">
            <p className="text-green-700 font-semibold mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="my-0.5">
                    {p.name}: {formatMoneyFCFA(p.value)}
                </p>
            ))}
        </div>
    );
};

/**
 * Configuration des KPI Cards
 */
const kpiConfig = {
    green: {
        border: "border-l-green-500",
        iconBg: "bg-green-50",
        iconColor: "text-green-600",
    },
    blue: {
        border: "border-l-blue-500",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
    },
    amber: {
        border: "border-l-amber-500",
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
    },
    purple: {
        border: "border-l-purple-500",
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
    },
    red: {
        border: "border-l-red-500",
        iconBg: "bg-red-50",
        iconColor: "text-red-600",
    },
};

/**
 * KPI Card Component
 */
const KpiCard = ({ label, value, sub, subPositive, icon: Icon, color }) => {
    const c = kpiConfig[color];

    return (
        <div
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${c.border} p-4 flex flex-col gap-2 relative overflow-hidden`}
        >
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    {label}
                </span>
                <div className={`${c.iconBg} p-2 rounded-xl`}>
                    <Icon size={20} className={c.iconColor} />
                </div>
            </div>

            <span className="text-3xl font-bold text-gray-900 leading-none">
                {value}
            </span>

            {sub && (
                <span
                    className={`text-xs flex items-center gap-1 ${
                        subPositive === undefined
                            ? "text-gray-500"
                            : subPositive
                                ? "text-green-600"
                                : "text-red-500"
                    }`}
                >
                    {subPositive !== undefined &&
                        (subPositive ? (
                            <ArrowUpRight size={14} />
                        ) : (
                            <ArrowDownRight size={14} />
                        ))}
                    {sub}
                </span>
            )}
        </div>
    );
};

/**
 * Stat Pill Configuration
 */
const statPillConfig = {
    gray: {
        bg: "bg-gray-50",
        border: "border-gray-200",
        icon: "text-gray-500",
        value: "text-gray-800",
    },
    green: {
        bg: "bg-green-50",
        border: "border-green-100",
        icon: "text-green-600",
        value: "text-green-700",
    },
    amber: {
        bg: "bg-amber-50",
        border: "border-amber-100",
        icon: "text-amber-600",
        value: "text-amber-700",
    },
    red: {
        bg: "bg-red-50",
        border: "border-red-100",
        icon: "text-red-600",
        value: "text-red-700",
    },
};

/**
 * Stat Pill Component
 */
const StatPill = ({ label, value, color, icon: Icon }) => {
    const c = statPillConfig[color];

    return (
        <div
            className={`${c.bg} border ${c.border} rounded-xl px-5 py-4 flex items-center justify-between`}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} className={c.icon} />
                <span className="text-sm text-gray-500 font-medium">{label}</span>
            </div>
            <span className={`text-2xl font-bold ${c.value}`}>{value}</span>
        </div>
    );
};

/**
 * Legend Dot Component
 */
const LegendDot = ({ color, label }) => (
    <span className="flex items-center gap-1.5 text-xs text-gray-400">
        <span
            className="w-2.5 h-2.5 rounded-sm inline-block"
            style={{ background: color }}
        />
        {label}
    </span>
);

/**
 * ==========================================
 * MAIN DASHBOARD COMPONENT
 * ==========================================
 */
const ComptabiliteDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [stats, setStats] = useState({
        total: 0,
        thisMonth: 0,
        thisWeek: 0,
        today: 0,
    });
    const [cashFlowData, setCashFlowData] = useState([]);
    const [balanceData, setBalanceData] = useState([]);
    const [reportStats, setReportStats] = useState({
        total: 0,
        validated: 0,
        pending: 0,
        rejected: 0,
    });

    // Date range (6 derniers mois)
    const now = useMemo(() => new Date(), []);
    const dateTo = useMemo(() => now.toISOString().split("T")[0], [now]);
    const dateFrom = useMemo(() => {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 5);
        return d.toISOString().split("T")[0];
    }, [now]);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const [statsRes, chartRes] = await Promise.all([
                    departmentDataApi.getStats(DEPT_CODE),
                    departmentDataApi.getBatchChartData(DEPT_CODE, {
                        dateFrom,
                        dateTo,
                        groupBy: "date",
                        metrics: [
                            { field: FIELD_MAP.caisse_entrees, aggregation: "sum" },
                            { field: FIELD_MAP.caisse_sorties, aggregation: "sum" },
                            { field: FIELD_MAP.solde_caisse, aggregation: "sum" },
                        ],
                    }),
                ]);

                const statsData = statsRes.data?.data || statsRes.data || {};
                const chartApiData = chartRes.data?.data || chartRes.data || [];

                // Normaliser les données journalières
                const normalizedDailyRows = Array.isArray(chartApiData)
                    ? chartApiData.map((row) => ({
                        date: row.date,
                        caisse_entrees: Number(row.caisse_entrees || 0),
                        caisse_sorties: Number(row.caisse_sorties || 0),
                        solde_caisse: Number(row.solde_caisse || 0),
                    }))
                    : [];

                // Agréger par mois
                const monthly = aggregateByMonth(normalizedDailyRows);

                setStats({
                    total: Number(statsData.total || 0),
                    thisMonth: Number(statsData.thisMonth || 0),
                    thisWeek: Number(statsData.thisWeek || 0),
                    today: Number(statsData.today || 0),
                });

                // Données flux de trésorerie (Entrées vs Sorties)
                setCashFlowData(
                    monthly.map((m) => ({
                        mois: m.mois,
                        entrees: m.entrees,
                        sorties: m.sorties,
                    }))
                );

                // Données solde de caisse
                setBalanceData(
                    monthly.map((m) => ({
                        mois: m.mois,
                        solde: m.solde,
                    }))
                );

                // Stats rapports (simulé pour l'instant)
                setReportStats({
                    total: Number(statsData.total || 0),
                    validated: Math.floor(Number(statsData.total || 0) * 0.7),
                    pending: Math.floor(Number(statsData.total || 0) * 0.2),
                    rejected: Math.floor(Number(statsData.total || 0) * 0.1),
                });
            } catch (err) {
                console.error("Dashboard error:", err);
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Erreur lors du chargement du dashboard"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [dateFrom, dateTo]);

    // Calculs KPIs
    const currentEntrees = cashFlowData.length > 0
        ? cashFlowData[cashFlowData.length - 1].entrees
        : 0;

    const currentSorties = cashFlowData.length > 0
        ? cashFlowData[cashFlowData.length - 1].sorties
        : 0;

    const currentSolde = balanceData.length > 0
        ? balanceData[balanceData.length - 1].solde
        : 0;

    const totalEntrees = cashFlowData.reduce((sum, m) => sum + m.entrees, 0);
    const totalSorties = cashFlowData.reduce((sum, m) => sum + m.sorties, 0);

    const activityPct = calcPercent(stats.thisMonth, stats.total);
    const validationRate = calcPercent(reportStats.validated, reportStats.total);

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-green-100 border-t-green-600 animate-spin" />
                <span className="text-sm text-gray-400 uppercase tracking-wide">
                    Chargement du dashboard...
                </span>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white border border-red-100 rounded-2xl shadow-sm p-8 max-w-lg w-full">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertCircle className="text-red-500" size={24} />
                        <h2 className="text-lg font-bold text-gray-900">
                            Erreur de chargement
                        </h2>
                    </div>
                    <p className="text-sm text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            {/* Header */}
            <div className="flex items-end justify-between mb-8 pb-6 border-b border-gray-200">
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                        💰 Tableau de Bord
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                        Comptabilité
                    </h1>
                    <p className="text-sm text-gray-400 mt-2">
                        Gestion Financière · Flux de Trésorerie · Budget
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-700 font-medium">
                        Données en temps réel
                    </span>
                </div>
            </div>

            {/* KPIs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiCard
                    label="Recettes Mensuelles"
                    value={formatCompactCurrency(currentEntrees)}
                    sub={`Total: ${formatCompactCurrency(totalEntrees)}`}
                    subPositive={currentEntrees > 0}
                    icon={TrendingUp}
                    color="green"
                />
                <KpiCard
                    label="Dépenses Mensuelles"
                    value={formatCompactCurrency(currentSorties)}
                    sub={`Total: ${formatCompactCurrency(totalSorties)}`}
                    subPositive={false}
                    icon={CreditCard}
                    color="red"
                />
                <KpiCard
                    label="Solde de Caisse"
                    value={formatCompactCurrency(currentSolde)}
                    sub={currentSolde >= 0 ? "Positif" : "Négatif"}
                    subPositive={currentSolde >= 0}
                    icon={Wallet}
                    color={currentSolde >= 0 ? "green" : "red"}
                />
                <KpiCard
                    label="Saisies Aujourd'hui"
                    value={formatNumberValue(stats.today)}
                    sub={`${formatNumberValue(stats.thisWeek)} cette semaine`}
                    subPositive={stats.today > 0}
                    icon={FileText}
                    color="purple"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
                {/* Cash Flow Chart (3 cols) */}
                <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                                Flux de Trésorerie
                            </p>
                            <h2 className="text-xl font-bold text-gray-900">
                                Recettes vs Dépenses
                            </h2>
                        </div>
                        <div className="flex gap-4 pt-1">
                            <LegendDot color="#16a34a" label="Recettes" />
                            <LegendDot color="#ef4444" label="Dépenses" />
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={cashFlowData} barGap={6} barCategoryGap="25%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis
                                dataKey="mois"
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `${Math.round(v / 1000)}K`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
                            <Bar
                                dataKey="entrees"
                                fill="#16a34a"
                                radius={[6, 6, 0, 0]}
                                name="Recettes"
                            />
                            <Bar
                                dataKey="sorties"
                                fill="#ef4444"
                                radius={[6, 6, 0, 0]}
                                name="Dépenses"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Balance Chart (2 cols) */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="mb-5">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                            Évolution
                        </p>
                        <h2 className="text-xl font-bold text-gray-900">
                            Solde de Caisse
                        </h2>
                    </div>

                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={balanceData}>
                            <defs>
                                <linearGradient id="soldeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis
                                dataKey="mois"
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `${Math.round(v / 1000)}K`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e5e7eb" }} />
                            <Area
                                type="monotone"
                                dataKey="solde"
                                stroke="#2563eb"
                                strokeWidth={2.5}
                                fill="url(#soldeGrad)"
                                name="Solde"
                                dot={{ fill: "#2563eb", r: 3 }}
                                activeDot={{ r: 5, fill: "#1d4ed8", stroke: "#fff", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Reports Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                            Suivi Documentaire
                        </p>
                        <h2 className="text-xl font-bold text-gray-900">
                            Rapports Comptables
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                    <StatPill
                        label="Total Saisies"
                        value={formatNumberValue(reportStats.total)}
                        color="gray"
                        icon={FileText}
                    />
                    <StatPill
                        label="Validées"
                        value={formatNumberValue(reportStats.validated)}
                        color="green"
                        icon={CheckCircle2}
                    />
                    <StatPill
                        label="En Attente"
                        value={formatNumberValue(reportStats.pending)}
                        color="amber"
                        icon={Clock}
                    />
                    <StatPill
                        label="Rejetées"
                        value={formatNumberValue(reportStats.rejected)}
                        color="red"
                        icon={AlertCircle}
                    />
                </div>

                {/* Progress Bars */}
                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg px-5 py-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-xs text-gray-500">Taux de Validation</span>
                            <span className="text-xs text-green-600 font-semibold">
                                {formatNumberValue(validationRate)}%
                            </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-1000"
                                style={{ width: `${validationRate}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg px-5 py-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-xs text-gray-500">Activité du Mois</span>
                            <span className="text-xs text-blue-600 font-semibold">
                                {formatNumberValue(activityPct)}%
                            </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000"
                                style={{ width: `${activityPct}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComptabiliteDashboard;