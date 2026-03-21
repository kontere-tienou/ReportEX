import { useState, useEffect, useRef } from 'react';
import { X, Save, Database, Calendar, Hash, Type, AlignLeft, DollarSign } from 'lucide-react';
import { dataService } from '../../../services/dataService.js';
import { useToast } from '../../../components/ui/Toast';
import { formatMoneyFCFA, formatNumberValue } from '../reports/builder/utils/tableFormaterUtils.js';

// Colonnes monétaires — doit correspondre à formatCellValue dans tableFormaterUtils
const MONEY_COLS = [
    'ca', 'caisse_entrees', 'caisse_sorties', 'solde_caisse',
    'montant', 'total', 'prix', 'cout', 'budget',
];

const isMoney = (key) =>
    MONEY_COLS.includes((key || '').toLowerCase()) ||
    (key || '').toLowerCase().includes('montant') ||
    (key || '').toLowerCase().includes('caisse') ||
    (key || '').toLowerCase().includes('solde');

/**
 * Input numérique intelligent :
 * - En focus  → valeur brute éditable (ex: "20000000")
 * - Hors focus → valeur formattée (ex: "20.000.000,00 FCFA" ou "20 000")
 */
function SmartNumberInput({ fieldKey, value, onChange, onBlur, min, max, step, placeholder, hasError, unit }) {
    const [focused, setFocused] = useState(false);
    const money = isMoney(fieldKey);

    const displayValue = () => {
        if (focused) return value; // brut pendant l'édition
        if (value === '' || value === null || value === undefined) return '';
        const n = Number(value);
        if (isNaN(n)) return value;
        return money ? formatMoneyFCFA(n) : formatNumberValue(n);
    };

    return (
        <div className="relative">
            <input
                type={focused ? 'number' : 'text'}
                value={displayValue()}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => { setFocused(false); onBlur?.(); }}
                min={min} max={max}
                step={step || 'any'}
                placeholder={placeholder || (money ? '0' : '0')}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-800 tabular-nums ${
                    hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                } ${money && !focused ? 'font-medium text-gray-700' : ''}`}
            />
            {/* Badge type à droite quand hors focus */}
            {!focused && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-300 pointer-events-none select-none">
                    {unit || (money ? 'FCFA' : '#')}
                </span>
            )}
        </div>
    );
}

export default function DataEntryModal({
                                           isOpen, onClose, onSuccess,
                                           editingData = null, schema, deptCode, departmentName
                                       }) {
    const { addToast } = useToast();
    const [formData,    setFormData]    = useState({});
    const [machinesData,setMachinesData]= useState({});
    const [loading,     setLoading]     = useState(false);
    const [touched,     setTouched]     = useState({});
    const firstInputRef = useRef(null);
    const isEdit = !!editingData;

    useEffect(() => {
        if (!isOpen || !schema) { document.body.style.overflow = 'unset'; return; }
        document.body.style.overflow = 'hidden';

        if (editingData) {
            setFormData(editingData);
            if (editingData.machines_data) {
                try {
                    setMachinesData(
                        typeof editingData.machines_data === 'string'
                            ? JSON.parse(editingData.machines_data)
                            : editingData.machines_data
                    );
                } catch {}
            }
        } else {
            const init = {};
            schema.fields.forEach(f => {
                if      (f.type === 'date')                    init[f.key] = new Date().toISOString().split('T')[0];
                else if (f.type === 'select' && f.defaultValue) init[f.key] = f.defaultValue;
                else                                            init[f.key] = '';
            });
            setFormData(init);
            if (schema.machines?.length) {
                const initM = {};
                schema.machines.forEach(m => { initM[m.key] = ''; });
                setMachinesData(initM);
            }
        }
        setTouched({});
        setTimeout(() => firstInputRef.current?.focus(), 80);
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, editingData, schema]);

    const handleChange = (key, value) => {
        setFormData(p => ({ ...p, [key]: value }));
        setTouched(p => ({ ...p, [key]: true }));
    };

    const getError = (field) => {
        if (!touched[field.key]) return null;
        const v = formData[field.key];
        if (field.required && (v === '' || v === null || v === undefined)) return 'Champ requis';
        if (field.type === 'number' && v !== '') {
            const n = Number(v);
            if (isNaN(n)) return 'Nombre invalide';
            if (field.min !== undefined && n < field.min) return `Min : ${field.min}`;
            if (field.max !== undefined && n > field.max) return `Max : ${field.max}`;
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Touch all required fields
        const allTouched = {};
        schema.fields.forEach(f => { allTouched[f.key] = true; });
        setTouched(allTouched);

        // Validate
        for (const field of schema.fields.filter(f => f.required)) {
            const v = formData[field.key];
            if (v === '' || v === null || v === undefined) {
                addToast(`${field.label} est requis`, 'warning', 3000);
                return;
            }
        }

        setLoading(true);
        try {
            const payload = { ...formData };
            schema.fields.forEach(f => {
                if (f.type === 'number' && payload[f.key] !== '')
                    payload[f.key] = Number(payload[f.key]);
            });
            if (schema.machines && Object.keys(machinesData).length > 0)
                payload.machines_data = machinesData;

            if (isEdit) {
                await dataService.update(deptCode, editingData.id, payload);
                addToast('Saisie modifiée avec succès', 'success', 2500);
            } else {
                await dataService.create(deptCode, payload);
                addToast('Saisie enregistrée avec succès', 'success', 2500);
            }
            onSuccess();
        } catch (err) {
            addToast(err.response?.data?.message || err.message || 'Erreur de sauvegarde', 'error', 3500);
        } finally {
            setLoading(false);
        }
    };

    const getFieldIcon = (field) => {
        const cls = "w-3.5 h-3.5";
        if (field.type === 'date')     return <Calendar  className={cls} />;
        if (field.type === 'textarea') return <AlignLeft className={cls} />;
        if (field.type === 'number')   return isMoney(field.key)
            ? <DollarSign className={cls} />
            : <Hash className={cls} />;
        return <Type className={cls} />;
    };

    if (!isOpen || !schema) return null;

    // Séparer les champs : date en premier, puis les autres
    const dateFields   = schema.fields.filter(f => f.type === 'date');
    const regularFields= schema.fields.filter(f => f.type !== 'date' && f.type !== 'textarea');
    const textareaFields = schema.fields.filter(f => f.type === 'textarea');

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,18,25,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div
                className="bg-white rounded-2xl w-full flex flex-col"
                style={{ maxWidth: 680, maxHeight: '92vh', boxShadow: '0 32px 80px rgba(0,0,0,0.18)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-semibold text-cyan-500 uppercase tracking-widest">
                                {schema.icon} {departmentName}
                            </span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                            {isEdit ? 'Modifier la saisie' : 'Nouvelle saisie'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <form id="modal-form" onSubmit={handleSubmit} noValidate>

                        {/* Date — pleine largeur, mise en avant */}
                        {dateFields.map((field, idx) => (
                            <div key={field.key} className="mb-5">
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                    {getFieldIcon(field)}
                                    {field.label}
                                    {field.required && <span className="text-red-400">*</span>}
                                </label>
                                <input
                                    ref={idx === 0 ? firstInputRef : undefined}
                                    type="date"
                                    value={(formData[field.key] || '').slice(0, 10)}
                                    onChange={e => handleChange(field.key, e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-gray-800 font-medium bg-gray-50 focus:bg-white"
                                />
                                {getError(field) && (
                                    <p className="text-[11px] text-red-500 mt-1">{getError(field)}</p>
                                )}
                            </div>
                        ))}

                        {/* Champs numériques — grille 2 colonnes */}
                        {regularFields.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                                {regularFields.map((field, idx) => {
                                    const err = getError(field);
                                    return (
                                        <div key={field.key}>
                                            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                                {getFieldIcon(field)}
                                                {field.label}
                                                {field.required && <span className="text-red-400">*</span>}
                                            </label>

                                            {field.type === 'select' ? (
                                                <select
                                                    value={formData[field.key] || ''}
                                                    onChange={e => handleChange(field.key, e.target.value)}
                                                    className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-800 ${err ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                                                    <option value="">Sélectionner…</option>
                                                    {field.options?.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : field.type === 'number' ? (
                                                <SmartNumberInput
                                                    fieldKey={field.key}
                                                    value={formData[field.key] ?? ''}
                                                    onChange={v => handleChange(field.key, v)}
                                                    onBlur={() => setTouched(p => ({ ...p, [field.key]: true }))}
                                                    min={field.min}
                                                    max={field.max}
                                                    step={field.step}
                                                    placeholder={field.placeholder}
                                                    hasError={!!err}
                                                    unit={field.unit}
                                                />
                                            ) : (
                                                <input
                                                    ref={dateFields.length === 0 && idx === 0 ? firstInputRef : undefined}
                                                    type={field.type}
                                                    value={formData[field.key] || ''}
                                                    onChange={e => handleChange(field.key, e.target.value)}
                                                    onBlur={() => setTouched(p => ({ ...p, [field.key]: true }))}
                                                    placeholder={field.placeholder || ''}
                                                    className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-800 ${err ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                                />
                                            )}

                                            {err ? (
                                                <p className="text-[11px] text-red-500 mt-1">{err}</p>
                                            ) : field.help ? (
                                                <p className="text-[11px] text-gray-400 mt-1">{field.help}</p>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Textareas — pleine largeur */}
                        {textareaFields.map(field => (
                            <div key={field.key} className="mb-4">
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                    {getFieldIcon(field)}
                                    {field.label}
                                    {field.required && <span className="text-red-400">*</span>}
                                </label>
                                <textarea
                                    value={formData[field.key] || ''}
                                    onChange={e => handleChange(field.key, e.target.value)}
                                    rows={field.rows || 3}
                                    placeholder={field.placeholder || `Observations, notes…`}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none transition-all bg-gray-50 focus:bg-white text-gray-800"
                                />
                                {field.help && <p className="text-[11px] text-gray-400 mt-1">{field.help}</p>}
                            </div>
                        ))}

                        {/* Machines */}
                        {schema.machines?.length > 0 && (
                            <div className="mt-2 pt-5 border-t border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Database className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">État des machines</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {schema.machines.map(machine => (
                                        <div key={machine.key}>
                                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5">{machine.label}</label>
                                            <input
                                                type="number"
                                                value={machinesData[machine.key] || ''}
                                                onChange={e => setMachinesData(p => ({ ...p, [machine.key]: e.target.value }))}
                                                min="0" step="0.01" placeholder="0.00"
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-gray-50 focus:bg-white tabular-nums"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
                    <p className="text-[11px] text-gray-400">
                        {schema.fields.filter(f => f.required).length} champ{schema.fields.filter(f => f.required).length > 1 ? 's' : ''} obligatoire{schema.fields.filter(f => f.required).length > 1 ? 's' : ''}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-white transition-colors disabled:opacity-50">
                            Annuler
                        </button>
                        <button
                            type="submit"
                            form="modal-form"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[130px] justify-center">
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Enregistrement…
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {isEdit ? 'Mettre à jour' : 'Enregistrer'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .tabular-nums { font-variant-numeric: tabular-nums; }
            `}</style>
        </div>
    );
}