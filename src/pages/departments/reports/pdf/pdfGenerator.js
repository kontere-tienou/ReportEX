// pages/departments/reports/pdf/pdfGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { renderPdfLayout } from './pdfLayoutRenderer';

export const generatePdf = async (report, layout, data) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(8, 145, 178); // cyan-600
    doc.text(report.title || 'Rapport', 20, 20);

    // Métadonnées
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // gray-500
    doc.text(`Généré le: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Période: ${report.period_start} - ${report.period_end}`, 20, 35);

    // Ligne de séparation
    doc.setDrawColor(226, 232, 240); // gray-200
    doc.line(20, 40, 190, 40);

    // Contenu du rapport
    let yPos = 50;

    if (layout && layout.length > 0) {
        yPos = await renderPdfLayout(doc, layout, data, yPos);
    }

    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175); // gray-400
        doc.text(
            `Page ${i} sur ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }

    return doc;
};