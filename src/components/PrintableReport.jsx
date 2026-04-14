// components/PrintableReport.jsx
import React, { useRef, useEffect } from 'react';

const PrintableReport = ({ report, children }) => {
    const contentRef = useRef();

    // Analyser et ajouter des sauts de page intelligents
    useEffect(() => {
        if (contentRef.current) {
            addSmartPageBreaks(contentRef.current);
        }
    }, [report]);

    const addSmartPageBreaks = (container) => {
        // Sélectionner les sections importantes
        const sections = container.querySelectorAll(`
      .report-header, 
      .data-section, 
      .table-container, 
      .chart-container,
      .signature-section,
      .section-title
    `);

        let accumulatedHeight = 0;
        const pageHeight = 297; // mm
        const currentPageHeight = pageHeight - 50; // Marge de sécurité

        sections.forEach((section) => {
            const sectionHeight = section.offsetHeight / 3.78; // Convertir px en mm environ

            if (accumulatedHeight + sectionHeight > currentPageHeight) {
                // Ajouter un saut de page avant cette section
                section.classList.add('page-break-before');
                accumulatedHeight = sectionHeight;
            } else {
                accumulatedHeight += sectionHeight;
            }
        });
    };

    return (
        <div ref={contentRef} className="print-container">
            {/* En-tête du rapport */}
            <div className="report-header keep-together">
                <div className="header-content">
                    <img src={report.logo} alt="Logo" className="print-logo" />
                    <h1>{report.title}</h1>
                    <p className="report-date">Date: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Informations générales */}
            <div className="report-info keep-together">
                <table className="info-table">
                    <tbody>
                    <tr>
                        <td><strong>Département:</strong></td>
                        <td>{report.department}</td>
                        <td><strong>Auteur:</strong></td>
                        <td>{report.author}</td>
                    </tr>
                    <tr>
                        <td><strong>Période:</strong></td>
                        <td colSpan="3">{report.period}</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            {/* Contenu principal */}
            <div className="report-content">
                {children}
            </div>

            {/* Signatures */}
            <div className="signature-section keep-together">
                <div className="signature-line">
                    <div className="signature">
                        <hr />
                        <p>Établi par: {report.author}</p>
                        <p className="date">Le: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="signature">
                        <hr />
                        <p>Approuvé par: ___________________</p>
                        <p className="date">Le: _______________</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintableReport;