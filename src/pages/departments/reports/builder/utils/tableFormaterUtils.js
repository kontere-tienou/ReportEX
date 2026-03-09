// utils/tableFormatters.js

export function isDateValue(value) {
    if (typeof value !== 'string') return false;

    return (
        /^\d{4}-\d{2}-\d{2}$/.test(value) ||
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
    );
}

export function formatDateValue(value) {
    if (!value) return '—';

    try {
        const datePart = String(value).split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
    } catch {
        return value;
    }
}

export function formatMoneyFCFA(value) {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    const num = Number(value);

    if (Number.isNaN(num)) {
        return value;
    }

    return `${new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num)} FCFA`;
}

export function formatNumberValue(value) {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    const num = Number(value);

    if (Number.isNaN(num)) {
        return value;
    }

    return new Intl.NumberFormat('fr-FR').format(num);
}

export function formatCellValue(value, col) {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    const moneyColumns = [
        'ca',
        'caisse_entrees',
        'caisse_sorties',
        'solde_caisse',
        'montant',
        'total',
        'prix',
        'cout',
        'budget'
    ];

    if (
        typeof col === 'string' &&
        moneyColumns.includes(col.toLowerCase())
    ) {
        return formatMoneyFCFA(value);
    }

    if (
        (typeof col === 'string' && col.toLowerCase().includes('date')) ||
        isDateValue(value)
    ) {
        return formatDateValue(value);
    }

    if (typeof value === 'number' || !Number.isNaN(Number(value))) {
        return formatNumberValue(value);
    }

    return value;
}