import { useState, useEffect } from "react";
import {
    Users, Calendar, TrendingUp, UserPlus, Clock, AlertCircle,
    FileText, CheckCircle, Activity, RefreshCw, ArrowUpRight, ArrowDownRight,
    Wallet, Briefcase, GraduationCap, UserMinus, BarChart3,
    PieChart, LineChart, TrendingDown, Settings
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, AreaChart, PieChart as RePieChart,
    Pie, Cell, LineChart as ReLineChart, Line, Legend,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

import { dataService } from "../../../services/dataService.js";
import { formatMoneyFCFA, formatNumberValue } from "../reports/builder/utils/tableFormaterUtils.js";
import {useAuth} from "../../../context/AuthContext.jsx";

const DEPT_CODE = "RH";

const PERIOD_TYPES = { DAY: "day", WEEK: "week", MONTH: "month", QUARTER: "quarter", YEAR: "year" };
const PERIOD_LABELS = { day: "Jour", week: "Sem.", month: "Mois", quarter: "Trim.", year: "Année" };

/* ─── Helpers ────────────────────────────────────────────────────── */
const safeNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

const fmt = (v) => {
    const n = safeNum(v);
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}Md`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return formatNumberValue(n);
};

const formatPercent = (v) => `${safeNum(v).toFixed(1)}%`;

/* ─── Filtre par période ─────────────────────────────────────────── */
const filterDataByPeriod = (data, periodType) => {
    const dateTo = new Date().toISOString().split("T")[0];
    let dateFrom;
    const offsets = {
        day: () => { const d = new Date(); d.setDate(d.getDate() - 30); return d; },
        week: () => { const d = new Date(); d.setDate(d.getDate() - 7); return d; },
        month: () => { const d = new Date(); d.setMonth(d.getMonth() - 12); return d; },
        quarter: () => { const d = new Date(); d.setMonth(d.getMonth() - 24); return d; },
        year: () => { const d = new Date(); d.setFullYear(d.getFullYear() - 5); return d; },
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
            map.set(key, {
                periode: label,
                effectif_total: 0,
                nb_presents: 0,
                nb_absents: 0,
                taux_absenteisme: 0,
                nb_conges: 0,
                nb_arrets_maladie: 0,
                nb_recrutements: 0,
                nb_departs: 0,
                nb_formations: 0,
                heures_supplementaires: 0,
            });
        }
        const cur = map.get(key);
        cur.effectif_total += safeNum(row.effectif_total);
        cur.nb_presents += safeNum(row.nb_presents);
        cur.nb_absents += safeNum(row.nb_absents);
        cur.taux_absenteisme = safeNum(row.taux_absenteisme);
        cur.nb_conges += safeNum(row.nb_conges);
        cur.nb_arrets_maladie += safeNum(row.nb_arrets_maladie);
        cur.nb_recrutements += safeNum(row.nb_recrutements || 0);
        cur.nb_departs += safeNum(row.nb_departs || 0);
        cur.nb_formations += safeNum(row.nb_formations || 0);
        cur.heures_supplementaires += safeNum(row.heures_supplementaires || 0);
    });

    return [...map.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, v]) => ({
            ...v,
            taux_presence: v.effectif_total > 0 ? (v.nb_presents / v.effectif_total) * 100 : 0,
            solde_effectif: v.nb_recrutements - v.nb_departs,
        }));
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

const KpiCard = ({ label, value, sub, subPositive, icon: Icon, color, trend, delay = 0 }) => {
    const colors = {
        red: { border: "border-l-red-500", bg: "bg-red-50", text: "text-red-600" },
        green: { border: "border-l-green-500", bg: "bg-green-50", text: "text-green-600" },
        blue: { border: "border-l-blue-500", bg: "bg-blue-50", text: "text-blue-600" },
        purple: { border: "border-l-purple-500", bg: "bg-purple-50", text: "text-purple-600" },
        orange: { border: "border-l-orange-500", bg: "bg-orange-50", text: "text-orange-600" },
        cyan: { border: "border-l-cyan-500", bg: "bg-cyan-50", text: "text-cyan-600" },
    };
    const c = colors[color] || colors.blue;

    return (
        <div className={`group bg-white rounded-xl shadow-sm border border-l-4 ${c.border} p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up`} style={{ animationDelay: `${delay}ms` }}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
                <div className={`${c.bg} p-2 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-4 h-4 ${c.text}`} />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1 tabular-nums">{value}</p>
            {sub && (
                <p className={`text-xs flex items-center gap-1 ${subPositive === undefined ? "text-gray-500" : subPositive ? "text-green-600" : "text-red-500"}`}>
                    {subPositive !== undefined && (subPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />)}
                    {sub}
                </p>
            )}
            {trend !== undefined && trend !== 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                        {trend > 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                        <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </span>
                        <span className="text-xs text-gray-400">vs période précédente</span>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─── DASHBOARD RH ──────────────────────────────────────────────────── */
const RHDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_TYPES.MONTH);
    const [isUpdating, setIsUpdating] = useState(false);
    const [allData, setAllData] = useState([]);
    const [aggregatedData, setAggregatedData] = useState([]);
    const [entryStats, setEntryStats] = useState({ total: 0, today: 0, thisWeek: 0, thisMonth: 0 });

    /* ── Fetch ── */
    const loadData = async () => {
        try {
            setLoading(true);

            // Use the deeper nesting we found in your logs
            const currentUserId = user?.id || user?.department?.user_id;

            // Prevent sending "undefined" to the API
            const params = (currentUserId && currentUserId !== 'undefined')
                ? { userId: currentUserId }
                : {};

            const response = await dataService.getAll(DEPT_CODE, params);

            // Defensive check for data structure
            const dataArray = Array.isArray(response) ? response : response?.data ?? [];
            setAllData(dataArray);

            // ... rest of your stat calculation logic
        } catch (err) {
            console.error("Dashboard Load Error:", err);
            setError(err.message || "Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // Reload if the user changes (e.g. after a delayed login)
    useEffect(() => {
        if (user?.id) {
            loadData();
        }
    }, [user?.id]);

    useEffect(() => {
        if (!allData.length) return;
        setIsUpdating(true);
        setTimeout(() => {
            const filtered = filterDataByPeriod(allData, selectedPeriod);
            const aggregated = aggregateByPeriod(filtered, selectedPeriod);
            setAggregatedData(aggregated);
            setIsUpdating(false);
        }, 200);
    }, [selectedPeriod, allData]);

    const current = aggregatedData[aggregatedData.length - 1] || {};
    const previous = aggregatedData[aggregatedData.length - 2] || {};

    const totalEffectif = aggregatedData.reduce((s, m) => s + m.effectif_total, 0);
    const totalPresents = aggregatedData.reduce((s, m) => s + m.nb_presents, 0);
    const totalAbsents = aggregatedData.reduce((s, m) => s + m.nb_absents, 0);
    const totalConges = aggregatedData.reduce((s, m) => s + m.nb_conges, 0);
    const totalArrets = aggregatedData.reduce((s, m) => s + m.nb_arrets_maladie, 0);
    const totalRecrutements = aggregatedData.reduce((s, m) => s + m.nb_recrutements, 0);
    const totalDeparts = aggregatedData.reduce((s, m) => s + m.nb_departs, 0);
    const totalFormations = aggregatedData.reduce((s, m) => s + m.nb_formations, 0);
    const totalHeuresSup = aggregatedData.reduce((s, m) => s + m.heures_supplementaires, 0);

    const tauxPresenceGlobal = totalEffectif > 0 ? (totalPresents / totalEffectif) * 100 : 0;
    const tauxAbsenteismeGlobal = totalEffectif > 0 ? (totalAbsents / totalEffectif) * 100 : 0;
    const soldeEffectif = totalRecrutements - totalDeparts;
    const turnoverRate = totalEffectif > 0 ? ((totalDeparts + totalRecrutements) / totalEffectif) * 100 : 0;

    const trend = (cur, prev) => prev ? Math.round(((cur - prev) / prev) * 100) : 0;
    const effectifTrend = trend(current.effectif_total, previous.effectif_total);
    const presenceTrend = trend(current.taux_presence, previous.taux_presence);
    const recrutementTrend = trend(current.nb_recrutements, previous.nb_recrutements);

    /* Données pour graphiques */
    const presenceData = aggregatedData.map(m => ({
        periode: m.periode,
        Présents: m.nb_presents,
        Absents: m.nb_absents,
        TauxPresence: m.taux_presence,
    }));

    const evolutionData = aggregatedData.map(m => ({
        periode: m.periode,
        Effectif: m.effectif_total,
        Recrutements: m.nb_recrutements,
        Départs: m.nb_departs,
    }));

    const congesData = aggregatedData.map(m => ({
        periode: m.periode,
        Congés: m.nb_conges,
        Arrêts: m.nb_arrets_maladie,
    }));

    const formationsData = aggregatedData.map(m => ({
        periode: m.periode,
        Formations: m.nb_formations,
        "Heures Sup": m.heures_supplementaires,
    }));

    const donutEffectif = [
        { name: "Présents", value: totalPresents },
        { name: "Absents", value: totalAbsents },
    ];

    const donutMouvements = [
        { name: "Recrutements", value: totalRecrutements },
        { name: "Départs", value: totalDeparts },
    ];

    const radarData = [
        { subject: "Présence", value: Math.min(100, tauxPresenceGlobal) },
        { subject: "Absentéisme", value: Math.min(100, tauxAbsenteismeGlobal) },
        { subject: "Formations", value: Math.min(100, (totalFormations / Math.max(1, aggregatedData.length)) * 10) },
        { subject: "Heures Sup", value: Math.min(100, (totalHeuresSup / Math.max(1, aggregatedData.length)) * 2) },
        { subject: "Turnover", value: Math.min(100, turnoverRate) },
        { subject: "Stabilité", value: Math.max(0, 100 - turnoverRate) },
    ];

    const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#06b6d4"];
    const axisTick = { fontSize: 10, fill: "#9ca3af" };
    const gridColor = "#f3f4f6";

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full border-[3px] border-red-100 border-t-red-500 animate-spin" />
                <p className="text-sm text-gray-400">Chargement des données RH...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6">
                <div className="bg-white border border-red-100 rounded-2xl p-6 max-w-md w-full">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertCircle className="text-red-400 w-5 h-5" />
                        <h2 className="text-base font-semibold text-gray-900">Erreur</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{error}</p>
                    <button onClick={loadData} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700">Réessayer</button>
                </div>
            </div>
        );
    }

    if (allData.length === 0) {
        return (
            <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md text-center">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users className="w-7 h-7 text-gray-300" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Aucune donnée RH</h2>
                    <p className="text-sm text-gray-400 mb-5">Commencez par saisir des données RH.</p>
                    <button onClick={() => window.location.href = `/departments/data/${DEPT_CODE.toLowerCase()}`}
                            className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700">
                        Aller à la saisie
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                    <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest mb-1.5">Département RH</p>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tableau de Bord RH</h1>
                    <p className="text-xs text-gray-400 mt-1 font-medium">
                        {allData.length} saisie(s) · {entryStats.thisMonth} ce mois-ci
                    </p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <PeriodFilter selected={selectedPeriod} onChange={setSelectedPeriod} />
                    <button onClick={loadData} className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50">
                        <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? "animate-spin text-red-500" : "text-gray-400"}`} />
                        Actualiser
                    </button>
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-3 py-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] text-red-700 font-semibold uppercase tracking-wide">Live</span>
                    </div>
                </div>
            </div>

            {isUpdating && (
                <div className="fixed top-4 right-4 bg-white border border-red-100 rounded-xl px-3.5 py-2 shadow-md z-50 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-red-500 animate-spin" />
                    <span className="text-xs font-medium text-red-600">Actualisation…</span>
                </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KpiCard label="Effectif Total" value={formatNumberValue(current.effectif_total || totalEffectif)} sub={`Moyenne: ${formatNumberValue(Math.round(totalEffectif / Math.max(1, aggregatedData.length)))}`} icon={Users} color="blue" trend={effectifTrend} delay={0} />
                <KpiCard label="Taux Présence" value={formatPercent(current.taux_presence || tauxPresenceGlobal)} sub={`${formatNumberValue(current.nb_presents || 0)} présents`} subPositive={presenceTrend > 0} icon={Activity} color="green" trend={presenceTrend} delay={100} />
                <KpiCard label="Recrutements" value={formatNumberValue(current.nb_recrutements || totalRecrutements)} sub={`Net: ${soldeEffectif > 0 ? '+' : ''}${formatNumberValue(soldeEffectif)}`} subPositive={recrutementTrend > 0} icon={UserPlus} color="purple" trend={recrutementTrend} delay={200} />
                <KpiCard label="Absentéisme" value={formatPercent(current.taux_absenteisme || tauxAbsenteismeGlobal)} sub={`${formatNumberValue(totalConges)} congés · ${formatNumberValue(totalArrets)} arrêts`} icon={Clock} color="red" delay={300} />
            </div>

            {/* Deuxième ligne KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KpiCard label="Départs" value={formatNumberValue(current.nb_departs || totalDeparts)} sub={`Turnover: ${turnoverRate.toFixed(1)}%`} icon={UserMinus} color="orange" delay={400} />
                <KpiCard label="Formations" value={formatNumberValue(current.nb_formations || totalFormations)} sub={`${formatNumberValue(Math.round(totalFormations / Math.max(1, aggregatedData.length)))}/période`} icon={GraduationCap} color="cyan" delay={500} />
                <KpiCard label="Heures Sup." value={`${formatNumberValue(current.heures_supplementaires || totalHeuresSup)}h`} sub={`Moyenne: ${formatNumberValue(Math.round(totalHeuresSup / Math.max(1, aggregatedData.length)))}h`} icon={Clock} color="purple" delay={600} />
                <KpiCard label="Saisies" value={formatNumberValue(entryStats.thisMonth)} sub={`${entryStats.thisWeek} cette semaine`} icon={FileText} color="blue" delay={700} />
            </div>

            {/* Graphiques */}
            <SectionHeader number="01" title="Présence & Absentéisme" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                <ChartCard title="Présence vs Absence" sub="Comparaison par période" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={presenceData} barGap={3}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="periode" tick={axisTick} axisLine={false} tickLine={false} />
                            <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip fmt={(v) => formatNumberValue(v)} />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
                            <Bar dataKey="Présents" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Absents" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Répartition Présence" sub="Cumul période">
                    <ResponsiveContainer width="100%" height={200}>
                        <RePieChart>
                            <Pie data={donutEffectif} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value"
                                 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                <Cell fill="#10b981" /><Cell fill="#ef4444" />
                            </Pie>
                            <Tooltip formatter={(v) => formatNumberValue(v)} />
                        </RePieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-center"><p className="text-[9px] font-semibold text-green-600">Présents</p><p className="text-sm font-bold text-green-700">{formatNumberValue(totalPresents)}</p></div>
                        <div className="text-center"><p className="text-[9px] font-semibold text-red-500">Absents</p><p className="text-sm font-bold text-red-600">{formatNumberValue(totalAbsents)}</p></div>
                    </div>
                </ChartCard>
            </div>

            <SectionHeader number="02" title="Évolution des Effectifs" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                <ChartCard title="Évolution Effectifs" sub="Recrutements vs Départs">
                    <ResponsiveContainer width="100%" height={240}>
                        <ReLineChart data={evolutionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="periode" tick={axisTick} axisLine={false} tickLine={false} />
                            <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip fmt={(v) => formatNumberValue(v)} />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
                            <Line type="monotone" dataKey="Effectif" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="Recrutements" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="Départs" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                        </ReLineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Mouvements RH" sub="Répartition Recrutements/Départs">
                    <ResponsiveContainer width="100%" height={200}>
                        <RePieChart>
                            <Pie data={donutMouvements} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value"
                                 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                <Cell fill="#10b981" /><Cell fill="#ef4444" />
                            </Pie>
                            <Tooltip formatter={(v) => formatNumberValue(v)} />
                        </RePieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-center"><p className="text-[9px] font-semibold text-green-600">Recrutements</p><p className="text-sm font-bold text-green-700">{formatNumberValue(totalRecrutements)}</p></div>
                        <div className="text-center"><p className="text-[9px] font-semibold text-red-500">Départs</p><p className="text-sm font-bold text-red-600">{formatNumberValue(totalDeparts)}</p></div>
                    </div>
                </ChartCard>
            </div>

            <SectionHeader number="03" title="Congés & Formations" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                <ChartCard title="Congés & Arrêts Maladie" sub="Évolution sur la période">
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={congesData} barGap={3}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="periode" tick={axisTick} axisLine={false} tickLine={false} />
                            <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip fmt={(v) => formatNumberValue(v)} />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
                            <Bar dataKey="Congés" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Arrêts" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Formations & Heures Supplémentaires" sub="Évolution sur la période">
                    <ResponsiveContainer width="100%" height={240}>
                        <ReLineChart data={formationsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="periode" tick={axisTick} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" tick={axisTick} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" tick={axisTick} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip fmt={(v) => formatNumberValue(v)} />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
                            <Bar yAxisId="left" dataKey="Formations" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="Heures Sup" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                        </ReLineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <SectionHeader number="04" title="Radar de Performance RH" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                <ChartCard title="Indicateurs Clés RH">
                    <ResponsiveContainer width="100%" height={280}>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#6b7280" }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                            <Radar name="Performance RH" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                        </RadarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Indicateurs Complémentaires">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                            <p className="text-[10px] text-gray-400 uppercase mb-1">Turnover</p>
                            <p className="text-2xl font-bold text-gray-900">{turnoverRate.toFixed(1)}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2"><div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, turnoverRate)}%` }} /></div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                            <p className="text-[10px] text-gray-400 uppercase mb-1">Stabilité</p>
                            <p className="text-2xl font-bold text-gray-900">{(100 - turnoverRate).toFixed(1)}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.max(0, 100 - turnoverRate)}%` }} /></div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                            <p className="text-[10px] text-gray-400 uppercase mb-1">Formation/personne</p>
                            <p className="text-2xl font-bold text-gray-900">{(totalFormations / Math.max(1, totalEffectif)).toFixed(2)}</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                            <p className="text-[10px] text-gray-400 uppercase mb-1">Heures Sup/personne</p>
                            <p className="text-2xl font-bold text-gray-900">{Math.round(totalHeuresSup / Math.max(1, totalEffectif))}h</p>
                        </div>
                    </div>
                </ChartCard>
            </div>

            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.35s ease-out forwards; opacity: 0; }
                .tabular-nums { font-variant-numeric: tabular-nums; }
            `}</style>
        </div>
    );
};

export default RHDashboard;