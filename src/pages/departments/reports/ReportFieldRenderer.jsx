import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';


const ReportFieldRenderer = ({ field, value, onChange, errors }) => {
    const [listItems, setListItems] = useState(value || []);
    const [newItem, setNewItem] = useState('');
    const [gridRows, setGridRows] = useState(value || []);

    // Text Input
    const renderTextInput = () => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder}
                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all
          focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500
          ${errors ? 'border-red-500' : 'border-gray-200'}`}
            />
            {errors && <p className="text-xs text-red-600 mt-1">{errors}</p>}
        </div>
    );

    // Number Input
    const renderNumberInput = () => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
                {field.calculated && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            Calculé
          </span>
                )}
            </label>
            <input
                type="number"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder}
                disabled={field.calculated}
                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all
          ${field.calculated ? 'bg-gray-50 cursor-not-allowed' : 'focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500'}
          ${errors ? 'border-red-500' : 'border-gray-200'}`}
            />
            {errors && <p className="text-xs text-red-600 mt-1">{errors}</p>}
        </div>
    );

    // Textarea
    const renderTextarea = () => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
                rows={field.rows || 5}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder}
                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all resize-none
          focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500
          ${errors ? 'border-red-500' : 'border-gray-200'}`}
            />
            {errors && <p className="text-xs text-red-600 mt-1">{errors}</p>}
        </div>
    );

    // List (Dynamic items)
    const renderList = () => {
        const handleAddItem = () => {
            if (!newItem.trim()) return;

            const updatedList = [...listItems, newItem.trim()];
            setListItems(updatedList);
            onChange(updatedList);
            setNewItem('');
        };

        const handleRemoveItem = (index) => {
            const updatedList = listItems.filter((_, i) => i !== index);
            setListItems(updatedList);
            onChange(updatedList);
        };

        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {/* Existing items */}
                {listItems.length > 0 && (
                    <div className="space-y-2 mb-3">
                        {listItems.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <span className="text-sm text-gray-900">{item}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add new item */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddItem();
                            }
                        }}
                        placeholder={field.placeholder}
                        className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-200
              focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 transition-all"
                    />
                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700
              transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Ajouter
                    </button>
                </div>

                {errors && <p className="text-xs text-red-600 mt-1">{errors}</p>}
            </div>
        );
    };

    // Grid (Table with multiple columns)
    const renderGrid = () => {
        const handleAddRow = () => {
            const newRow = {};
            field.columns.forEach((col) => {
                newRow[col.key] = '';
            });

            const updatedGrid = [...gridRows, newRow];
            setGridRows(updatedGrid);
            onChange(updatedGrid);
        };

        const handleRemoveRow = (index) => {
            const updatedGrid = gridRows.filter((_, i) => i !== index);
            setGridRows(updatedGrid);
            onChange(updatedGrid);
        };

        const handleCellChange = (rowIndex, colKey, cellValue) => {
            const updatedGrid = [...gridRows];
            updatedGrid[rowIndex][colKey] = cellValue;
            setGridRows(updatedGrid);
            onChange(updatedGrid);
        };

        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {/* Grid table */}
                {gridRows.length > 0 && (
                    <div className="overflow-x-auto mb-3">
                        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                            <tr>
                                {field.columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                                    >
                                        {col.label}
                                    </th>
                                ))}
                                <th className="px-4 py-3 w-20"></th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {gridRows.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {field.columns.map((col) => (
                                        <td key={col.key} className="px-4 py-3">
                                            <input
                                                type={col.type || 'text'}
                                                value={row[col.key] || ''}
                                                onChange={(e) =>
                                                    handleCellChange(rowIndex, col.key, e.target.value)
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                            focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                                            />
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRow(rowIndex)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add row button */}
                <button
                    type="button"
                    onClick={handleAddRow}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg
            hover:border-cyan-500 hover:bg-cyan-50 transition-all text-gray-600
            hover:text-cyan-700 flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter une ligne
                </button>

                {errors && <p className="text-xs text-red-600 mt-1">{errors}</p>}
            </div>
        );
    };

    // Render appropriate field type
    switch (field.type) {
        case 'text':
            return renderTextInput();
        case 'number':
            return renderNumberInput();
        case 'textarea':
            return renderTextarea();
        case 'list':
            return renderList();
        case 'grid':
            return renderGrid();
        default:
            return (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        Type de champ non supporté: {field.type}
                    </p>
                </div>
            );
    }
};

export default ReportFieldRenderer;