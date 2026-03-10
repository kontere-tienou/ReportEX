import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { previewDataService } from "../../../../../services/previewService.js";
import { formatCellValue } from "../utils/tableFormaterUtils.js";

export default function KPIBlock({ department, dateRange }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const KPI_FIELDS = [
        { key: "ca", label: "Chiffre d'affaires" },
        { key: "commandes", label: "Commandes" },
        { key: "caisse_entrees", label: "Entrées caisse" },
        { key: "caisse_sorties", label: "Sorties caisse" },
        { key: "solde_caisse", label: "Solde caisse" }
    ];

    useEffect(() => {
        loadKpis();
    }, [department, dateRange]);

    const loadKpis = async () => {
        try {
            setLoading(true);

            const response = await previewDataService.fetchPreviewData(
                department,
                { dateRange }
            );

            const rows = Array.isArray(response)
                ? response
                : response?.data || [];

            if (!rows.length) {
                setData(null);
                return;
            }

            const totals = {};

            KPI_FIELDS.forEach(field => {
                totals[field.key] = rows.reduce(
                    (sum, r) => sum + Number(r[field.key] || 0),
                    0
                );
            });

            setData(totals);

        } catch (err) {
            console.error("KPI load error", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader className="animate-spin text-cyan-600 w-6 h-6" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-6 text-gray-500">
                Aucune donnée
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {KPI_FIELDS.map(kpi => (
                <div
                    key={kpi.key}
                    className="bg-white border rounded-lg p-4 shadow-sm text-center"
                >
                    <p className="text-xs text-gray-500 mb-1">
                        {kpi.label}
                    </p>

                    <p className="text-xl font-bold text-gray-800">
                        {formatCellValue(data[kpi.key], kpi.key)}
                    </p>
                </div>
            ))}
        </div>
    );
}