import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// jsPDF's built-in fonts (Helvetica/Times/Courier) only support the
// WinAnsi/Latin-1 character set. Characters outside that — like the ₹ Rupee
// sign, curly quotes, or the em/en dash — render as a broken glyph (e.g. a
// stray "¹") instead of failing loudly. Swap the common offenders for a
// plain-ASCII equivalent before anything gets drawn onto the page.
function sanitizeForPdf(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/₹/g, "Rs. ")
    .replace(/[–—]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\u00A0/g, " ")
    .trim();
}

/**
 * Export an array of row objects to a PDF file as a table.
 *
 * @param {Object} options
 * @param {string} options.title - Title printed at the top of the PDF.
 * @param {string} [options.subtitle] - Optional subtitle / description line.
 * @param {Array<{header: string, key?: string, accessor?: (row) => string}>} options.columns
 *        Column definitions. Use `key` for a plain property lookup, or
 *        `accessor` for a computed/formatted value.
 * @param {Array<Object>} options.rows - Data rows to render.
 * @param {string} options.filename - Filename (without extension) for the downloaded file.
 */
export function exportTableToPdf({ title, subtitle, columns, rows, filename }) {
  const doc = new jsPDF({ orientation: columns.length > 5 ? "landscape" : "portrait" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  let cursorY = 18;

  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text(sanitizeForPdf(title), marginX, cursorY);

  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.setTextColor(120);
  const generatedOn = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(sanitizeForPdf(`Generated on ${generatedOn}`), pageWidth - marginX, cursorY, { align: "right" });

  cursorY += 6;

  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(sanitizeForPdf(subtitle), marginX, cursorY);
    cursorY += 6;
  }

  doc.setTextColor(0);

  const head = [columns.map((col) => sanitizeForPdf(col.header))];
  const body = rows.map((row) =>
    columns.map((col) => {
      const value = col.accessor ? col.accessor(row) : row[col.key];
      const text = sanitizeForPdf(value);
      return text === "" ? "-" : text;
    })
  );

  autoTable(doc, {
    head,
    body,
    startY: cursorY + 2,
    margin: { left: marginX, right: marginX },
    styles: { fontSize: 8.5, cellPadding: 3, overflow: "linebreak" },
    headStyles: { fillColor: [23, 23, 23], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 248, 247] },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - marginX,
      doc.internal.pageSize.getHeight() - 8,
      { align: "right" }
    );
  }

  doc.save(`${filename}.pdf`);
}
