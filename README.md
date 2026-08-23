# VetMonk AI 🐾
### Smarter Veterinary Care. Healthier Pets.

VetMonk AI is a comprehensive, production-grade veterinary healthcare and clinic management platform built as a clean, high-performance monolith. It integrates clinical veterinary workflows, patient appointments, front-desk live queue management, electronic prescriptions, pharmacy inventory, and automated PDF/image OCR diagnostics—powered by safe, grounded RAG AI assistance.

---

## 🌟 Key Architecture & Capabilities

### 1. Robust Role-Based Access Control (RBAC) & IDOR Protection
- **5 Distinct Roles Supported**:
  - `SUPER_ADMIN`: Master platform metrics, clinic management, user directory, live security audit stream.
  - `CLINIC_ADMIN`: Hospital pharmacy inventory, stock thresholds, staff onboarding, career vacancies.
  - `VETERINARIAN`: Live waiting room tokens, SOAP clinical examination notes, formulary prescriptions, vaccination creation.
  - `RECEPTIONIST`: Front desk check-in, token generation, live waiting display board, triage queries.
  - `PET_OWNER`: Multi-pet health profiles, appointment booking, vaccination reminders, AI wellness chat.
- **Security Invariants**:
  - Public registration strictly creates `PET_OWNER` accounts; client-passed elevated roles are neutralized.
  - BCrypt password hashing for all user credentials.
  - Token-based JWT authentication with safe claims (user ID, email, role) — no credentials or medical data exposed in tokens.
  - Backend service-layer IDOR verification ensuring pet owners can only access records and pets they own.
  - Audit logging for critical events, logins, and mutations with remote IP tracking.

### 2. Multi-tier AI Safety & Grounded RAG Knowledge Engine
- **Clinical Triage Guardrails**:
  - Automatically assesses incoming symptoms for emergency red flags (e.g. difficulty breathing, toxic ingestion like chocolate or rodenticides, prolonged seizures).
  - Flags emergencies as `HIGH` triage with immediate emergency veterinary referral banners before standard generation.
  - Neutralizes prompt injection attempts before query processing.
- **Database-Backed Keyword RAG Retrieval**:
  - Knowledge chunks indexed in database across core categories (Vaccination Schedules, Nutrition, Preventive Care, Emergency Protocols).
  - Grounded term & keyword retrieval citing verified veterinary sources (e.g., WSAVA, AAHA, VECCS).
- **Graceful Fallback**:
  - Integrates with Gemini / OpenAI when API keys are provided; uses an intelligent, grounded veterinary domain expert engine when keys are omitted.

### 3. Voice & Multilingual Regional Support
- **Web Speech API**:
  - Speech-to-Text (STT) voice recording with animated pulse indicator.
  - Text-to-Speech (TTS) voice synthesis for reading AI clinical answers aloud.
  - Standard text input fallback for unsupported environments.
- **6 Supported Regional Languages**:
  - English (`en`), Tamil (`ta`), Hindi (`hi`), Telugu (`te`), Malayalam (`ml`), Kannada (`kn`).

### 4. Clinic Workflows & Pharmacy Inventory
- **Real-Time Patient Queue**:
  - Check-in generates sequential token numbers.
  - Live status tracking (`WAITING` ➔ `WITH_VET` ➔ `COMPLETED`).
- **Electronic Medical Records & Prescriptions**:
  - Author SOAP observations, vital signs (weight, temperature), and structured prescriptions linked to clinic formulary.
  - Automatically tracks vaccination booster due dates and warns on overdue immunizations.
- **Inventory Control**:
  - Pharmacy batch tracking, unit costs, and expiration dates.
  - Automatic low stock and 30-day expiration warnings.
  - Enforced business rules preventing negative stock adjustments.
- **Document & PDF Processing**:
  - Apache PDFBox native stream extraction for digital lab reports and clinical summaries.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 21 LTS, Spring Boot 3.2.3, Spring Security 6, Spring Data JPA, JJWT 0.12.5, Apache PDFBox 3.0.1, Springdoc OpenAPI (Swagger UI), JUnit 5, Mockito |
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Lucide React, Recharts, React Router DOM 6, Axios |
| **Database** | Embedded H2 (MySQL Mode) for development/testing; MySQL 8.x / PostgreSQL for production via `DB_URL` |
| **DevOps** | Docker, Docker Compose, Multi-stage Dockerfiles, Nginx Alpine |

---

## 🚀 Environment Configuration & Deployment

### Production Database Setup
Configure environment variables to connect to any hosted MySQL or compatible database:

```env
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:mysql://YOUR_DATABASE_HOST:3306/vetmonkdb?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_DRIVER=com.mysql.cj.jdbc.Driver
DB_USERNAME=YOUR_DB_USERNAME
DB_PASSWORD=YOUR_DB_PASSWORD
JWT_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_SECRET_AT_LEAST_64_CHARACTERS_FOR_HMAC_SHA
SEED_DEMO_DATA=false
```

### Local Development Launch (Zero-Dependency)

#### Step 1: Run Backend (Port 8080)
```bash
cd backend
mvn spring-boot:run
```

#### Step 2: Run Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

### Docker Compose Launch
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Health Endpoint: `http://localhost:8080/api/health`

---

## 🔑 Development & Testing Demo Logins
> [!NOTE]
> The credentials below are **strictly for local development and test sandbox evaluation**. In production environments, set `SEED_DEMO_DATA=false`.

| Role | Development Demo Email | Local Test Password |
|---|---|---|
| **Super Admin** | `superadmin@vetmonk.ai` | `Admin@12345` |
| **Clinic Admin** | `clinicadmin@vetmonk.ai` | `Admin@12345` |
| **Veterinarian** | `vet.sarah@vetmonk.ai` | `Vet@12345` |
| **Receptionist** | `reception@vetmonk.ai` | `Staff@12345` |
| **Pet Owner** | `owner.alex@vetmonk.ai` | `Owner@12345` |

---

## 🧪 Automated Testing

To execute the backend unit and integration test suite:
```bash
cd backend
mvn clean test
```
**Test Coverage**:
- `AuthServiceTest`: User registration, role enforcement, duplicate prevention, BCrypt validation.
- `JwtTokenProviderTest`: Safe claims parsing, signature tampering rejection, expiration handling.
- `PetServiceTest`: Ownership authorization, IDOR access prevention.
- `AppointmentServiceTest`: Booking logic, double-booking prevention for veterinarians.
- `InventoryServiceTest`: Stock deduction, negative stock prevention, threshold detection.
- `PromptSafetyAndRagTest`: Emergency triage identification, prompt injection sanitization, keyword RAG matching.
- `VetMonkIntegrationTest`: Full MockMvc end-to-end authentication, RBAC forbidden routes, and profile retrieval.

---

## 📜 API Endpoints Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | System and DB connectivity health check | Public |
| `POST` | `/api/auth/register` | Register new pet owner | Public |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT | Public |
| `GET` | `/api/auth/me` | Get current user profile | Authenticated |
| `GET` | `/api/pets` | List user's pets (or all for staff) | Authenticated |
| `POST` | `/api/pets` | Register pet profile | Authenticated |
| `POST` | `/api/appointments` | Book appointment | Authenticated |
| `POST` | `/api/queue/check-in` | Check in arriving patient | Receptionist / Admin |
| `GET` | `/api/queue/live` | Live reception queue feed | Authenticated |
| `POST` | `/api/consultations` | Submit SOAP consultation | Veterinarian |
| `POST` | `/api/ai/chat` | AI Chat Assistant with RAG | Authenticated |
| `POST` | `/api/documents/upload` | Upload diagnostic file & OCR | Authenticated |
| `GET` | `/api/inventory` | Pharmacy stock items | Staff |
| `GET` | `/api/inventory/low-stock`| Low stock medication alerts | Staff |
| `GET` | `/api/audit/recent` | View security audit logs | Super Admin |

---

## 📄 License
MIT License. Built for advanced veterinary healthcare systems.
