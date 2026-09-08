import { useRef, useState } from "react";
import { UploadCloud, FileCheck2, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Field, Select } from "../ui/FormControls";
import { uploadClaimDocumentApi } from "../../api/claimApi";
import { getErrorMessage } from "../../utils/format";

const DOC_TYPES = ["BILL", "REPORT", "FIR", "ID_PROOF", "PHOTO", "OTHER"];

export default function ClaimDocumentUploader({ documents, onChange }) {
  const fileRef = useRef(null);
  const [docType, setDocType] = useState("BILL");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const res = await uploadClaimDocumentApi(file, file.name, docType);
      const uploaded = res.data;

      onChange([
        ...documents,
        {
          documentName: uploaded.documentName,
          documentType: uploaded.documentType,
          documentUrl: uploaded.documentUrl,
          publicId: uploaded.publicId,
        },
      ]);
      toast.success("Document uploaded.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to upload document."));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeDoc = (idx) => {
    onChange(documents.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <Field label="Document type" hint="Choose the type, then upload a file.">
        <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
          {DOC_TYPES.map((t) => (
            <option key={t} value={t}>{t.replace("_", " ")}</option>
          ))}
        </Select>
      </Field>

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/60 px-4 py-6 text-sm font-medium text-ink-500 transition hover:border-ink-300 hover:bg-ink-50">
        {uploading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Uploading…
          </>
        ) : (
          <>
            <UploadCloud size={16} /> Click to upload a supporting document
          </>
        )}
        <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
      </label>

      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-lg border border-ink-100 px-3 py-2">
              <FileCheck2 size={16} className="shrink-0 text-emerald-500" />
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-ink-800">{doc.documentName}</p>
                <p className="text-xs text-ink-400">{doc.documentType}</p>
              </div>
              <button type="button" onClick={() => removeDoc(idx)} className="text-ink-300 hover:text-rose-500">
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
