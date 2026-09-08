import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import { Field, Select, Textarea } from "../ui/FormControls";
import { finalDecisionApi } from "../../api/claimApi";
import { getErrorMessage } from "../../utils/format";

export default function ClaimDecisionModal({ open, onClose, claim, onSuccess }) {
  const [form, setForm] = useState({ finalDecisionStatus: "APPROVED", remarks: "" });
  const [saving, setSaving] = useState(false);

  if (!claim) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await finalDecisionApi(claim.claimId, form);
      toast.success("Final decision recorded.");
      onSuccess?.();
      onClose();
      setForm({ finalDecisionStatus: "APPROVED", remarks: "" });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to record decision."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Final decision · ${claim.claimNumber}`} subtitle="This action finalizes the claim outcome.">
      {claim.agentRemarks && (
        <div className="mb-4 rounded-xl bg-amber-50 p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Insurance officer recommendation</p>
            <StatusBadge status={claim.claimStatus} size="sm" />
          </div>
          <p className="mt-1.5 text-sm text-amber-900">{claim.agentRemarks}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Final decision" required>
          <Select value={form.finalDecisionStatus} onChange={(e) => setForm({ ...form, finalDecisionStatus: e.target.value })}>
            <option value="APPROVED">Approve claim</option>
            <option value="REJECTED">Reject claim</option>
          </Select>
        </Field>

        <Field label="Remarks" required hint="This will be visible to the customer.">
          <Textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} required placeholder="e.g. Approved for the full claimed amount per policy terms." />
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant={form.finalDecisionStatus === "APPROVED" ? "success" : "danger"} loading={saving}>
            {form.finalDecisionStatus === "APPROVED" ? "Approve claim" : "Reject claim"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
