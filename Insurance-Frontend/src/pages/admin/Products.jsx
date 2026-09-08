import { useState } from "react";
import { Plus, PackageSearch, Pencil, Power } from "lucide-react";
import { toast } from "react-toastify";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/ui/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import { Field, Input, Select, Textarea } from "../../components/ui/FormControls";
import ExportPdfButton from "../../components/ui/ExportPdfButton";

import { usePaginatedFetch } from "../../hooks/usePaginatedFetch";
import { createProductApi, getProductsApi, updateProductApi, updateProductStatusApi } from "../../api/productApi";
import { getErrorMessage, formatDate } from "../../utils/format";

const PRODUCT_TYPES = ["HEALTH", "MOTOR", "LIFE", "TRAVEL"];

const PRODUCT_EXPORT_COLUMNS = [
  { header: "Product", key: "productName" },
  { header: "Description", key: "description" },
  { header: "Type", key: "productType" },
  { header: "Created", accessor: (p) => formatDate(p.createdDate) },
  { header: "Status", accessor: (p) => (p.active ? "Active" : "Inactive") },
];

const emptyForm = { productName: "", productType: "HEALTH", description: "", active: true };

export default function AdminProducts() {
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const params = {
    page,
    size: 10,
    sortBy: "createdDate",
    direction: "desc",
    ...(typeFilter ? { productType: typeFilter } : {}),
    ...(activeFilter !== "" ? { active: activeFilter } : {}),
  };

  const { content, totalElements, totalPages, pageSize, loading, reload } = usePaginatedFetch(
    getProductsApi,
    params,
    [page, typeFilter, activeFilter]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      productName: product.productName,
      productType: product.productType,
      description: product.description,
      active: product.active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editing) {
        await updateProductApi(editing.productId, form);
        toast.success("Product updated successfully.");
      } else {
        await createProductApi(form);
        toast.success("Product created successfully.");
      }
      setModalOpen(false);
      reload();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save product."));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (product) => {
    try {
      await updateProductStatusApi(product.productId, !product.active);
      toast.success(`Product marked ${!product.active ? "active" : "inactive"}.`);
      reload();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update status."));
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Insurance products"
        description="The product lines that policy plans are built on — health, motor, life and travel."
        action={
          <>
            <ExportPdfButton
              title="Insurance products"
              subtitle="The product lines that policy plans are built on."
              columns={PRODUCT_EXPORT_COLUMNS}
              rows={content}
              hasData={totalElements > 0}
              fetchAllRows={() =>
                getProductsApi({ ...params, page: 0, size: 10000 }).then((res) => res.data.content ?? [])
              }
              filename="insurance-products"
            />
            <Button icon={Plus} onClick={openCreate}>
              New product
            </Button>
          </>
        }
      />

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 p-4">
          <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }} className="w-44">
            <option value="">All types</option>
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
          <Select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setPage(0); }} className="w-40">
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </div>

        {loading ? (
          <Loader />
        ) : content.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No products found"
            description="Create your first insurance product to start building plans."
            action={<Button size="sm" icon={Plus} onClick={openCreate}>New product</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {content.map((p) => (
                  <tr key={p.productId} className="hover:bg-ink-50/60">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-ink-900">{p.productName}</p>
                      <p className="max-w-xs truncate text-xs text-ink-400">{p.description}</p>
                    </td>
                    <td className="px-5 py-3.5 text-ink-600">{p.productType}</td>
                    <td className="px-5 py-3.5 text-ink-500">{formatDate(p.createdDate)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={p.active} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => toggleStatus(p)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700" title="Toggle status">
                          <Power size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 pb-4">
          <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} />
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit product" : "New product"} subtitle="Define a product line that plans can be created under.">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Product name" required>
            <Input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} placeholder="e.g. Family Health Shield" required />
          </Field>

          <Field label="Product type" required>
            <Select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })}>
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>

          <Field label="Description" required>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Briefly describe what this product covers." required />
          </Field>

          <label className="flex items-center gap-2.5 rounded-lg border border-ink-100 bg-ink-50/60 px-3.5 py-2.5">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 rounded border-ink-300 text-ink-900 focus:ring-ink-400" />
            <span className="text-sm font-medium text-ink-700">Active — visible for plan creation</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? "Save changes" : "Create product"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
