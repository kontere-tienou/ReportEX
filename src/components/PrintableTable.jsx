// components/PrintableTable.jsx
import React, { useRef, useEffect } from 'react';

const PrintableTable = ({ data, columns, title }) => {
    const tableRef = useRef();

    useEffect(() => {
        // Ajouter des en-têtes de tableau répétés sur chaque page
        const thead = tableRef.current?.querySelector('thead');
        if (thead) {
            thead.style.display = 'table-header-group';
        }
    }, []);

    return (
        <div className="table-container keep-together">
            {title && <h3 className="section-title">{title}</h3>}
            <table ref={tableRef} className="printable-table">
                <thead>
                <tr>
                    {columns.map((col, idx) => (
                        <th key={idx}>{col.label}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                        {columns.map((col, colIdx) => (
                            <td key={colIdx}>{row[col.key]}</td>
                        ))}
                    </tr>
                ))}
                </tbody>
                <tfoot>
                <tr>
                    <td colSpan={columns.length} className="table-footer">
                        Total: {data.length} lignes
                    </td>
                </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default PrintableTable;