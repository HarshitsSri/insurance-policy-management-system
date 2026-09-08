import { useState } from "react";
import { UserPlus, Users as UsersIcon, Power } from "lucide-react";
import { toast } from "react-toastify";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/ui/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import { Pill } from "../../components/ui/StatusBadge";
import { Field, Input } from "../../components/ui/FormControls";
import ExportPdfButton from "../../components/ui/ExportPdfButton";

import { usePaginatedFetch } from "../../hooks/usePaginatedFetch";
import { createAgentApi, getAllUsersApi, updateUserStatusApi } from "../../api/userApi";
import { getErrorMessage, formatDate } from "../../utils/format";
import { roleLabel } from "../../utils/roleUtils";

const ROLE_TONE = { ADMIN: "indigo", AGENT: "sky", CUSTOMER: "amber" };

const USER_EXPORT_COLUMNS = [
  { header: "Name", key: "fullName" },
  { header: "Email", key: "email" },
  { header: "Mobile", key: "mobileNumber" },
  { header: "Role", accessor: (u) => roleLabel(u.role) },
  { header: "Joined", accessor: (u) => formatDate(u.createdDate) },
  { header: "Status", accessor: (u) => (u.active ? "Active" : "Inactive") },
];

export default function AdminUsers() {
  const [page, setPage] = useState(0);

  const params = { page, size: 10 };
  const { content, totalElements, totalPages, pageSize, loading, reload } = usePaginatedFetch(
    getAllUsersApi,
    params,
    [page]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", mobileNumber: "" });
  const [saving, setSaving] = useState(false);

  const [statusModal, setStatusModal] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await createAgentApi(form);
      toast.success("Insurance officer account created.");
      setModalOpen(false);
      setForm({ fullName: "", email: "", password: "", mobileNumber: "" });
      reload();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create insurance officer."));
    } finally {
      setSaving(false);
    }
  };

  const openStatusModal = (user) => {
    setStatusModal(user);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setStatusSaving(true);

    try {
      await updateUserStatusApi(statusModal.id, { active: !statusModal.active });
      toast.success(`User marked ${!statusModal.active ? "active" : "inactive"}.`);
      setStatusModal(null);
      reload();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update status."));
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Users & Insurance Officers"
        description="Everyone with access to the system — admins, insurance officers and customers."
        action={
          <>
            <ExportPdfButton
              title="Users & Insurance Officers"
              subtitle="Everyone with access to the system — admins, insurance officers and customers."
              columns={USER_EXPORT_COLUMNS}
              rows={content}
              hasData={totalElements > 0}
              fetchAllRows={() =>
                getAllUsersApi({ ...params, page: 0, size: 10000 }).then((res) => res.data.content ?? [])
              }
              filename="users"
            />
            <Button icon={UserPlus} onClick={() => setModalOpen(true)}>
              New insurance officer
            </Button>
          </>
        }
      />

      <Card padded={false} className="overflow-hidden">
        {loading ? (
          <Loader />
        ) : content.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {content.map((u) => (
                  <tr key={u.id} className="hover:bg-ink-50/60">
                    <td className="px-5 py-3.5 font-semibold text-ink-900">{u.fullName}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-ink-600">{u.email}</p>
                      <p className="text-xs text-ink-400">{u.mobileNumber}</p>
                    </td>
                    <td className="px-5 py-3.5"><Pill tone={ROLE_TONE[u.role] || "indigo"}>{roleLabel(u.role)}</Pill></td>
                    <td className="px-5 py-3.5 text-ink-500">{formatDate(u.createdDate)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={u.active} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() => openStatusModal(u)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                            title="Toggle status"
                          >
                            <Power size={15} />
                          </button>
                        )}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New insurance officer" subtitle="Create a login for a new insurance officer.">
        <form onSubmit={handleCreateAgent} className="space-y-4">
          <Field label="Full name" required>
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </Field>
          <Field label="Email address" required>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </Field>
          <Field label="Password" required hint="The insurance officer can change this after first login.">
            <Input type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </Field>
          <Field label="Mobile number" required>
            <Input value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} required />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create insurance officer</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!statusModal}
        onClose={() => setStatusModal(null)}
        title={statusModal ? `${statusModal.active ? "Deactivate" : "Activate"} ${statusModal.fullName}` : ""}
        subtitle={
          statusModal?.active
            ? "This user will lose access to the system immediately."
            : "This user will regain access to the system."
        }
      >
        <form onSubmit={handleStatusUpdate} className="space-y-4">
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setStatusModal(null)}>Cancel</Button>
            <Button type="submit" variant={statusModal?.active ? "danger" : "success"} loading={statusSaving}>
              {statusModal?.active ? "Deactivate user" : "Activate user"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
