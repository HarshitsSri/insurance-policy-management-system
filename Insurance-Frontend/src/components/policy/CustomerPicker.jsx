import { useEffect, useRef, useState } from "react";
import { Search, User, X, Loader2 } from "lucide-react";
import { Input } from "../ui/FormControls";
import { getCustomersApi } from "../../api/userApi";

// A searchable dropdown for picking a customer by email/mobile instead
// of asking the admin/agent to type a raw numeric customer ID, which they
// have no realistic way of knowing.
export default function CustomerPicker({ value, onChange, error }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close the dropdown when clicking outside it.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search as the admin/agent types.
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      getCustomersApi({ page: 0, size: 8, search: query.trim() })
        .then((res) => setResults(res.data.content ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (customer) => {
    onChange(customer);
    setOpen(false);
    setQuery("");
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      {value ? (
        <div className="flex items-center justify-between rounded-lg border border-ink-200 bg-ink-50/60 px-3.5 py-2.5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-amber-300">
              <User size={14} />
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-semibold text-ink-900">{value.fullName}</p>
              <p className="truncate text-xs text-ink-400">{value.email} · {value.mobileNumber}</p>
            </div>
          </div>
          <button type="button" onClick={handleClear} className="shrink-0 text-ink-400 hover:text-rose-500">
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <Input
            icon={Search}
            placeholder="Search by email or mobile…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            error={error}
          />

          {open && query.trim() && (
            <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-ink-100 bg-white shadow-panel">
              {loading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-4 text-sm text-ink-400">
                  <Loader2 size={14} className="animate-spin" /> Searching…
                </div>
              ) : results.length === 0 ? (
                <p className="px-4 py-4 text-center text-sm text-ink-400">No customers found.</p>
              ) : (
                <ul className="max-h-56 overflow-y-auto scrollbar-thin">
                  {results.map((customer) => (
                    <li key={customer.customerId}>
                      <button
                        type="button"
                        onClick={() => handleSelect(customer)}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition hover:bg-ink-50"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                          <User size={14} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="truncate text-sm font-semibold text-ink-900">{customer.fullName}</p>
                          <p className="truncate text-xs text-ink-400">{customer.email} · {customer.mobileNumber}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
