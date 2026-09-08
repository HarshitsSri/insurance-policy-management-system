import { useEffect, useState } from "react";
import { UserCog, Save } from "lucide-react";
import { toast } from "react-toastify";

import PageHeader from "../../components/ui/PageHeader";
import Card, { CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/common/Loader";
import { Field, Input } from "../../components/ui/FormControls";

import {
  createCustomerProfileApi,
  getOwnCustomerProfileApi,
  updateOwnCustomerProfileApi,
} from "../../api/userApi";
import { getErrorMessage } from "../../utils/format";

const emptyForm = {
  dateOfBirth: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
  nomineeName: "",
  nomineeRelation: "",
};

const NAME_PATTERN = /^[A-Za-z ]{2,100}$/;
const PLACE_PATTERN = /^[A-Za-z ]{2,50}$/;
const PIN_PATTERN = /^[1-9][0-9]{5}$/;

export default function CustomerProfile() {
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [identity, setIdentity] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const today = new Date();

  const maxDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  )
    .toISOString()
    .split("T")[0];
  const minDate = "1900-01-01";
  useEffect(() => {
    getOwnCustomerProfileApi()
      .then((res) => {
        const data = res.data;
        setExists(true);
        setIdentity({
          fullName: data.fullName,
          email: data.email,
          mobileNumber: data.mobileNumber,
        });
        setForm({
          dateOfBirth: data.dateOfBirth || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          pinCode: data.pinCode || "",
          nomineeName: data.nomineeName || "",
          nomineeRelation: data.nomineeRelation || "",
        });
      })
      .catch(() => setExists(false))
      .finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const nextErrors = {};

    if (!form.dateOfBirth) {
      nextErrors.dateOfBirth = "Date of birth is required.";
    } else if (form.dateOfBirth < minDate || form.dateOfBirth > maxDate) {
      nextErrors.dateOfBirth = "You must be at least 18 years old.";
    }

    if (!form.address.trim()) {
      nextErrors.address = "Address is required.";
    } else if (form.address.trim().length < 5) {
      nextErrors.address = "Address must be at least 5 characters.";
    } else if (form.address.trim().length > 200) {
      nextErrors.address = "Address must not exceed 200 characters.";
    }

    if (!form.city.trim()) {
      nextErrors.city = "City is required.";
    } else if (!PLACE_PATTERN.test(form.city.trim())) {
      nextErrors.city = "City must contain only letters and spaces.";
    }

    if (!form.state.trim()) {
      nextErrors.state = "State is required.";
    } else if (!PLACE_PATTERN.test(form.state.trim())) {
      nextErrors.state = "State must contain only letters and spaces.";
    }

    if (!form.pinCode.trim()) {
      nextErrors.pinCode = "PIN code is required.";
    } else if (!PIN_PATTERN.test(form.pinCode.trim())) {
      nextErrors.pinCode = "Enter a valid 6-digit PIN code.";
    }

    // Nominee name can only be set the first time the profile is created;
    // once the profile exists it's locked, so it never needs re-validating.
    if (!exists) {
      if (!form.nomineeName.trim()) {
        nextErrors.nomineeName = "Nominee name is required.";
      } else if (!NAME_PATTERN.test(form.nomineeName.trim())) {
        nextErrors.nomineeName = "Nominee name must contain only letters and spaces.";
      }
    }

    // Nominee relation, like nominee name, can only be set the first time
    // the profile is created; once the profile exists it's locked.
    if (!exists) {
      if (!form.nomineeRelation.trim()) {
        nextErrors.nomineeRelation = "Nominee relation is required.";
      } else if (!PLACE_PATTERN.test(form.nomineeRelation.trim())) {
        nextErrors.nomineeRelation = "Nominee relation must contain only letters and spaces.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }

    setSaving(true);

    try {
      if (exists) {
        // Nominee name is immutable after creation - always send the
        // original value back regardless of what's currently in state.
        await updateOwnCustomerProfileApi(form);
        toast.success("Profile updated successfully.");
      } else {
        await createCustomerProfileApi(form);
        toast.success("Profile created successfully.");
        setExists(true);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save profile."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullScreen label="Loading your profile" />;

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="My profile"
        description="Keep your address and nominee details up to date — this is required before purchasing a policy."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            icon={UserCog}
            title={exists ? "Update your details" : "Complete your profile"}
            subtitle="Required to purchase a policy"
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Date of birth" required error={errors.dateOfBirth}>
              <Input
                type="date"
                min={minDate}
                max={maxDate}
                value={form.dateOfBirth}
                onChange={(e) =>
                  setForm({ ...form, dateOfBirth: e.target.value })
                }
                error={errors.dateOfBirth}
                required
              />
            </Field>

            <Field label="Address" required error={errors.address}>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="House no., street, locality"
                error={errors.address}
                maxLength={200}
                required
              />
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field label="City" required error={errors.city}>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  error={errors.city}
                  required
                />
              </Field>
              <Field label="State" required error={errors.state}>
                <Input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  error={errors.state}
                  required
                />
              </Field>
              <Field label="PIN code" required error={errors.pinCode}>
                <Input
                  value={form.pinCode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      pinCode: e.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                    })
                  }
                  error={errors.pinCode}
                  inputMode="numeric"
                  maxLength={6}
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Nominee name (can't be changed later)"
                required
                error={errors.nomineeName}
                hint={
                  exists
                    ? "Nominee name is set once and can't be changed later."
                    : undefined
                }
              >
                <Input
                  value={form.nomineeName}
                  onChange={(e) =>
                    setForm({ ...form, nomineeName: e.target.value })
                  }
                  error={errors.nomineeName}
                  disabled={exists}
                  required
                />
              </Field>
              <Field
                label="Nominee relation (can't be changed later)"
                required
                error={errors.nomineeRelation}
                hint={
                  exists
                    ? "Nominee relation is set once and can't be changed later."
                    : undefined
                }
              >
                <Input
                  value={form.nomineeRelation}
                  onChange={(e) =>
                    setForm({ ...form, nomineeRelation: e.target.value })
                  }
                  placeholder="e.g. Spouse, Parent"
                  error={errors.nomineeRelation}
                  disabled={exists}
                  required
                />
              </Field>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" icon={Save} loading={saving}>
                {exists ? "Save changes" : "Create profile"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="h-fit">
          <CardHeader
            icon={UserCog}
            title="Account details"
            subtitle="Managed by the system"
          />
          {identity ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-ink-100 pb-2.5">
                <span className="text-ink-400">Full name</span>
                <span className="font-semibold text-ink-900">
                  {identity.fullName}
                </span>
              </div>
              <div className="flex justify-between border-b border-ink-100 pb-2.5">
                <span className="text-ink-400">Email</span>
                <span className="font-semibold text-ink-900">
                  {identity.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Mobile</span>
                <span className="font-semibold text-ink-900">
                  {identity.mobileNumber}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-400">
              Your account details will appear here once you save your profile.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
