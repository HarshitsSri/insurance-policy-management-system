import { ShieldHalf, CheckCircle2 } from "lucide-react";

const HIGHLIGHTS = [
  "Issue and manage policies across health, motor, life & travel",
  "Track claims end-to-end with a transparent review trail",
  "Keep premium collections and renewals in one ledger",
];

export default function AuthShell({ children, panelTitle, panelSubtitle }) {
  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* Brand panel */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-ink-950 px-12 py-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(240,169,58,0.18), transparent 45%), radial-gradient(circle at 85% 75%, rgba(107,118,171,0.25), transparent 50%)",
          }}
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-white/5"
        />
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full border border-white/5"
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-ink-950">
            <ShieldHalf size={22} strokeWidth={2.25} />
          </div>
          <span className="font-display text-lg font-bold">Insurance CRM</span>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-3xl font-bold leading-tight">
            {panelTitle || (
              <>
                Policies, claims and<br /> premiums — under one roof.
              </>
            )}
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-300">
            {panelSubtitle ||
              "A single workspace for admins, insurance officers and customers to manage the full policy lifecycle."}
          </p>

          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink-200">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-amber-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-ink-500">
          © {new Date().getFullYear()} Insurance CRM. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
