import { useState } from "react";
import { FileDown } from "lucide-react";
import { toast } from "react-toastify";

import Button from "./Button";
import { exportTableToPdf } from "../../utils/exportPdf";

/**
 * Drop-in "Export PDF" button for any page that renders a table.
 *
 * By default it exports every row matching the current filters — not just
 * the page currently on screen — by calling `fetchAllRows`, which should
 * hit the same list endpoint with a large page size and return the full
 * array of rows. If `fetchAllRows` isn't provided, it falls back to
 * exporting whatever is passed in `rows` (e.g. the current page).
 *
 * Usage:
 *   <ExportPdfButton
 *     title="My policies"
 *     columns={[
 *       { header: "Policy", key: "policyNumber" },
 *       { header: "Premium", accessor: (row) => formatCurrency(row.premiumAmount) },
 *     ]}
 *     rows={content}
 *     fetchAllRows={() =>
 *       getMyPoliciesApi({ ...params, page: 0, size: 10000 }).then((res) => res.data.content ?? [])
 *     }
 *     hasData={totalElements > 0}
 *     filename="my-policies"
 *   />
 */
export default function ExportPdfButton({
  title,
  subtitle,
  columns,
  rows,
  fetchAllRows,
  hasData,
  filename,
  size = "md",
  variant = "outline",
  className = "",
}) {
  const [exporting, setExporting] = useState(false);

  const noRowsHint = !rows || rows.length === 0;
  const isDisabled = typeof hasData === "boolean" ? !hasData : noRowsHint;

  const handleExport = async () => {
    if (isDisabled || exporting) return;

    setExporting(true);
    try {
      const exportRows = fetchAllRows ? await fetchAllRows() : rows;

      if (!exportRows || exportRows.length === 0) {
        toast.info("There's no data to export yet.");
        return;
      }

      exportTableToPdf({ title, subtitle, columns, rows: exportRows, filename: filename || "export" });
    } catch (error) {
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      icon={FileDown}
      loading={exporting}
      disabled={isDisabled}
      onClick={handleExport}
      className={className}
      title={
        isDisabled
          ? "No data to export"
          : fetchAllRows
          ? "Export every matching row (all pages) as PDF"
          : "Export this table as PDF"
      }
    >
      Export PDF
    </Button>
  );
}
