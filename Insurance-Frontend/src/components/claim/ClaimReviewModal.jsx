import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Field, Select, Textarea } from "../ui/FormControls";
import { reviewClaimApi } from "../../api/claimApi";
import { getErrorMessage } from "../../utils/format";

export default function ClaimReviewModal({ open, onClose, claim, onSuccess }) {
  const [form, setForm] = useState({ recommendedStatus: "RECOMMENDED_FOR_APPROVAL", remarks: "" });
  const [saving, setSaving] = useState(false);

  if (!claim) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await reviewClaimApi(claim.claimId, form);
      toast.success("Claim review submitted.");
      onSuccess?.();
      onClose();
      setForm({ recommendedStatus: "RECOMMENDED_FOR_APPROVAL", remarks: "" });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to submit review."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Review ${claim.claimNumber}`} subtitle="Recommend an outcome for the admin's final decision.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Recommendation" required>
          <Select value={form.recommendedStatus} onChange={(e) => setForm({ ...form, recommendedStatus: e.target.value })}>
            <option value="RECOMMENDED_FOR_APPROVAL">Recommend for approval</option>
            <option value="RECOMMENDED_FOR_REJECTION">Recommend for rejection</option>
          </Select>
        </Field>

        <Field label="Remarks" required hint="Explain your reasoning — this is visible to the admin.">
          <Textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} required placeholder="e.g. Documents verified, damages consistent with the incident report." />
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Submit review</Button>
        </div>
      </form>
    </Modal>
  );
}
