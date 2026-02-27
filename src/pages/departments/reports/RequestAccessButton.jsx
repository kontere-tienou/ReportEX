import { useState } from "react";
import { Lock, Send, X } from "lucide-react";
import { reportAccessService } from "../../../services/api.js";


export default function RequestAccessButton({ reportId, reportTitle, onSent }) {
    const [showModal, setShowModal] = useState(false);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRequest = async () => {
        if (!reason.trim()) {
            setError("Veuillez indiquer la raison de votre demande");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await reportAccessService.requestAccess(reportId, reason.trim());

            setShowModal(false);
            setReason("");

            if (onSent) {
                onSent();
            } else {
                alert("Demande envoyée à la direction ✅");
            }
        } catch (e) {
            const errorMsg = e?.response?.data?.message || "Erreur lors de la demande";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Button */}
            <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center rounded-lg bg-amber-600 text-white px-4 py-2 font-medium hover:bg-amber-700 transition-colors"
            >
                <Lock className="w-4 h-4 mr-2" />
                Demander l'Accès
            </button>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                                Demander l'Accès au Rapport
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {reportTitle && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>Rapport:</strong> {reportTitle}
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Raison de votre demande <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={reason}
                                    onChange={(e) => {
                                        setReason(e.target.value);
                                        setError("");
                                    }}
                                    placeholder="Expliquez pourquoi vous avez besoin d'accéder à ce rapport..."
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 ${
                                        error ? "border-red-500" : "border-gray-300"
                                    }`}
                                />
                                {error && (
                                    <p className="text-xs text-red-600 mt-1">{error}</p>
                                )}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs text-blue-800">
                                    💡 Votre demande sera envoyée à l'auteur du rapport et à la direction.
                                    Vous recevrez une notification une fois votre demande traitée.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={loading}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleRequest}
                                disabled={loading || !reason.trim()}
                                className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {loading ? "Envoi..." : "Envoyer la Demande"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}