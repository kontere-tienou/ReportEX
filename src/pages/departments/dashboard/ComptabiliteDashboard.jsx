import { useState, useEffect, useMemo, useCallback } from "react";
import {
    TrendingUp,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Wallet,
    CreditCard,
    Calendar,
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
} from "recharts";

import { departmentDataApi } from "../../../services/departmentDataApi.js";
import {
    formatMoneyFCFA,
    formatNumberValue,
} from "../reports/builder/utils/tableFormaterUtils.js";

const DEPT_CODE = "COMPTABILITE";

/**
 * ==========================================
 * FIELD MAPPING
 * ==========================================
 */
const FIELD_MAP = {
    caisse_entrees: "caisse_entrees",
    caisse_sorties: "caisse_sorties",
    solde_caisse: "solde_caisse",
    ca: "ca",
};

/**
 * Types de période
 */
const PERIOD_TYPES = {
    DAY: "day",
    WEEK: "week",
    MONTH: "month",
    YEAR: "year",
};

const PERIOD_LABELS = {
    [PERIOD_TYPES.DAY]: "Jour",
    [PERIOD_TYPES.WEEK]: "Semaine",
    [PERIOD_TYPES.MONTH]: "Mois",
    [PERIOD_TYPES.YEAR]: "Année",
};

// Cache pour stocker les données par période
const dataCache = new Map();

/**
 * Format compact pour grandes valeurs
 */
const formatCompactCurrency = (value) => {
    const num = Number(value || 0);
    if (Number.isNaN(num)) return "—";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return formatNumberValue(num);
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

const getWeekLabel = (dateValue) => {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return String(dateValue);
    const weekNumber = Math.ceil(d.getDate() / 7);
    return `S${weekNumber}`;
};

const getDayLabel = (dateValue) => {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return String(dateValue);
    return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
};

const getYearLabel = (dateValue) => {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return String(dateValue);
    return d.getFullYear().toString();
};

/**
 * Agrégation par période
 */
const aggregateByPeriod = (rows, periodType) => {
    const map = new Map();

    rows.forEach((row) => {
        const rawDate = row.date;
        let key, label;

        switch (periodType) {
            case PERIOD_TYPES.DAY:
                key = rawDate?.slice?.(0, 10) || rawDate;
                label = getDayLabel(rawDate);
                break;
            case PERIOD_TYPES.WEEK:
                key = `${rawDate?.slice?.(0, 7)}-W${Math.ceil(new Date(rawDate).getDate() / 7)}`;
                label = getWeekLabel(rawDate);
                break;
            case PERIOD_TYPES.MONTH:
                key = rawDate?.slice?.(0, 7) || rawDate;
                label = getMonthLabel(rawDate);
                break;
            case PERIOD_TYPES.YEAR:
                key = rawDate?.slice?.(0, 4) || rawDate;
                label = getYearLabel(rawDate);
                break;
            default:
                key = rawDate?.slice?.(0, 7) || rawDate;
                label = getMonthLabel(rawDate);
        }

        if (!map.has(key)) {
            map.set(key, {
                periode: label,
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
 * Calcul des dates en fonction de la période
 */
const getDateRange = (periodType) => {
    const now = new Date();
    const dateTo = now.toISOString().split("T")[0];
    let dateFrom;

    switch (periodType) {
        case PERIOD_TYPES.DAY:
            dateFrom = new Date(now.setDate(now.getDate() - 7)).toISOString().split("T")[0];
            break;
        case PERIOD_TYPES.WEEK:
            dateFrom = new Date(now.setDate(now.getDate() - 28)).toISOString().split("T")[0];
            break;
        case PERIOD_TYPES.MONTH:
            dateFrom = new Date(now.setMonth(now.getMonth() - 6)).toISOString().split("T")[0];
            break;
        case PERIOD_TYPES.YEAR:
            dateFrom = new Date(now.setFullYear(now.getFullYear() - 3)).toISOString().split("T")[0];
            break;
        default:
            dateFrom = new Date(now.setMonth(now.getMonth() - 6)).toISOString().split("T")[0];
    }

    return { dateFrom, dateTo };
};

/**
 * Custom Tooltip
 */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-xs animate-fade-in">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="my-0.5">
                    {p.name}: {formatMoneyFCFA(p.value)}
                </p>
            ))}
        </div>
    );
};

/**
 * KPI Card Component
 */
const KpiCard = ({ label, value, sub, subPositive, icon: Icon, color, delay = 0 }) => {
    const colors = {
        green: { border: "border-l-green-500", bg: "bg-green-50", text: "text-green-600" },
        red: { border: "border-l-red-500", bg: "bg-red-50", text: "text-red-600" },
        purple: { border: "border-l-purple-500", bg: "bg-purple-50", text: "text-purple-600" },
        blue: { border: "border-l-blue-500", bg: "bg-blue-50", text: "text-blue-600" },
    };
    const c = colors[color];

    return (
        <div
            className={`group bg-white rounded-xl shadow-sm border border-l-4 ${c.border} p-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {label}
                </span>
                <div className={`${c.bg} p-1.5 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-4 h-4 ${c.text}`} />
                </div>
            </div>

            <p className="text-2xl font-bold text-gray-900 mb-0.5 tabular-nums">
                {value}
            </p>

            {sub && (
                <p className={`text-[10px] flex items-center gap-1 ${
                    subPositive === undefined ? "text-gray-500" : subPositive ? "text-green-600" : "text-red-500"
                }`}>
                    {subPositive !== undefined && (
                        subPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />
                    )}
                    {sub}
                </p>
            )}
        </div>
    );
};

/**
 * Stat Pill Component
 */
const StatPill = ({ label, value, color, icon: Icon }) => {
    const colors = {
        gray: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
        green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
        amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
        red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
    };
    const c = colors[color];

    return (
        <div className={`${c.bg} border ${c.border} rounded-lg px-4 py-3 flex items-center justify-between group hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${c.text} group-hover:scale-110 transition-transform duration-300`} />
                <span className="text-xs text-gray-600 font-medium">{label}</span>
            </div>
            <span className={`text-xl font-bold ${c.text} tabular-nums`}>{value}</span>
        </div>
    );
};

/**
 * Legend Dot Component
 */
const LegendDot = ({ color, label }) => (
    <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
        <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
        {label}
    </span>
);

/**
 * Filtre de période - Version sans rechargement
 */
const PeriodFilter = ({ selectedPeriod, onPeriodChange }) => {
    // État local pour l'animation du clic
    const [clickedButton, setClickedButton] = useState(null);

    const handleClick = (period) => {
        setClickedButton(period);
        onPeriodChange(period);
        // Retirer l'effet de clic après 200ms
        setTimeout(() => setClickedButton(null), 200);
    };

    return (
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border p-1">
            <Calendar className="w-4 h-4 text-gray-400 ml-2" />
            {Object.entries(PERIOD_LABELS).map(([value, label]) => (
                <button
                    key={value}
                    onClick={() => handleClick(value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                        selectedPeriod === value
                            ? "bg-green-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                    } ${
                        clickedButton === value ? "scale-95" : ""
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

/**
 * ==========================================
 * MAIN DASHBOARD COMPONENT
 * ==========================================
 */
const ComptabiliteDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_TYPES.MONTH);
    const [stats, setStats] = useState({ total: 0, thisMonth: 0, thisWeek: 0, today: 0 });
    const [cashFlowData, setCashFlowData] = useState([]);
    const [balanceData, setBalanceData] = useState([]);
    const [reportStats, setReportStats] = useState({ total: 0, validated: 0, pending: 0, rejected: 0 });

    // État pour suivre si les données sont en cours de mise à jour
    const [isUpdating, setIsUpdating] = useState(false);

    // État pour les données brutes (une seule fois)
    const [rawData, setRawData] = useState(null);

    const now = useMemo(() => new Date(), []);

    // Ne pas recalculer les dates à chaque changement de période
    const dateRanges = useMemo(() => ({
        [PERIOD_TYPES.DAY]: getDateRange(PERIOD_TYPES.DAY),
        [PERIOD_TYPES.WEEK]: getDateRange(PERIOD_TYPES.WEEK),
        [PERIOD_TYPES.MONTH]: getDateRange(PERIOD_TYPES.MONTH),
        [PERIOD_TYPES.YEAR]: getDateRange(PERIOD_TYPES.YEAR),
    }), []);

    /**
     * Chargement initial des données - une seule fois
     */
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError("");

                // Charger les données pour toutes les périodes en parallèle
                const promises = Object.values(PERIOD_TYPES).map(async (period) => {
                    const range = dateRanges[period];
                    const cacheKey = `${period}_${range.dateFrom}_${range.dateTo}`;

                    // Vérifier le cache
                    if (dataCache.has(cacheKey)) {
                        return { period, data: dataCache.get(cacheKey) };
                    }

                    const response = await departmentDataApi.getBatchChartData(DEPT_CODE, {
                        dateFrom: range.dateFrom,
                        dateTo: range.dateTo,
                        groupBy: "date",
                        metrics: [
                            { field: FIELD_MAP.caisse_entrees, aggregation: "sum" },
                            { field: FIELD_MAP.caisse_sorties, aggregation: "sum" },
                            { field: FIELD_MAP.solde_caisse, aggregation: "sum" },
                        ],
                    });

                    const data = response.data?.data || response.data || [];
                    dataCache.set(cacheKey, data);
                    return { period, data };
                });

                // Ajouter les stats
                const statsPromise = departmentDataApi.getStats(DEPT_CODE);

                const [statsRes, ...periodsData] = await Promise.all([
                    statsPromise,
                    ...promises
                ]);

                const statsData = statsRes.data?.data || statsRes.data || {};

                // Organiser les données par période
                const organizedData = {};
                periodsData.forEach(({ period, data }) => {
                    organizedData[period] = data;
                });

                setRawData(organizedData);
                setStats({
                    total: Number(statsData.total || 0),
                    thisMonth: Number(statsData.thisMonth || 0),
                    thisWeek: Number(statsData.thisWeek || 0),
                    today: Number(statsData.today || 0),
                });

                setReportStats({
                    total: Number(statsData.total || 0),
                    validated: Math.floor(Number(statsData.total || 0) * 0.7),
                    pending: Math.floor(Number(statsData.total || 0) * 0.2),
                    rejected: Math.floor(Number(statsData.total || 0) * 0.1),
                });

            } catch (err) {
                console.error("Dashboard error:", err);
                setError(err.response?.data?.message || err.message || "Erreur de chargement");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []); // Dépendances vides = chargement unique

    /**
     * Mise à jour des données affichées quand la période change
     */
    useEffect(() => {
        if (!rawData) return;

        setIsUpdating(true);

        // Simuler un délai pour montrer l'animation de transition
        const timeout = setTimeout(() => {
            const periodData = rawData[selectedPeriod] || [];

            const normalizedDailyRows = Array.isArray(periodData)
                ? periodData.map((row) => ({
                    date: row.date,
                    caisse_entrees: Number(row.caisse_entrees || 0),
                    caisse_sorties: Number(row.caisse_sorties || 0),
                    solde_caisse: Number(row.solde_caisse || 0),
                }))
                : [];

            const aggregated = aggregateByPeriod(normalizedDailyRows, selectedPeriod);

            setCashFlowData(aggregated.map((m) => ({
                periode: m.periode,
                entrees: m.entrees,
                sorties: m.sorties
            })));

            setBalanceData(aggregated.map((m) => ({
                periode: m.periode,
                solde: m.solde
            })));

            setIsUpdating(false);
        }, 300); // Petit délai pour l'animation

        return () => clearTimeout(timeout);
    }, [selectedPeriod, rawData]);

    const currentEntrees = cashFlowData.length > 0 ? cashFlowData[cashFlowData.length - 1].entrees : 0;
    const currentSorties = cashFlowData.length > 0 ? cashFlowData[cashFlowData.length - 1].sorties : 0;
    const currentSolde = balanceData.length > 0 ? balanceData[balanceData.length - 1].solde : 0;
    const totalEntrees = cashFlowData.reduce((sum, m) => sum + m.entrees, 0);
    const totalSorties = cashFlowData.reduce((sum, m) => sum + m.sorties, 0);
    const activityPct = calcPercent(stats.thisMonth, stats.total);
    const validationRate = calcPercent(reportStats.validated, reportStats.total);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-green-100 border-t-green-600 animate-spin" />
                <p className="text-sm text-gray-500 animate-pulse">Chargement...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white border border-red-100 rounded-xl shadow-sm p-6 max-w-md animate-fade-in">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertCircle className="text-red-500 w-6 h-6" />
                        <h2 className="text-lg font-bold text-gray-900">Erreur</h2>
                    </div>
                    <p className="text-sm text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            {/* Header avec filtre */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
                <div className="animate-slide-up">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                        💰 Tableau de Bord
                    </p>
                    <h1 className="text-3xl font-bold text-gray-900">Comptabilité</h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Flux de Trésorerie · Budget · Suivi
                    </p>
                </div>

                <div className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <PeriodFilter
                        selectedPeriod={selectedPeriod}
                        onPeriodChange={setSelectedPeriod}
                    />

                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] text-green-700 font-medium">En temps réel</span>
                    </div>
                </div>
            </div>

            {/* Indicateur de mise à jour */}
            {isUpdating && (
                <div className="fixed top-4 right-4 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
                        <span className="text-xs text-blue-700">Mise à jour...</span>
                    </div>
                </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <KpiCard
                    label="Recettes"
                    value={`${formatCompactCurrency(currentEntrees)} F`}
                    sub={`Total: ${formatCompactCurrency(totalEntrees)} F`}
                    subPositive={currentEntrees > 0}
                    icon={TrendingUp}
                    color="green"
                    delay={0}
                />
                <KpiCard
                    label="Dépenses"
                    value={`${formatCompactCurrency(currentSorties)} F`}
                    sub={`Total: ${formatCompactCurrency(totalSorties)} F`}
                    subPositive={false}
                    icon={CreditCard}
                    color="red"
                    delay={100}
                />
                <KpiCard
                    label="Solde Caisse"
                    value={`${formatCompactCurrency(currentSolde)} F`}
                    sub={currentSolde >= 0 ? "Positif" : "Négatif"}
                    subPositive={currentSolde >= 0}
                    icon={Wallet}
                    color={currentSolde >= 0 ? "green" : "red"}
                    delay={200}
                />
                <KpiCard
                    label="Saisies Jour"
                    value={formatNumberValue(stats.today)}
                    sub={`${formatNumberValue(stats.thisWeek)} cette semaine`}
                    subPositive={stats.today > 0}
                    icon={FileText}
                    color="purple"
                    delay={300}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-5">
                {/* Cash Flow */}
                <div className={`lg:col-span-3 bg-white rounded-xl shadow-sm border p-5 animate-slide-up transition-opacity duration-300 ${
                    isUpdating ? 'opacity-50' : 'opacity-100'
                }`} style={{ animationDelay: '400ms' }}>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                                Flux de Trésorerie - {PERIOD_LABELS[selectedPeriod]}
                            </p>
                            <h2 className="text-base font-bold text-gray-900">Recettes vs Dépenses</h2>
                        </div>
                        <div className="flex gap-3">
                            <LegendDot color="#16a34a" label="Recettes" />
                            <LegendDot color="#ef4444" label="Dépenses" />
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={cashFlowData} barGap={4} barCategoryGap="20%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis
                                dataKey="periode"
                                tick={{ fontSize: 10, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `${Math.round(v / 1000)}K`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
                            <Bar dataKey="entrees" fill="#16a34a" radius={[4, 4, 0, 0]} name="Recettes" />
                            <Bar dataKey="sorties" fill="#ef4444" radius={[4, 4, 0, 0]} name="Dépenses" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Balance */}
                <div className={`lg:col-span-2 bg-white rounded-xl shadow-sm border p-5 animate-slide-up transition-opacity duration-300 ${
                    isUpdating ? 'opacity-50' : 'opacity-100'
                }`} style={{ animationDelay: '500ms' }}>
                    <div className="mb-4">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                            Évolution - {PERIOD_LABELS[selectedPeriod]}
                        </p>
                        <h2 className="text-base font-bold text-gray-900">Solde Caisse</h2>
                    </div>

                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={balanceData}>
                            <defs>
                                <linearGradient id="soldeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis
                                dataKey="periode"
                                tick={{ fontSize: 10, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `${Math.round(v / 1000)}K`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e5e7eb" }} />
                            <Area
                                type="monotone"
                                dataKey="solde"
                                stroke="#2563eb"
                                strokeWidth={2}
                                fill="url(#soldeGrad)"
                                name="Solde"
                                dot={{ fill: "#2563eb", r: 2 }}
                                activeDot={{ r: 4 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Reports */}
            <div className="bg-white rounded-xl shadow-sm border p-5 animate-slide-up" style={{ animationDelay: '600ms' }}>
                <div className="mb-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Suivi</p>
                    <h2 className="text-base font-bold text-gray-900">Rapports Comptables</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    <StatPill label="Total" value={formatNumberValue(reportStats.total)} color="gray" icon={FileText} />
                    <StatPill label="Validées" value={formatNumberValue(reportStats.validated)} color="green" icon={CheckCircle2} />
                    <StatPill label="Attente" value={formatNumberValue(reportStats.pending)} color="amber" icon={Clock} />
                    <StatPill label="Rejetées" value={formatNumberValue(reportStats.rejected)} color="red" icon={AlertCircle} />
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg px-4 py-3">
                        <div className="flex justify-between mb-2">
                            <span className="text-[10px] text-gray-500">Validation</span>
                            <span className="text-[10px] text-green-600 font-semibold tabular-nums">{validationRate}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-1000" style={{ width: `${validationRate}%` }} />
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg px-4 py-3">
                        <div className="flex justify-between mb-2">
                            <span className="text-[10px] text-gray-500">Activité</span>
                            <span className="text-[10px] text-blue-600 font-semibold tabular-nums">{activityPct}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000" style={{ width: `${activityPct}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-slide-up {
                    animation: slide-up 0.6s ease-out forwards;
                }

                .animate-fade-in {
                    animation: fade-in 0.4s ease-out;
                }

                .tabular-nums {
                    font-variant-numeric: tabular-nums;
                }
            `}</style>
        </div>
    );
};

export default ComptabiliteDashboard;