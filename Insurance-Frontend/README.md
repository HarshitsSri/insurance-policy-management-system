# Insurance CRM — Frontend

React + Vite + Tailwind CSS frontend for the Insurance Policy Management System, wired up against the Spring Boot backend in `Insurance-policy-management-system.zip`.

## Stack

- React 18 + React Router 6
- Tailwind CSS 3 (custom "ink" / "amber" palette, `Outfit` + `Inter` fonts)
- Axios (JWT auth interceptor + 401 auto-logout)
- react-toastify for all success/error notifications
- lucide-react icons

## Getting started

```bash
npm install
npm run dev
```

The app expects the backend running at `http://localhost:8080` (see `src/api/axios.js` — change `baseURL` there if your backend runs elsewhere). The backend has CORS/security configured for the default Spring Boot port, so no extra proxy setup is needed.

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build
```

## Default login

The backend seeds an admin account on first run (`DataInitializer`):

- Email: `admin@insurance.com`
- Password: `Admin@123`

Agents are created by the admin from **Users & Agents → New agent**. Customers self-register via **Create an account**, verify the emailed OTP, then complete their profile (DOB, address, nominee) from **My Profile** before purchasing a plan.

## Structure

```
src/
  api/            One file per backend resource — axios calls only, no UI logic
  components/
    ui/           Design-system primitives (Button, Card, Modal, StatusBadge, etc.)
    layout/       Sidebar, Navbar, DashboardLayout, AuthShell
    policy/       Shared policy table + detail modal (admin/agent/customer)
    claim/        Shared claim table, detail modal, review/decision modals, doc uploader
    payment/      Shared payment table
    common/       Loader, ProtectedRoute, RoleRoute
    forms/        (reserved — kept for structural parity with original scaffold)
  context/        AuthContext (hydrates from localStorage/JWT on load)
  hooks/          useAuth, usePaginatedFetch (shared pagination/loading/error/toast logic)
  layouts/        (reserved — role layouts are unified into DashboardLayout + role-aware Sidebar)
  pages/
    auth/         Login, Register, VerifyOtp
    admin/        Dashboard, Products, Plans, Policies, Claims, Payments, Users
    agent/        Dashboard, Policies, Claims, Payments
    customer/     Dashboard, Plans, Policies, Payments, Claims, Profile
  routes/         AppRoutes.jsx — all routes, role-gated via RoleRoute
  utils/          tokenUtils, roleUtils, format (currency/date helpers + API error parsing)
```

## Notes on backend quirks handled in the frontend

- `GET /api/users` (admin user list) returns Spring's native `Page<T>` shape (`number`/`size`) while every other paginated endpoint returns a custom `PageResponseDto` (`pageNumber`/`pageSize`). `usePaginatedFetch` normalizes both.
- `POST /api/payments` (record payment) is restricted to `CUSTOMER` and `AGENT` — there's intentionally no "record payment" action on the Admin Payments page, only a read-only ledger.
- A customer must create their profile (`POST /api/customers/profile`) before they can purchase a policy; the customer dashboard shows a banner nudging them to do this if it's missing.
- Claims require at least one uploaded document before submission (enforced client-side as a UX nicety to match the backend's expectations).
