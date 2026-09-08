# Insurance Policy Management System

A full-stack insurance CRM for managing products, policy plans, customer policies, claims, and premium payments across three roles: **Admin**, **Agent**, and **Customer**.

- **Backend:** Spring Boot 4 (Java 17) REST API with JWT auth
- **Frontend:** React 18 + Vite + Tailwind CSS

## Features

- **Auth:** JWT-based login, customer self-registration with email/phone OTP verification
- **Roles:** Admin, Agent, Customer — each with a dedicated dashboard and route guarding
- **Products & Plans:** Admin manages insurance products (Health, Motor, Life, Travel) and their policy plans (premium, coverage, term)
- **Policies:** Customers purchase plans (choosing a premium frequency — Monthly, Half-Yearly, Annual, or One-Time); policies move through Pending Payment → Active → Expired/Cancelled
- **Claims:** Customers submit claims with supporting documents; Agents review and recommend approval/rejection; Admin gives the final decision, with full status history tracked
- **Payments:** Premium payment recording and ledger, with UPI/Card/Net Banking/Cash modes
- **File uploads:** Claim documents stored via Cloudinary
- **Notifications:** Email (SMTP) and SMS (Twilio) for OTPs and status updates

## Tech Stack

**Backend**
- Spring Boot 4, Spring Security, Spring Data JPA
- MySQL
- JWT (jjwt), ModelMapper, Lombok
- Cloudinary (file storage), Twilio (SMS), Spring Mail (email OTP)
- Maven, Java 17

**Frontend**
- React 18, React Router 6
- Tailwind CSS 3 (custom "ink"/"amber" theme, Outfit + Inter fonts)
- Axios (JWT interceptor with 401 auto-logout)
- Recharts (dashboards), react-toastify (notifications), lucide-react (icons)
- Vite

## Project Structure

```
backend/    Spring Boot REST API
frontend/   React + Vite client
```

### Backend (`backend/`)

```
src/main/java/com/monocept/demo/
  config/       App, security & CORS configuration
  controller/   REST controllers (Auth, Product, PolicyPlan, Policy, Claim, ClaimDocument,
                ClaimStatusHistory, PremiumPayment, Customer, User)
  dto/          Request/response DTOs
  entity/       JPA entities
  enums/        Role, ProductType, PolicyStatus, ClaimStatus, PaymentStatus, PaymentMode,
                PremiumType, PremiumFrequency, OtpChannel
  exception/    Global exception handling
  repository/   Spring Data JPA repositories
  security/     JWT filter, auth provider, user details
  service/      Business logic
  util/         Helpers (e.g. premium calculation)
```

### Frontend (`frontend/`)

```
src/
  api/          One file per backend resource — axios calls only
  components/   ui/, layout/, policy/, claim/, payment/, common/
  context/      AuthContext (hydrates from JWT/localStorage)
  hooks/        useAuth, usePaginatedFetch
  pages/        auth/, admin/, agent/, customer/
  routes/       AppRoutes.jsx — role-gated routing
  utils/        tokenUtils, roleUtils, format helpers
```

## Getting Started

### Prerequisites

- Java 17+, Maven
- Node.js 18+ and npm
- MySQL

### Backend setup

1. Create a MySQL database (e.g. `insurance_db`).
2. Configure `backend/src/main/resources/application.properties` with your database credentials, JWT secret, and (optionally) Cloudinary, Twilio, and SMTP credentials for file uploads / OTP delivery.
3. Run the API:

   ```bash
   cd backend
   mvn spring-boot:run
   ```

   The API starts on `http://localhost:8080`. An admin account is seeded on first run via `DataInitializer`.

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173` and expects the backend at `http://localhost:8080` (change `baseURL` in `src/api/axios.js` if needed).

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build
```

### Default login

- Email: `admin@insurance.com`
- Password: `Admin@123`

Agents are created by the admin from **Users & Agents → New agent**. Customers self-register, verify the emailed OTP, then complete their profile before purchasing a plan.

## Notes

- `GET /api/users` returns Spring's native `Page<T>` shape while other paginated endpoints return a custom `PageResponseDto`; the frontend's `usePaginatedFetch` normalizes both.
- Recording a payment (`POST /api/payments`) is restricted to `CUSTOMER` and `AGENT`; Admin only sees a read-only payment ledger.
- A customer must complete their profile before purchasing a policy.
- Claims require at least one uploaded document before submission.

## License

Add a license of your choice (e.g. MIT) here.
