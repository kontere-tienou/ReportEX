import { useState, useEffect } from "react";
import {
    TrendingUp, TrendingDown, FileText, ArrowUpRight, ArrowDownRight,
    AlertCircle, Wallet, ShoppingCart, Calculator, RefreshCw,
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, AreaChart, PieChart as RePieChart,
    Pie, Cell, LineChart, Line, Legend,
} from "recharts";

import { dataService } from "../../../services/dataService.js";
import { formatMoneyFCFA, formatNumberValue } from "../reports/builder/utils/tableFormaterUtils.js";
import {getDepartmentById} from "../../../config/departments.js";
import {useAuth} from "../../../context/AuthContext.jsx";

const DEPT_CODE = "COMPTABILITE";

const PERIOD_TYPES = { DAY: "day", WEEK: "week", MONTH: "month", QUARTER: "quarter", YEAR: "year" };
const PERIOD_LABELS = { day: "Jour", week: "Sem.", month: "Mois", quarter: "Trim.", year: "Année" };

/* ─── Helpers ────────────────────────────────────────────────────── */
const safeNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

const fmt = (v) => {
    const n = safeNum(v);
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}Md`;
    if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`;
    return formatNumberValue(n);
};

/* ─── Filtre par période ─────────────────────────────────────────── */
const filterDataByPeriod = (data, periodType) => {
    const dateTo = new Date().toISOString().split("T")[0];
    let dateFrom;
    const offsets = {
        day:     () => { const d = new Date(); d.setDate(d.getDate() - 30);        return d; },
        week:    () => { const d = new Date(); d.setDate(d.getDate() - 7);         return d; },
        month:   () => { const d = new Date(); d.setMonth(d.getMonth() - 12);      return d; },
        quarter: () => { const d = new Date(); d.setMonth(d.getMonth() - 24);      return d; },
        year:    () => { const d = new Date(); d.setFullYear(d.getFullYear() - 5); return d; },
    };
    dateFrom = (offsets[periodType] || offsets.month)().toISOString().split("T")[0];
    return data.filter(item => {
        const d = (item.date || "").slice(0, 10);
        return d >= dateFrom && d <= dateTo;
    });
};

/* ─── Agrégation par période ─────────────────────────────────────── */
const aggregateByPeriod = (rows, periodType) => {
    const map = new Map();
    rows.forEach((row) => {
        const rawDate = (row.date || "").slice(0, 10);
        if (!rawDate) return;

        let key, label;
        const dt = new Date(rawDate + "T12:00:00");

        switch (periodType) {
            case "day":
                key = rawDate;
                label = dt.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
                break;
            case "week":
                key = rawDate;
                label = dt.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
                break;
            case "month":
                key = rawDate.slice(0, 7);
                label = dt.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
                break;
            case "quarter": {
                const q = Math.floor(dt.getMonth() / 3) + 1;
                key = `${rawDate.slice(0, 4)}-T${q}`;
                label = `T${q} ${rawDate.slice(0, 4)}`;
                break;
            }
            case "year":
                key = label = rawDate.slice(0, 4);
                break;
            default:
                key = rawDate.slice(0, 7);
                label = dt.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
        }

        if (!map.has(key)) {
            map.set(key, { periode: label, ca: 0, commandes: 0, entrees: 0, sorties: 0, solde: 0 });
        }
        const cur = map.get(key);
        cur.ca += safeNum(row.ca);
        cur.commandes += safeNum(row.commandes);
        cur.entrees += safeNum(row.caisse_entrees);
        cur.sorties += safeNum(row.caisse_sorties);
        cur.solde = safeNum(row.solde_caisse); // solde = dernier état, pas somme
    });

    return [...map.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, v]) => ({ ...v, marge: v.entrees - v.sorties, panierMoyen: v.commandes > 0 ? v.ca / v.commandes : 0 }));
};

/* ─── Composants UI ──────────────────────────────────────────────── */
const PeriodFilter = ({ selected, onChange }) => {
    const [clicked, setClicked] = useState(null);
    return (
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {Object.entries(PERIOD_LABELS).map(([val, lbl]) => (
                <button key={val} onClick={() => { setClicked(val); onChange(val); setTimeout(() => setClicked(null), 150); }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150
                        ${selected === val ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}
                        ${clicked === val ? "scale-95" : ""}`}>
                    {lbl}
                </button>
            ))}
        </div>
    );
};

const SectionHeader = ({ number, title }) => (
    <div className="flex items-center gap-3 mb-4">
        <span className="text-[10px] font-bold text-gray-400 font-mono">{number}</span>
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{title}</span>
        <div className="h-px flex-1 bg-gray-100" />
    </div>
);

const ChartCard = ({ title, sub, children, className = "" }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 ${className}`}>
        <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-800 tracking-tight">{title}</h2>
            {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
        </div>
        {children}
    </div>
);

const CustomTooltip = ({ active, payload, label, fmt: fmtFn }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs min-w-[140px]">
            <p className="font-semibold text-gray-500 mb-1.5">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                        <span className="text-gray-500">{p.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800 tabular-nums">
                        {fmtFn ? fmtFn(p.value, p.name) : p.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

/* ─── Mini Donut Chart - Sans ResponsiveContainer pour éviter les warnings ─── */
const MiniDonutChart = ({ data, colors, size = 160 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.38;
    const innerRadius = radius * 0.6;

    let startAngle = 0;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {data.map((item, index) => {
                    const angle = (item.value / total) * 360;
                    const endAngle = startAngle + angle;

                    const startRad = (startAngle - 90) * (Math.PI / 180);
                    const endRad = (endAngle - 90) * (Math.PI / 180);

                    const x1 = centerX + radius * Math.cos(startRad);
                    const y1 = centerY + radius * Math.sin(startRad);
                    const x2 = centerX + radius * Math.cos(endRad);
                    const y2 = centerY + radius * Math.sin(endRad);

                    const largeArcFlag = angle > 180 ? 1 : 0;

                    const pathData = `
                        M ${centerX} ${centerY}
                        L ${x1} ${y1}
                        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                        Z
                    `;

                    const path = (
                        <path
                            key={index}
                            d={pathData}
                            fill={colors[index % colors.length]}
                            stroke="white"
                            strokeWidth="2"
                        />
                    );

                    startAngle = endAngle;
                    return path;
                })}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={innerRadius}
                    fill="white"
                    stroke="white"
                    strokeWidth="2"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">{fmt(total)}</p>
                    <p className="text-[9px] text-gray-400">Total</p>
                </div>
            </div>
        </div>
    );
};

/* ─── DASHBOARD ──────────────────────────────────────────────────── */
const ComptabiliteDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_TYPES.MONTH);
    const [isUpdating, setIsUpdating] = useState(false);
    const [allData, setAllData] = useState([]);

    const departmentId = user?.department?.id ?? user?.department_id;
    const department = getDepartmentById(Number(departmentId));

    /* ── Fetch ── */
    const silentRefresh = async () => {
        try {
            const data = await dataService.getAll(DEPT_CODE);
            setAllData(Array.isArray(data) ? data : data?.data ?? []);
        } catch { /* silencieux */ }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await dataService.getAll(DEPT_CODE);
            setAllData(Array.isArray(data) ? data : data?.data ?? []);
        } catch (err) { setError(err.message || "Erreur de chargement"); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);
    useEffect(() => {
        const iv = setInterval(silentRefresh, 30_000);
        return () => clearInterval(iv);
    }, []);
    useEffect(() => {
        const onChange = (e) => {
            if (!e.detail?.deptCode || e.detail.deptCode === DEPT_CODE) {
                setIsUpdating(true);
                silentRefresh().finally(() => setIsUpdating(false));
            }
        };
        window.addEventListener("dataservice:changed", onChange);
        return () => window.removeEventListener("dataservice:changed", onChange);
    }, []);
    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === "visible") {
                setIsUpdating(true);
                silentRefresh().finally(() => setIsUpdating(false));
            }
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, []);

    /* ── Données filtrées & agrégées ── */
    const filtered = filterDataByPeriod(allData, selectedPeriod);
    const aggregated = aggregateByPeriod(filtered, selectedPeriod);

    const current = aggregated[aggregated.length - 1] || {};
    const previous = aggregated[aggregated.length - 2] || {};

    const totalCA = aggregated.reduce((s, m) => s + m.ca, 0);
    const totalEntrees = aggregated.reduce((s, m) => s + m.entrees, 0);
    const totalSorties = aggregated.reduce((s, m) => s + m.sorties, 0);
    const totalCmds = aggregated.reduce((s, m) => s + m.commandes, 0);
    const margeBrute = totalEntrees - totalSorties;
    const tauxMarge = totalEntrees > 0 ? (margeBrute / totalEntrees) * 100 : 0;
    const panierGlobal = totalCmds > 0 ? totalCA / totalCmds : 0;

    const trend = (cur, prev) => prev ? Math.round(((cur - prev) / prev) * 100) : 0;
    const caTrend = trend(current.ca ?? 0, previous.ca ?? 0);
    const cmdTrend = trend(current.commandes ?? 0, previous.commandes ?? 0);

    /* ── Données pour les graphiques ── */
    const evolutionData = aggregated.map(m => ({
        periode: m.periode,
        CA: m.ca,
        Marge: m.marge,
    }));

    const fluxData = aggregated.map(m => ({
        periode: m.periode,
        Entrées: m.entrees,
        Sorties: m.sorties,
    }));

    const donutFlux = [
        { name: "Entrées", value: totalEntrees },
        { name: "Sorties", value: totalSorties },
    ];

    const panierData = aggregated.map(m => ({ periode: m.periode, "Panier moyen": m.panierMoyen }));

    let cumul = 0;
    const soldeData = aggregated.map(m => { cumul += m.marge; return { periode: m.periode, Solde: cumul }; });

    const caSlice = aggregated.slice(-6);
    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];
    const donutCA = caSlice.map(m => ({ name: m.periode, value: m.ca }));

    const axisTick = { fontSize: 10, fill: "#9ca3af" };
    const gridColor = "#f3f4f6";

    /* ── États ── */
    if (loading) return (
        <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center gap-3">
            <div
                className="w-10 h-10 rounded-full border-[3px] border-blue-100 animate-spin"
                style={{ borderTopColor: department?.color || "#3b82f6" }}
            />
            <p className="text-sm text-gray-400" style={{ color: department?.color || "#6b7280" }}>
                Chargement…
            </p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6">
            <div className="bg-white border border-red-100 rounded-2xl p-6 max-w-md w-full">
                <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="text-red-400 w-5 h-5" />
                    <h2 className="text-base font-semibold text-gray-900">Erreur</h2>
                </div>
                <p className="text-sm text-gray-500 mb-4">{error}</p>
                <button onClick={loadData} className="px-4 py-2 text-white text-sm font-medium rounded-xl hover:bg-blue-700"
                        style={{
                            backgroundColor: department.color,
                            borderBottomColor: department.color,
                        }}>Réessayer</button>
            </div>
        </div>
    );

    if (allData.length === 0) return (
        <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md text-center">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-7 h-7 text-gray-300" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Aucune donnée</h2>
                <p className="text-sm text-gray-400 mb-5">Commencez par saisir des données comptables.</p>
                <button onClick={() => window.location.href = `/departments/data/${DEPT_CODE.toLowerCase()}`}
                        className="px-5 py-2.5 text-white text-sm font-medium rounded-xl "
                        style={{
                            backgroundColor: department.color,
                            borderBottomColor: department.color,
                        }}
                >
                    Aller à la saisie
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">

            {/* ── HEADER ── */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                       style={{color:department?.color || "#3b82f6"}}
                    >Département Comptabilité</p>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tableau de Bord</h1>
                    <p className="text-xs text-gray-400 mt-1 font-medium">
                        {filtered.length} saisie{filtered.length > 1 ? "s" : ""} dans la période · {allData.length} au total
                    </p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <PeriodFilter selected={selectedPeriod} onChange={setSelectedPeriod} />
                    <button onClick={loadData}
                            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50">
                        <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? "animate-spin" : "text-gray-400"}`} style={{color:department.color}} />
                        Actualiser
                    </button>
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wide">Live</span>
                    </div>
                </div>
            </div>

            {isUpdating && (
                <div className="fixed top-4 right-4 bg-white border border-blue-100 rounded-xl px-3.5 py-2 shadow-md z-50 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5  animate-spin"  style={{color:department.color}}/>
                    <span className="text-xs font-medium " style={{color:department.color}}>Actualisation…</span>
                </div>
            )}

            {/* ── 01 KPIs ── */}
            <SectionHeader number="01" title="Indicateurs de la période" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">

                {/* Hero card CA */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-7 flex flex-col justify-between relative overflow-hidden animate-slide-up" style={{ minHeight: 220 }}>
                    <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-emerald-500" />
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                                Chiffre d'affaires · {PERIOD_LABELS[selectedPeriod]}
                            </p>
                            <div className="p-2 bg-emerald-50 rounded-xl"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
                        </div>
                        <p className="text-5xl font-bold text-gray-900 tabular-nums tracking-tight mt-3 mb-2">
                            {formatMoneyFCFA(current.ca ?? 0)}
                        </p>
                        <p className="text-sm text-gray-400 font-medium">
                            Cumul période : <span className="text-gray-700 font-semibold">{formatMoneyFCFA(totalCA)}</span>
                        </p>
                    </div>
                    <div className="flex items-end justify-between mt-6 pt-5 border-t border-gray-50 flex-wrap gap-3">
                        <div>
                            {caTrend !== 0 && (
                                <div className="flex items-center gap-1.5 mb-1">
                                    {caTrend > 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                                    <span className={`text-sm font-bold tabular-nums ${caTrend > 0 ? "text-emerald-600" : "text-red-600"}`}>
                                        {caTrend > 0 ? "+" : ""}{caTrend}%
                                    </span>
                                    <span className="text-xs text-gray-400">vs période préc.</span>
                                </div>
                            )}
                            <p className="text-[11px] text-gray-400">
                                Marge brute : <span className={`font-semibold ${margeBrute >= 0 ? "text-emerald-600" : "text-red-500"}`}>{formatMoneyFCFA(margeBrute)}</span>
                                <span className="mx-2 text-gray-200">·</span>
                                Taux : <span className="font-semibold text-gray-700">{tauxMarge.toFixed(1)}%</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Panier moyen</p>
                            <p className="text-xl font-bold text-gray-900 tabular-nums">{formatMoneyFCFA(panierGlobal)}</p>
                        </div>
                    </div>
                </div>

                {/* 4 petites cards */}
                <div className="flex flex-col gap-4">
                    {[
                        { label: "Commandes", value: formatNumberValue(current.commandes ?? 0), sub: `Total période : ${formatNumberValue(totalCmds)}`, trend: cmdTrend, bar: "bg-blue-500", iconBg: "bg-blue-50", icon: <ShoppingCart className="w-3.5 h-3.5 text-blue-600" /> },
                        { label: "Panier moyen", value: fmt(current.panierMoyen ?? 0), sub: `Global : ${fmt(panierGlobal)}`, bar: "bg-purple-500", iconBg: "bg-purple-50", icon: <Calculator className="w-3.5 h-3.5 text-purple-600" /> },
                        { label: "Solde caisse", value: fmt(current.solde ?? 0), sub: `Variation : ${fmt(Math.abs((current.entrees ?? 0) - (current.sorties ?? 0)))}`, bar: (current.solde ?? 0) >= 0 ? "bg-cyan-500" : "bg-red-500", iconBg: (current.solde ?? 0) >= 0 ? "bg-cyan-50" : "bg-red-50", icon: <Wallet className={`w-3.5 h-3.5 ${(current.solde ?? 0) >= 0 ? "text-cyan-600" : "text-red-500"}`} />, subPositive: (current.entrees ?? 0) >= (current.sorties ?? 0) },
                        { label: "Flux cumulés", value: null, bar: "bg-amber-400", iconBg: "bg-amber-50", icon: null, custom: (
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div className="bg-emerald-50 rounded-xl p-2 text-center">
                                        <p className="text-[9px] font-semibold text-emerald-600 uppercase mb-0.5">Entrées</p>
                                        <p className="text-xs font-bold text-emerald-700 tabular-nums">{fmt(totalEntrees)}</p>
                                    </div>
                                    <div className="bg-red-50 rounded-xl p-2 text-center">
                                        <p className="text-[9px] font-semibold text-red-500 uppercase mb-0.5">Sorties</p>
                                        <p className="text-xs font-bold text-red-600 tabular-nums">{fmt(totalSorties)}</p>
                                    </div>
                                </div>
                            )},
                    ].map(({ label, value, sub, trend: t, bar, iconBg, icon, custom, subPositive }, i) => (
                        <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 relative overflow-hidden animate-slide-up" style={{ animationDelay: `${(i + 1) * 80}ms` }}>
                            <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl ${bar}`} />
                            <div className="flex items-center justify-between mb-2 mt-0.5">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
                                {icon && <div className={`p-1.5 ${iconBg} rounded-lg`}>{icon}</div>}
                            </div>
                            {value !== null && (
                                <p className="text-2xl font-bold text-gray-900 tabular-nums tracking-tight">{value}</p>
                            )}
                            {sub && (
                                <div className="flex items-center justify-between mt-1.5">
                                    <p className={`text-[11px] font-medium ${subPositive === false ? "text-red-500" : "text-gray-400"}`}>{sub}</p>
                                    {t !== undefined && t !== 0 && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums ${t > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                            {t > 0 ? "+" : ""}{t}%
                                        </span>
                                    )}
                                </div>
                            )}
                            {custom}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 02 FLUX TRÉSORERIE ── */}
            <SectionHeader number="02" title="Flux de trésorerie" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">

                {/* Entrées vs Sorties — bar chart */}
                <ChartCard title="Entrées vs Sorties" sub="Comparaison par période" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={fluxData} barGap={3} barCategoryGap="28%">
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="periode" tick={axisTick} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={fmt} tick={axisTick} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip fmt={(v) => formatMoneyFCFA(v)} />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
                            <Bar dataKey="Entrées" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Sorties" fill="#f87171" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Donut Entrées/Sorties - Version corrigée sans ResponsiveContainer avec dimensions fixes */}
                <ChartCard title="Répartition flux" sub={`${PERIOD_LABELS[selectedPeriod]} — cumul`}>
                    <div className="flex justify-center items-center py-4">
                        <MiniDonutChart
                            data={donutFlux}
                            colors={["#22c55e", "#f87171"]}
                            size={160}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-center">
                            <p className="text-[9px] font-semibold text-emerald-600 uppercase mb-0.5">Entrées</p>
                            <p className="text-sm font-bold text-emerald-700 tabular-nums">{fmt(totalEntrees)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] font-semibold text-red-500 uppercase mb-0.5">Sorties</p>
                            <p className="text-sm font-bold text-red-600 tabular-nums">{fmt(totalSorties)}</p>
                        </div>
                    </div>
                </ChartCard>
            </div>

            {/* ── 03 ÉVOLUTION & TENDANCES ── */}
            <SectionHeader number="03" title="Évolution & tendances" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">

                {/* CA + Marge — dual line */}
                <ChartCard title="CA vs Marge brute" sub="Évolution comparée sur la période">
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={evolutionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="periode" tick={axisTick} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={fmt} tick={axisTick} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip fmt={(v) => formatMoneyFCFA(v)} />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
                            <Line type="monotone" dataKey="CA" stroke="#3b82f6" strokeWidth={2.5}
                                  dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                            <Line type="monotone" dataKey="Marge" stroke="#10b981" strokeWidth={2}
                                  strokeDasharray="5 3"
                                  dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Solde cumulé — area */}
                <ChartCard title="Solde de trésorerie cumulé" sub="Accumulation nette des flux">
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={soldeData}>
                            <defs>
                                <linearGradient id="soldeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="periode" tick={axisTick} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={fmt} tick={axisTick} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip fmt={(v) => formatMoneyFCFA(v)} />} />
                            <Area type="monotone" dataKey="Solde" stroke="#06b6d4" strokeWidth={2.5}
                                  fill="url(#soldeGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Panier moyen — line */}
                <ChartCard title="Évolution du panier moyen" sub="Valeur moyenne par commande">
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={panierData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="periode" tick={axisTick} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={fmt} tick={axisTick} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip fmt={(v) => formatMoneyFCFA(v)} />} />
                            <Line type="monotone" dataKey="Panier moyen" stroke="#8b5cf6" strokeWidth={2.5}
                                  dot={{ r: 3.5, fill: "#8b5cf6", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Répartition CA par période - Version corrigée sans ResponsiveContainer */}
                <ChartCard title="Répartition du CA par période" sub={`Dernières ${donutCA.length} périodes`}>
                    <div className="flex items-center gap-4 flex-wrap justify-center">
                        <div className="flex-shrink-0">
                            <MiniDonutChart
                                data={donutCA}
                                colors={COLORS}
                                size={150}
                            />
                        </div>
                        <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
                            {donutCA.map((item, i) => {
                                const pct = totalCA > 0 ? ((item.value / totalCA) * 100).toFixed(1) : 0;
                                return (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                                        <span className="text-[11px] text-gray-500 flex-1 truncate">{item.name}</span>
                                        <span className="text-[11px] font-semibold text-gray-700 tabular-nums">{pct}%</span>
                                        <span className="text-[10px] text-gray-400 tabular-nums">{fmt(item.value)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* Indicateurs clés en bas */}
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-50">
                        <div className="text-center">
                            <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">Taux marge</p>
                            <p className="text-sm font-bold text-gray-900 tabular-nums">{tauxMarge.toFixed(1)}%</p>
                            <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                                <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${Math.min(100, tauxMarge)}%` }} />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">Marge brute</p>
                            <p className={`text-sm font-bold tabular-nums ${margeBrute >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                                {fmt(margeBrute)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">Conv. CA→Entrées</p>
                            <p className="text-sm font-bold text-gray-900 tabular-nums">
                                {totalCA > 0 ? ((totalEntrees / totalCA) * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                    </div>
                </ChartCard>
            </div>

            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.35s ease-out forwards; opacity: 0; }
                .tabular-nums     { font-variant-numeric: tabular-nums; }
            `}</style>
        </div>
    );
};

export default ComptabiliteDashboard;