import { Lock } from "lucide-react";
import { reportAccessService } from "../../../services/api.js";

export default function RequestAccessButton({ reportId, onSent }) {
    const request = async () => {
        try {
            await reportAccessService.requestAccess(reportId);
            onSent?.();
            alert("Demande envoyée à la direction ✅");
        } catch (e) {
            alert(e?.response?.data?.message || "Erreur");
        }
    };

    return (
        <button
            onClick={request}
            className="inline-flex items-center rounded-lg bg-amber-600 text-white px-4 py-2 font-medium hover:bg-amber-700"
        >
            <Lock className="w-4 h-4 mr-2" />
            Demander accès
        </button>
    );
}
