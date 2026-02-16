import { useState } from 'react';
import { Save, Send, FileText, Calendar, AlertCircle, Server, Cpu, Network } from 'lucide-react';

const NewReportIT = () => {
    const [formData, setFormData] = useState({
        type: 'hebdomadaire',
        period: '',
        tickets_traites: '',
        tickets_ouverts: '',
        temps_moyen: '',
        satisfaction: '',
        incidents: '',
        interventions_preventives: '',
        uptime_moyen: '',
        serveurs_status: '',
        alertes_critiques: '',
        mises_a_jour: '',
        nouvelles_installations: '',
        utilisateurs_crees: '',
        utilisateurs_desactives: '',
        formations: '',
        problemes_recurrents: '',
        ameliorations: '',
        notes: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Envoi rapport IT:', formData);
        // TODO: API call
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Nouveau Rapport IT</h1>
                <p className="text-gray-600 mt-1">Rapport d'activité département Informatique</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations Générales */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-cyan-600" />
                        Informations Générales
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type de Rapport *
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            >
                                <option value="quotidien">Quotidien</option>
                                <option value="hebdomadaire">Hebdomadaire</option>
                                <option value="mensuel">Mensuel</option>
                                <option value="incident">Incident Majeur</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Période *
                            </label>
                            <input
                                type="text"
                                name="period"
                                value={formData.period}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Ex: Semaine 07 (12-18 Fév 2026)"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Support & Tickets */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-cyan-600" />
                        Support & Tickets
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tickets Traités *
                            </label>
                            <input
                                type="number"
                                name="tickets_traites"
                                value={formData.tickets_traites}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tickets Ouverts
                            </label>
                            <input
                                type="number"
                                name="tickets_ouverts"
                                value={formData.tickets_ouverts}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Temps Moyen Résolution (heures)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                name="temps_moyen"
                                value={formData.temps_moyen}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Satisfaction Utilisateurs (/5)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                name="satisfaction"
                                value={formData.satisfaction}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Incidents Majeurs
                            </label>
                            <input
                                type="number"
                                name="incidents"
                                value={formData.incidents}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Interventions Préventives
                            </label>
                            <input
                                type="number"
                                name="interventions_preventives"
                                value={formData.interventions_preventives}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Infrastructure */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Server className="w-5 h-5 mr-2 text-cyan-600" />
                        Infrastructure & Systèmes
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Uptime Moyen (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                name="uptime_moyen"
                                value={formData.uptime_moyen}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Statut Serveurs
                            </label>
                            <input
                                type="text"
                                name="serveurs_status"
                                value={formData.serveurs_status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Ex: 28/30 opérationnels"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Alertes Critiques
                            </label>
                            <input
                                type="number"
                                name="alertes_critiques"
                                value={formData.alertes_critiques}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mises à Jour Effectuées
                            </label>
                            <input
                                type="number"
                                name="mises_a_jour"
                                value={formData.mises_a_jour}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Gestion Utilisateurs */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Cpu className="w-5 h-5 mr-2 text-cyan-600" />
                        Gestion Utilisateurs & Administration
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Utilisateurs Créés
                            </label>
                            <input
                                type="number"
                                name="utilisateurs_crees"
                                value={formData.utilisateurs_crees}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Utilisateurs Désactivés
                            </label>
                            <input
                                type="number"
                                name="utilisateurs_desactives"
                                value={formData.utilisateurs_desactives}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nouvelles Installations
                            </label>
                            <input
                                type="number"
                                name="nouvelles_installations"
                                value={formData.nouvelles_installations}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Formations Dispensées
                            </label>
                            <input
                                type="text"
                                name="formations"
                                value={formData.formations}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Ex: Formation nouveaux utilisateurs (5 personnes)"
                            />
                        </div>
                    </div>
                </div>

                {/* Observations & Recommandations */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Network className="w-5 h-5 mr-2 text-cyan-600" />
                        Observations & Recommandations
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Problèmes Récurrents
                            </label>
                            <textarea
                                name="problemes_recurrents"
                                value={formData.problemes_recurrents}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Décrire les problèmes qui se répètent..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Améliorations Proposées
                            </label>
                            <textarea
                                name="ameliorations"
                                value={formData.ameliorations}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Suggestions d'amélioration..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes Additionnelles
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Autres informations importantes..."
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4">
                    <button
                        type="submit"
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg flex items-center font-medium"
                    >
                        <Send className="w-5 h-5 mr-2" />
                        Soumettre le Rapport
                    </button>

                    <button
                        type="button"
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center font-medium"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        Sauvegarder Brouillon
                    </button>

                    <button
                        type="button"
                        className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium"
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewReportIT;