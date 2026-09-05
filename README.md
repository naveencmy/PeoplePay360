# PeoplePay360 🚀

> **Production-grade Payroll Management & Salary Computation Engine**

PeoplePay360 is an enterprise-class payroll processing backend built with high performance, mathematical safety, and strict compliance in mind. It powers salary structure modeling, attendance-based salary pro-ration, DAG-based rule dependencies, automated payrun state machines, and high-fidelity PDF payslip generation.

---

## 🏛 Architecture & Engineering Design

- **Modular Monolith**: Clean layer separation (API Routes → Controllers → Services → Repositories → Config).
- **No ORM**: Raw, optimized SQL queries using the Repository Pattern with connection pooling (`pg`).
- **UUID v7**: Time-ordered, collision-resistant primary keys for security and index clustering.
- **PostgreSQL Full-Text Search**: Native `tsvector` and `plainto_tsquery` indexing without extra infrastructure overhead.
- **Safe Computation Engine**: Zero `eval()` / `Function()` usage; AST-based mathematical parsing powered by `mathjs` with dependency cycle detection via Kahn's Topological Sorting algorithm.
- **Payrun State Machine**: Strict, idempotent transitions (`DRAFT` → `COMPUTED` → `VALIDATED` → `PAID` / `ARCHIVED`).
- **Audit Logging**: Immutable trails recorded for every entity mutation and state change.
- **High-Fidelity Payslips**: Server-side vector PDF generation via `PDFKit`.
- **Background Task Pipeline**: Asynchronous, retryable queue processing with Bull and Redis.

---

## 📂 Project Structure

```
PeoplePay360/
├── backend/
│   ├── src/
│   │   ├── api/routes/          # API route definitions
│   │   ├── config/              # Database, Redis, JWT, environment & Queue config
│   │   ├── controllers/         # Request handling & HTTP response mapping
│   │   ├── jobs/                # Asynchronous queue workers (Email, PDF, Cache)
│   │   ├── middleware/          # Auth, RBAC, Validation (Zod), Error & Audit
│   │   ├── models/              # Zod schemas & type contracts
│   │   ├── repositories/        # Raw SQL repositories extending BaseRepository
│   │   ├── services/            # Core business logic & Computation engine
│   │   ├── utils/               # Currency, Date, Math, and formatting utilities
│   │   └── app.js               # Express application initialization
│   ├── tests/
│   │   ├── setup.js             # Test environment bootstrap
│   │   └── unit/                # Unit test suites (Computation & Payrun)
│   ├── .env.example             # Configuration template
│   └── package.json
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 6.0

### 2. Installation
```bash
cd backend
npm install
```

### 3. Configure Environment
Copy `.env.example` to `.env` and fill in your connection details:
```bash
cp .env.example .env
```

### 4. Running the Application
```bash
# Start development server
npm run dev

# Start production server
npm start
```

### 5. Running Tests
```bash
npm test
```
All 60 test cases covering safe formula parsing, DAG topological sorting, pro-rating, payrun state transitions, and currency/date utilities will execute and validate.

---

## 🛡 Security & Compliance

- **No eval()**: Strict abstract syntax tree parsing ensures mathematical formula evaluation cannot execute malicious code.
- **Input Validation**: All request bodies, query params, and route parameters are validated against strict Zod schemas.
- **Audit Trails**: Complete historical provenance of salary changes, employee status updates, and payrun transitions.
- **Rate Limiting & Headers**: Configured with Helmet security headers and IP rate limiting.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](file:///e:/test_rat/peoplepay360/LICENSE) file for details.
