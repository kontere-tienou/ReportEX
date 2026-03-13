import { useState, useEffect, useMemo } from "react";
import { useAuth } from '../../../context/AuthContext.jsx';
import {
    TrendingUp,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Server,
    Cpu,
    HardDrive,
    Monitor,
    Wifi,
    Database,
    Shield,
    Activity,
    RefreshCw,
    Calendar
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
    PieChart,
    Pie,
    Cell
} from "recharts";

import { reportService } from "../../../services/reportApi.js";
import {
    formatMoneyFCFA,
    formatNumberValue,
} from "../reports/builder/utils/tableFormaterUtils.js";

const DEPT_CODE = "INFORMATIQUE";

/**
 * ==========================================
 * FIELD MAPPING
 * ==========================================
 */
const FIELD_MAP = {
    interventions: "interventions",
    incidents: "incidents",
    maintenance: "maintenance",
    tickets: "tickets",
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

const formatCompactNumber = (value) => {
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
                interventions: 0,
                incidents: 0,
                maintenance: 0,
            });
        }

        const current = map.get(key);
        current.interventions += Number(row.interventions || 0);
        current.incidents += Number(row.incidents || 0);
        current.maintenance += Number(row.maintenance || 0);
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
                    {p.name}: {p.name.includes('interventions') ? formatNumberValue(p.value) : p.value}
                </p>
            ))}
        </div>
    );
};

/**
 * KPI Card Component - Compact & Animated
 */
const KpiCard = ({ label, value, sub, subPositive, icon: Icon, color, delay = 0 }) => {
    const colors = {
        cyan: { border: "border-l-cyan-500", bg: "bg-cyan-50", text: "text-cyan-600" },
        green: { border: "border-l-green-500", bg: "bg-green-50", text: "text-green-600" },
        red: { border: "border-l-red-500", bg: "bg-red-50", text: "text-red-600" },
        purple: { border: "border-l-purple-500", bg: "bg-purple-50", text: "text-purple-600" },
        blue: { border: "border-l-blue-500", bg: "bg-blue-50", text: "text-blue-600" },
        amber: { border: "border-l-amber-500", bg: "bg-amber-50", text: "text-amber-600" },
    };
    const c = colors[color] || colors.cyan;

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
 * Stat Pill Component - Compact
 */
const StatPill = ({ label, value, color, icon: Icon }) => {
    const colors = {
        gray: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
        green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
        amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
        red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
        cyan: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700" },
        blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
    };
    const c = colors[color] || colors.gray;

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
 * System Status Component
 */
const SystemStatus = ({ name, status, uptime, color }) => {
    const statusColors = {
        OK: { bg: "bg-green-500", text: "text-green-600" },
        Alerte: { bg: "bg-amber-500", text: "text-amber-600" },
        Critique: { bg: "bg-red-500", text: "text-red-600" },
        Maintenance: { bg: "bg-blue-500", text: "text-blue-600" },
    };
    const sc = statusColors[status] || statusColors.OK;

    return (
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${sc.bg} animate-pulse`} />
                <span className="text-xs font-medium text-gray-700">{name}</span>
            </div>
            <div className="flex items-center gap-3">
                <span className={`text-xs ${sc.text}`}>{status}</span>
                <span className="text-[10px] text-gray-400">{uptime}</span>
            </div>
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
    const [clickedButton, setClickedButton] = useState(null);

    const handleClick = (period) => {
        setClickedButton(period);
        onPeriodChange(period);
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
                            ? "bg-cyan-600 text-white shadow-sm"
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
const InformatiqueDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_TYPES.MONTH);
    const [stats, setStats] = useState({ total: 0, thisMonth: 0, thisWeek: 0, today: 0 });
    const [ticketsData, setTicketsData] = useState([]);
    const [systemsData, setSystemsData] = useState([]);
    const [activityData, setActivityData] = useState([]);
    const [rawData, setRawData] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const now = useMemo(() => new Date(), []);

    // Date ranges pour chaque période
    const dateRanges = useMemo(() => ({
        [PERIOD_TYPES.DAY]: getDateRange(PERIOD_TYPES.DAY),
        [PERIOD_TYPES.WEEK]: getDateRange(PERIOD_TYPES.WEEK),
        [PERIOD_TYPES.MONTH]: getDateRange(PERIOD_TYPES.MONTH),
        [PERIOD_TYPES.YEAR]: getDateRange(PERIOD_TYPES.YEAR),
    }), []);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                // Simuler des données pour l'exemple
                // Dans la vraie application, vous appelleriez votre API
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Données stats
                const statsData = {
                    total: 156,
                    thisMonth: 45,
                    thisWeek: 12,
                    today: 3
                };

                // Données tickets (statiques car ne dépendent pas de la période)
                const tickets = [
                    { name: 'Ouverts', value: 12, color: '#ef4444' },
                    { name: 'En cours', value: 8, color: '#f59e0b' },
                    { name: 'Résolus', value: 45, color: '#10b981' },
                    { name: 'Fermés', value: 23, color: '#6b7280' }
                ];

                // Données systèmes (statiques)
                const systems = [
                    { name: 'Serveurs', status: 'OK', uptime: '99.9%' },
                    { name: 'Réseau', status: 'OK', uptime: '99.7%' },
                    { name: 'Firewall', status: 'Alerte', uptime: '98.2%' },
                    { name: 'Backup', status: 'OK', uptime: '100%' },
                    { name: 'Active Directory', status: 'OK', uptime: '99.8%' },
                    { name: 'Stockage', status: 'Maintenance', uptime: '95.5%' }
                ];

                // Données d'activité par période
                const activityByPeriod = {
                    [PERIOD_TYPES.DAY]: [
                        { date: '2024-03-13', interventions: 8, incidents: 2 },
                        { date: '2024-03-12', interventions: 12, incidents: 3 },
                        { date: '2024-03-11', interventions: 10, incidents: 1 },
                        { date: '2024-03-10', interventions: 5, incidents: 0 },
                        { date: '2024-03-09', interventions: 3, incidents: 1 },
                        { date: '2024-03-08', interventions: 15, incidents: 4 },
                        { date: '2024-03-07', interventions: 9, incidents: 2 },
                    ],
                    [PERIOD_TYPES.WEEK]: [
                        { date: '2024-03-11', interventions: 45, incidents: 8 },
                        { date: '2024-03-04', interventions: 52, incidents: 10 },
                        { date: '2024-02-26', interventions: 38, incidents: 6 },
                        { date: '2024-02-19', interventions: 41, incidents: 7 },
                    ],
                    [PERIOD_TYPES.MONTH]: [
                        { date: '2024-03-01', interventions: 45, incidents: 12 },
                        { date: '2024-02-01', interventions: 52, incidents: 8 },
                        { date: '2024-01-01', interventions: 48, incidents: 15 },
                        { date: '2023-12-01', interventions: 61, incidents: 10 },
                        { date: '2023-11-01', interventions: 55, incidents: 7 },
                        { date: '2023-10-01', interventions: 42, incidents: 9 },
                    ],
                    [PERIOD_TYPES.YEAR]: [
                        { date: '2024-01-01', interventions: 520, incidents: 95 },
                        { date: '2023-01-01', interventions: 480, incidents: 110 },
                        { date: '2022-01-01', interventions: 450, incidents: 105 },
                    ]
                };

                setStats(statsData);
                setTicketsData(tickets);
                setSystemsData(systems);
                setRawData(activityByPeriod);

            } catch (err) {
                console.error("Dashboard error:", err);
                setError(err.response?.data?.message || err.message || "Erreur de chargement");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    // Mise à jour des données quand la période change
    useEffect(() => {
        if (!rawData) return;

        setIsUpdating(true);

        const timeout = setTimeout(() => {
            const periodData = rawData[selectedPeriod] || [];

            // Agrégation selon la période
            const aggregated = aggregateByPeriod(periodData, selectedPeriod);

            setActivityData(aggregated);
            setIsUpdating(false);
        }, 300);

        return () => clearTimeout(timeout);
    }, [selectedPeriod, rawData]);

    // Calculs pour les KPIs
    const totalTickets = ticketsData.reduce((sum, t) => sum + t.value, 0);
    const resolutionRate = ticketsData.find(t => t.name === 'Résolus')?.value || 0;
    const resolutionPct = calcPercent(resolutionRate, totalTickets);
    const systemHealth = systemsData.filter(s => s.status === 'OK').length;
    const systemHealthPct = calcPercent(systemHealth, systemsData.length);

    // Données pour les graphiques
    const currentPeriodActivity = activityData[activityData.length - 1] || { interventions: 0, incidents: 0 };
    const totalInterventions = activityData.reduce((sum, m) => sum + m.interventions, 0);
    const totalIncidents = activityData.reduce((sum, m) => sum + m.incidents, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-cyan-100 border-t-cyan-600 animate-spin" />
                <p className="text-sm text-gray-500 animate-pulse">Chargement du dashboard IT...</p>
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
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Réessayer
                    </button>
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
                        🖥️ Tableau de Bord IT
                    </p>
                    <h1 className="text-3xl font-bold text-gray-900">Informatique</h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Support · Infrastructure · Monitoring
                    </p>
                </div>

                <div className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <PeriodFilter
                        selectedPeriod={selectedPeriod}
                        onPeriodChange={setSelectedPeriod}
                    />

                    <div className="flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-full px-3 py-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[10px] text-cyan-700 font-medium">Monitoring actif</span>
                    </div>
                </div>
            </div>

            {/* Indicateur de mise à jour */}
            {isUpdating && (
                <div className="fixed top-4 right-4 bg-cyan-50 border border-cyan-200 rounded-lg px-3 py-2 shadow-sm animate-fade-in z-50">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-cyan-200 border-t-cyan-600 animate-spin" />
                        <span className="text-xs text-cyan-700">Mise à jour...</span>
                    </div>
                </div>
            )}

            {/* KPIs - Compact & Animated */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <KpiCard
                    label="Tickets Actifs"
                    value={formatCompactNumber(totalTickets)}
                    sub={`${ticketsData.find(t => t.name === 'Ouverts')?.value || 0} ouverts`}
                    subPositive={totalTickets < 50}
                    icon={AlertCircle}
                    color="cyan"
                    delay={0}
                />
                <KpiCard
                    label="Taux Résolution"
                    value={`${resolutionPct}%`}
                    sub={`${resolutionRate} résolus`}
                    subPositive={resolutionPct > 70}
                    icon={CheckCircle2}
                    color="green"
                    delay={100}
                />
                <KpiCard
                    label="Systèmes OK"
                    value={`${systemHealth}/${systemsData.length}`}
                    sub={`${systemHealthPct}% opérationnel`}
                    subPositive={systemHealthPct > 90}
                    icon={Server}
                    color="blue"
                    delay={200}
                />
                <KpiCard
                    label="Interventions"
                    value={formatCompactNumber(stats.thisMonth)}
                    sub={`${stats.thisWeek} cette semaine`}
                    subPositive={stats.thisWeek > 0}
                    icon={Activity}
                    color="purple"
                    delay={300}
                />
            </div>

            {/* Charts et Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-5">
                {/* Graphique d'activité */}
                <div className={`lg:col-span-3 bg-white rounded-xl shadow-sm border p-5 animate-slide-up transition-opacity duration-300 ${
                    isUpdating ? 'opacity-50' : 'opacity-100'
                }`} style={{ animationDelay: '400ms' }}>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                                Activité - {PERIOD_LABELS[selectedPeriod]}
                            </p>
                            <h2 className="text-base font-bold text-gray-900">Interventions vs Incidents</h2>
                        </div>
                        <div className="flex gap-3">
                            <LegendDot color="#06b6d4" label="Interventions" />
                            <LegendDot color="#ef4444" label="Incidents" />
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={activityData} barGap={4} barCategoryGap="20%">
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
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
                            <Bar dataKey="interventions" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Interventions" />
                            <Bar dataKey="incidents" fill="#ef4444" radius={[4, 4, 0, 0]} name="Incidents" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* État des tickets (Pie Chart) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-5 animate-slide-up" style={{ animationDelay: '500ms' }}>
                    <div className="mb-4">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Répartition</p>
                        <h2 className="text-base font-bold text-gray-900">État des Tickets</h2>
                    </div>

                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={ticketsData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {ticketsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {ticketsData.map((t, i) => (
                            <div key={i} className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                                <span className="text-[10px] text-gray-500">{t.name}</span>
                                <span className="text-[10px] font-bold text-gray-700 ml-auto">{t.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Systèmes et Rapports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                {/* État des systèmes */}
                <div className="bg-white rounded-xl shadow-sm border p-5 animate-slide-up" style={{ animationDelay: '600ms' }}>
                    <div className="mb-4">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Infrastructure</p>
                        <h2 className="text-base font-bold text-gray-900">État des Systèmes</h2>
                    </div>

                    <div className="space-y-2">
                        {systemsData.map((system, index) => (
                            <SystemStatus key={index} {...system} />
                        ))}
                    </div>
                </div>

                {/* Rapports IT */}
                <div className="bg-white rounded-xl shadow-sm border p-5 animate-slide-up" style={{ animationDelay: '700ms' }}>
                    <div className="mb-4">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Suivi</p>
                        <h2 className="text-base font-bold text-gray-900">Rapports IT</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <StatPill
                            label="Total"
                            value={formatNumberValue(stats.total)}
                            color="gray"
                            icon={FileText}
                        />
                        <StatPill
                            label="Ce Mois"
                            value={formatNumberValue(stats.thisMonth)}
                            color="cyan"
                            icon={Activity}
                        />
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg px-4 py-3">
                            <div className="flex justify-between mb-2">
                                <span className="text-[10px] text-gray-500">Disponibilité</span>
                                <span className="text-[10px] text-cyan-600 font-semibold tabular-nums">
                                    {systemHealthPct}%
                                </span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1000"
                                    style={{ width: `${systemHealthPct}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg px-4 py-3">
                            <div className="flex justify-between mb-2">
                                <span className="text-[10px] text-gray-500">Résolution</span>
                                <span className="text-[10px] text-green-600 font-semibold tabular-nums">
                                    {resolutionPct}%
                                </span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-1000"
                                    style={{ width: `${resolutionPct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alertes et Actions Rapides */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '800ms' }}>
                {/* Alertes */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Alertes Système</p>
                    </div>
                    <ul className="space-y-2">
                        <li className="text-xs text-amber-700 flex items-center gap-2">
                            <span className="w-1 h-1 bg-amber-500 rounded-full" />
                            Firewall: Mise à jour disponible
                        </li>
                        <li className="text-xs text-amber-700 flex items-center gap-2">
                            <span className="w-1 h-1 bg-amber-500 rounded-full" />
                            Serveur 3: Espace disque faible (15%)
                        </li>
                        <li className="text-xs text-amber-700 flex items-center gap-2">
                            <span className="w-1 h-1 bg-amber-500 rounded-full" />
                            3 licences expirent dans 7 jours
                        </li>
                    </ul>
                </div>

                {/* Actions Rapides */}
                <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-cyan-600" />
                        <p className="text-xs font-semibold text-cyan-800 uppercase tracking-wider">Actions Rapides</p>
                    </div>
                    <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 bg-white hover:bg-cyan-100 rounded-lg text-xs transition-colors flex items-center gap-2">
                            <FileText className="w-3 h-3 text-cyan-600" />
                            Nouveau Rapport IT
                        </button>
                        <button className="w-full text-left px-3 py-2 bg-white hover:bg-cyan-100 rounded-lg text-xs transition-colors flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-cyan-600" />
                            Voir Tous les Tickets
                        </button>
                        <button className="w-full text-left px-3 py-2 bg-white hover:bg-cyan-100 rounded-lg text-xs transition-colors flex items-center gap-2">
                            <Server className="w-3 h-3 text-cyan-600" />
                            État des Systèmes
                        </button>
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

export default InformatiqueDashboard;