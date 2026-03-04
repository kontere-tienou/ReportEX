// pages/departments/reports/builder/BlockSettingsPanel.jsx
import { X } from 'lucide-react';

export default function BlockSettingsPanel({
                                               block,
                                               updateComponent,
                                               onClose,
                                           }) {
    if (!block) return null;

    const handleChange = (key, value) => {
        updateComponent(block.id, { [key]: value });
    };

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l p-6 z-50 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                    Configuration du bloc
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Configuration selon le type */}
            <div className="space-y-4">
                {/* Titre */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titre
                    </label>
                    <input
                        type="text"
                        value={block.config.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Titre du bloc"
                    />
                </div>

                {/* Source de données */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Champ de données
                    </label>
                    <input
                        type="text"
                        value={block.config.field || ''}
                        onChange={(e) => handleChange('field', e.target.value)}
                        className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="ex: montant, quantite..."
                    />
                </div>

                {/* Configuration spécifique au type */}
                {block.type === 'metric' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Calcul
                            </label>
                            <select
                                value={block.config.calculation || 'sum'}
                                onChange={(e) => handleChange('calculation', e.target.value)}
                                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="sum">Somme</option>
                                <option value="avg">Moyenne</option>
                                <option value="min">Minimum</option>
                                <option value="max">Maximum</option>
                                <option value="count">Nombre</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Préfixe
                            </label>
                            <input
                                type="text"
                                value={block.config.prefix || ''}
                                onChange={(e) => handleChange('prefix', e.target.value)}
                                className="w-full border px-3 py-2 rounded-lg"
                                placeholder="€, $, %..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Suffixe
                            </label>
                            <input
                                type="text"
                                value={block.config.suffix || ''}
                                onChange={(e) => handleChange('suffix', e.target.value)}
                                className="w-full border px-3 py-2 rounded-lg"
                                placeholder="€, $, %..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Décimales
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={block.config.decimals || 0}
                                onChange={(e) => handleChange('decimals', parseInt(e.target.value))}
                                className="w-full border px-3 py-2 rounded-lg"
                            />
                        </div>
                    </>
                )}

                {block.type === 'chart' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type de graphique
                            </label>
                            <select
                                value={block.config.chartType || 'bar'}
                                onChange={(e) => handleChange('chartType', e.target.value)}
                                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="bar">Barres</option>
                                <option value="line">Ligne</option>
                                <option value="pie">Circulaire</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Axe X (catégorie)
                            </label>
                            <input
                                type="text"
                                value={block.config.xAxis || ''}
                                onChange={(e) => handleChange('xAxis', e.target.value)}
                                className="w-full border px-3 py-2 rounded-lg"
                                placeholder="ex: mois, categorie..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Axe Y (valeur)
                            </label>
                            <input
                                type="text"
                                value={block.config.yAxis || ''}
                                onChange={(e) => handleChange('yAxis', e.target.value)}
                                className="w-full border px-3 py-2 rounded-lg"
                                placeholder="ex: montant, quantite..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Agrégation
                            </label>
                            <select
                                value={block.config.aggregation || 'sum'}
                                onChange={(e) => handleChange('aggregation', e.target.value)}
                                className="w-full border px-3 py-2 rounded-lg"
                            >
                                <option value="sum">Somme</option>
                                <option value="avg">Moyenne</option>
                                <option value="count">Nombre</option>
                            </select>
                        </div>
                    </>
                )}

                {block.type === 'table' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Colonnes (séparées par des virgules)
                        </label>
                        <input
                            type="text"
                            value={(block.config.columns || []).join(', ')}
                            onChange={(e) => handleChange(
                                'columns',
                                e.target.value.split(',').map(c => c.trim()).filter(c => c)
                            )}
                            className="w-full border px-3 py-2 rounded-lg"
                            placeholder="colonne1, colonne2, colonne3"
                        />
                    </div>
                )}

                {block.type === 'text' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contenu
                        </label>
                        <textarea
                            rows={6}
                            value={block.config.content || ''}
                            onChange={(e) => handleChange('content', e.target.value)}
                            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            placeholder="Votre texte..."
                        />
                    </div>
                )}
            </div>

            <div className="mt-8 pt-4 border-t">
                <button
                    onClick={onClose}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Fermer
                </button>
            </div>
        </div>
    );
}