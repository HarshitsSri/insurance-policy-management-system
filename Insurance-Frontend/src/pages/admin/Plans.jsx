import { useEffect, useState } from "react";
import { Plus, ClipboardList, Pencil, Power } from "lucide-react";
import { toast } from "react-toastify";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/ui/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  Field,
  Input,
  Select,
  Textarea,
} from "../../components/ui/FormControls";
import ExportPdfButton from "../../components/ui/ExportPdfButton";

import { usePaginatedFetch } from "../../hooks/usePaginatedFetch";
import {
  createPlanApi,
  getPlansApi,
  getProductsApi,
  updatePlanApi,
  updatePlanStatusApi,
} from "../../api/productApi";
import { getErrorMessage, formatCurrency } from "../../utils/format";

const PLAN_EXPORT_COLUMNS = [
  { header: "Plan", key: "planName" },
  { header: "Product", accessor: (p) => `${p.productName} (${p.productType})` },
  { header: "Coverage", accessor: (p) => formatCurrency(p.coverageAmount) },
  { header: "Annual premium", accessor: (p) => formatCurrency(p.premiumAmount) },
  {
    header: "Duration",
    accessor: (p) => `${p.duration} ${p.duration === 1 ? "yr" : "yrs"}`,
  },
  { header: "Status", accessor: (p) => (p.active ? "Active" : "Inactive") },
];

const emptyForm = {
  productId: "",
  planName: "",
  coverageAmount: "",
  premiumAmount: "",
  duration: "",
  termsAndConditions: "",
  active: true,
};

export default function AdminPlans() {
  const [page, setPage] = useState(0);
  const [activeFilter, setActiveFilter] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProductsApi({ page: 0, size: 100, active: true })
      .then((res) => setProducts(res.data.content ?? []))
      .catch(() => {});
  }, []);

  const params = {
    page,
    size: 10,
    sortBy: "planId",
    direction: "desc",
    ...(activeFilter !== "" ? { active: activeFilter } : {}),
  };

  const { content, totalElements, totalPages, pageSize, loading, reload } =
    usePaginatedFetch(getPlansApi, params, [page, activeFilter]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (plan, productId) => {
    setEditing(plan);
    setForm({
      productId: productId || "",
      planName: plan.planName,
      coverageAmount: plan.coverageAmount,
      premiumAmount: plan.premiumAmount,
      duration: plan.duration,
      termsAndConditions: plan.termsAndConditions,
      active: plan.active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      productId: Number(form.productId),
      coverageAmount: Number(form.coverageAmount),
      premiumAmount: Number(form.premiumAmount),
      duration: Number(form.duration),
    };

    try {
      if (editing) {
        await updatePlanApi(editing.planId, payload);
        toast.success("Plan updated successfully.");
      } else {
        await createPlanApi(payload);
        toast.success("Plan created successfully.");
      }
      setModalOpen(false);
      reload();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save plan."));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (plan) => {
    try {
      await updatePlanStatusApi(plan.planId, !plan.active);
      toast.success(`Plan marked ${!plan.active ? "active" : "inactive"}.`);
      reload();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update status."));
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Policy plans"
        description="Coverage, premium and tenure combinations customers can purchase."
        action={
          <>
            <ExportPdfButton
              title="Policy plans"
              subtitle="Coverage, premium and tenure combinations customers can purchase."
              columns={PLAN_EXPORT_COLUMNS}
              rows={content}
              hasData={totalElements > 0}
              fetchAllRows={() =>
                getPlansApi({ ...params, page: 0, size: 10000 }).then(
                  (res) => res.data.content ?? [],
                )
              }
              filename="policy-plans"
            />
            <Button
              icon={Plus}
              onClick={openCreate}
              disabled={products.length === 0}
            >
              New plan
            </Button>
          </>
        }
      />

      {products.length === 0 && !loading && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Create an active product first — plans must belong to a product.
        </div>
      )}

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 p-4">
          <Select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(0);
            }}
            className="w-40"
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </div>

        {loading ? (
          <Loader />
        ) : content.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No plans found"
            description="Create a plan to let customers purchase coverage."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Coverage</th>
                  <th className="px-5 py-3">Premium</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {content.map((plan) => {
                  const matchingProduct = products.find(
                    (p) => p.productName === plan.productName,
                  );
                  return (
                    <tr key={plan.planId} className="hover:bg-ink-50/60">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-ink-900">
                          {plan.planName}
                        </p>
                        <p className="text-xs text-ink-400">
                          {plan.productName} · {plan.productType}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-ink-700">
                        {formatCurrency(plan.coverageAmount)}
                      </td>
                      <td className="px-5 py-3.5 text-ink-700">
                        {formatCurrency(plan.premiumAmount)}
                        <span className="ml-1 text-xs text-ink-400">/year</span>
                      </td>
                      <td className="px-5 py-3.5 text-ink-600">
                        {plan.duration} {plan.duration === 1 ? "yr" : "yrs"}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={plan.active} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openEdit(plan, matchingProduct?.productId)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => toggleStatus(plan)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                            title="Toggle status"
                          >
                            <Power size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 pb-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit plan" : "New plan"}
        subtitle="Set coverage, premium and tenure for this plan."
        width="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Product" required>
            <Select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              required
              disabled={!!editing}
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.productName} ({p.productType})
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Plan name" required>
            <Input
              value={form.planName}
              onChange={(e) => setForm({ ...form, planName: e.target.value })}
              placeholder="e.g. Gold Health Cover"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Coverage amount (₹)" required>
              <Input
                type="number"
                min="1"
                value={form.coverageAmount}
                onChange={(e) =>
                  setForm({ ...form, coverageAmount: e.target.value })
                }
                required
              />
            </Field>
            <Field
              label="Annual premium (₹)"
              required
              hint="The yearly premium. Customers choose how to pay it (monthly / half-yearly / annually / one-time) when they purchase."
            >
              <Input
                type="number"
                min="1"
                value={form.premiumAmount}
                onChange={(e) =>
                  setForm({ ...form, premiumAmount: e.target.value })
                }
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Duration (years)" required>
              <Input
                type="number"
                min="1"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                required
              />
            </Field>
          </div>

          <Field label="Terms & conditions" required>
            <Textarea
              value={form.termsAndConditions}
              onChange={(e) =>
                setForm({ ...form, termsAndConditions: e.target.value })
              }
              placeholder="Key terms customers should know before purchasing."
              required
            />
          </Field>

          <label className="flex items-center gap-2.5 rounded-lg border border-ink-100 bg-ink-50/60 px-3.5 py-2.5">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 rounded border-ink-300 text-ink-900 focus:ring-ink-400"
            />
            <span className="text-sm font-medium text-ink-700">
              Active — available for purchase
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? "Save changes" : "Create plan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
