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

const FIELD_MAP = {
    revenue: "ca",
    expenses: "caisse_sorties",
    budget: "ca",
};

const formatCompactCurrency = (value) => {
    const num = Number(value || 0);

    if (Number.isNaN(num)) return "—";
    if (num >= 1000000) return `${formatNumberValue((num / 1000000).toFixed(1))}M FCFA`;
    if (num >= 1000) return `${formatNumberValue((num / 1000).toFixed(1))}K FCFA`;

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

const aggregateByMonth = (rows) => {
    const map = new Map();

    rows.forEach((row) => {
        const rawDate = row.date;
        const key = rawDate?.slice?.(0, 7) || rawDate;
        const monthLabel = getMonthLabel(rawDate);

        if (!map.has(key)) {
            map.set(key, {
                mois: monthLabel,
                revenue: 0,
                depenses: 0,
                budget: 0,
            });
        }

        const current = map.get(key);
        current.revenue += Number(row.revenue || 0);
        current.depenses += Number(row.depenses || 0);
        current.budget += Number(row.budget || 0);
    });

    return [...map.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, value]) => value);
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg text-xs font-mono">
            <p className="text-green-700 font-semibold mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="my-0.5">
                    {p.name}: {formatMoneyFCFA(p.value)}
                </p>
            ))}
        </div>
    );
};

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
};

const KpiCard = ({ label, value, sub, subPositive, icon: Icon, color }) => {
    const c = kpiConfig[color];

    return (
        <div
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${c.border} p-2 flex flex-col gap-1 relative overflow-hidden`}
        >
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    {label}
                </span>
                <div className={`${c.iconBg} p-1.5 rounded-xl`}>
                    <Icon size={17} className={c.iconColor} />
                </div>
            </div>

            <span className="text-4xl font-bold text-gray-900 leading-none">
                {value}
            </span>

            <span
                className={`text-xs font-mono flex items-center gap-1 ${
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
        </div>
    );
};

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
};

const StatPill = ({ label, value, color, icon: Icon }) => {
    const c = statPillConfig[color];

    return (
        <div
            className={`${c.bg} border ${c.border} rounded-xl px-5 py-4 flex items-center justify-between`}
        >
            <div className="flex items-center gap-3">
                <Icon size={15} className={c.icon} />
                <span className="text-sm text-gray-500 font-medium">{label}</span>
            </div>
            <span className={`text-3xl font-bold ${c.value}`}>{value}</span>
        </div>
    );
};

const LegendDot = ({ color, label }) => (
    <span className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
        <span
            className="w-2.5 h-2.5 rounded-sm inline-block"
            style={{ background: color }}
        />
        {label}
    </span>
);

const ComptabiliteDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [stats, setStats] = useState({
        total: 0,
        thisMonth: 0,
        thisWeek: 0,
        today: 0,
        latestEntries: [],
    });
    const [budgetData, setBudgetData] = useState([]);
    const [revenueData, setRevenueData] = useState([]);

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
                            { field: FIELD_MAP.revenue, aggregation: "sum" },
                            { field: FIELD_MAP.expenses, aggregation: "sum" },
                            { field: FIELD_MAP.budget, aggregation: "sum" },
                        ],
                    }),
                ]);

                const statsData = statsRes.data?.data || statsRes.data || {};
                const chartApiData = chartRes.data?.data || chartRes.data || [];

                const normalizedDailyRows = Array.isArray(chartApiData)
                    ? chartApiData.map((row) => ({
                        date: row.date,
                        revenue: Number(row[FIELD_MAP.revenue] || 0),
                        depenses: Number(row[FIELD_MAP.expenses] || 0),
                        budget: Number(row[FIELD_MAP.budget] || 0),
                    }))
                    : [];

                const monthly = aggregateByMonth(normalizedDailyRows);

                setStats({
                    total: Number(statsData.total || 0),
                    thisMonth: Number(statsData.thisMonth || 0),
                    thisWeek: Number(statsData.thisWeek || 0),
                    today: Number(statsData.today || 0),
                    latestEntries: Array.isArray(statsData.latestEntries)
                        ? statsData.latestEntries
                        : [],
                });

                setBudgetData(
                    monthly.map((m) => ({
                        mois: m.mois,
                        depenses: m.depenses,
                        budget: m.budget,
                    }))
                );

                setRevenueData(
                    monthly.map((m) => ({
                        mois: m.mois,
                        revenue: m.revenue,
                    }))
                );
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

    const currentRevenue =
        revenueData.length > 0 ? revenueData[revenueData.length - 1].revenue : 0;

    const currentExpenses =
        budgetData.length > 0 ? budgetData[budgetData.length - 1].depenses : 0;

    const currentBudget =
        budgetData.length > 0 ? budgetData[budgetData.length - 1].budget : 0;

    const budgetUsagePct = calcPercent(currentExpenses, currentBudget);
    const weeklyVsMonthlyPct = calcPercent(stats.thisWeek, stats.thisMonth);
    const activityPct = calcPercent(stats.thisMonth, stats.total);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-4">
                <div className="w-11 h-11 rounded-full border-[3px] border-green-100 border-t-green-600 animate-spin" />
                <span className="text-xs text-gray-400 tracking-widest font-mono uppercase">
                    Chargement…
                </span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white border border-red-100 rounded-2xl shadow-sm p-8 max-w-lg w-full">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertCircle className="text-red-500" size={22} />
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
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="flex items-end justify-between mb-9 pb-7 border-b border-gray-200">
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-mono mb-2">
                        ◈ Tableau de Bord
                    </p>
                    <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                        Comptabilité
                    </h1>
                    <p className="text-sm text-gray-400 mt-1.5">
                        Gestion Financière & Budget · Données réelles
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
                    <span className="text-xs text-green-700 font-mono font-medium">
                        API connectée
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <KpiCard
                    label="Chiffre d'Affaires"
                    value={formatCompactCurrency(currentRevenue)}
                    sub={`${formatNumberValue(stats.thisMonth)} entrées ce mois`}
                    subPositive={true}
                    icon={TrendingUp}
                    color="green"
                />
                <KpiCard
                    label="Dépenses"
                    value={formatCompactCurrency(currentExpenses)}
                    sub={`${formatNumberValue(budgetUsagePct)}% du budget`}
                    subPositive={budgetUsagePct <= 100}
                    icon={Calculator}
                    color="blue"
                />
                <KpiCard
                    label="Entrées Aujourd'hui"
                    value={formatNumberValue(stats.today)}
                    sub={`${formatNumberValue(stats.thisWeek)} cette semaine`}
                    subPositive={stats.today > 0}
                    icon={FileText}
                    color="amber"
                />
                <KpiCard
                    label="Activité Hebdo"
                    value={`${formatNumberValue(weeklyVsMonthlyPct)}%`}
                    sub="part de la semaine dans le mois"
                    subPositive={true}
                    icon={PieChart}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
                <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-mono mb-1">
                                Analyse budgétaire
                            </p>
                            <h2 className="text-xl font-bold text-gray-900">
                                Budget vs Dépenses
                            </h2>
                        </div>
                        <div className="flex gap-4 pt-1">
                            <LegendDot color="#16a34a" label="Budget" />
                            <LegendDot color="#2563eb" label="Dépenses" />
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={budgetData} barGap={4} barCategoryGap="32%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis
                                dataKey="mois"
                                tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "monospace" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "monospace" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
                            <Bar dataKey="budget" fill="#16a34a" radius={[5, 5, 0, 0]} name="Budget" />
                            <Bar dataKey="depenses" fill="#2563eb" radius={[5, 5, 0, 0]} name="Dépenses" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                    <div className="mb-5">
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-mono mb-1">
                            Évolution
                        </p>
                        <h2 className="text-xl font-bold text-gray-900">
                            Chiffre d'Affaires
                        </h2>
                    </div>

                    <ResponsiveContainer width="100%" height={230}>
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#16a34a" stopOpacity={0.15} />
                                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis
                                dataKey="mois"
                                tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "monospace" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "monospace" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e5e7eb" }} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#16a34a"
                                strokeWidth={2.5}
                                fill="url(#revGrad)"
                                name="Revenu"
                                dot={{ fill: "#16a34a", r: 3, strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: "#15803d", stroke: "#fff", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-mono mb-1">
                            Suivi documentaire
                        </p>
                        <h2 className="text-xl font-bold text-gray-900">Rapports Comptables</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                    <StatPill
                        label="Total Rapports"
                        value={formatNumberValue(stats.total)}
                        color="gray"
                        icon={FileText}
                    />
                    <StatPill
                        label="Valide"
                        value={formatNumberValue(stats.thisMonth)}
                        color="green"
                        icon={CheckCircle2}
                    />
                    <StatPill
                        label="En Attente"
                        value={formatNumberValue(stats.thisWeek)}
                        color="amber"
                        icon={Clock}
                    />
                </div>

                <div className="bg-gray-50 rounded-lg px-5 py-4">
                    <div className="flex justify-between mb-2.5">
                        <span className="text-xs text-gray-400 font-mono">Activité du mois</span>
                        <span className="text-xs text-green-600 font-mono font-semibold">
                            {formatNumberValue(activityPct)}%
                        </span>
                    </div>

                    <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-green-700 to-green-400 transition-all duration-1000"
                            style={{ width: `${activityPct}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComptabiliteDashboard;