# Contributing to PeoplePay360 🤝

Thank you for your interest in contributing to **PeoplePay360**! As an enterprise-grade HR & Payroll operations platform handling critical financial calculations and statutory compliance, we hold our codebase to rigorous engineering, testing, and security standards.

---

## 📋 Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Guiding Principles](#guiding-principles)
3. [Development Environment Setup](#development-environment-setup)
4. [Branching & Workflow](#branching--workflow)
5. [Coding & Architecture Standards](#coding--architecture-standards)
6. [Testing Standards](#testing-standards)
7. [Commit Message Conventions](#commit-message-conventions)
8. [Submitting a Pull Request](#submitting-a-pull-request)

---

## 📜 Code of Conduct
We are committed to providing a welcoming, inclusive, and harassment-free environment for all contributors. We expect all participants to adhere to professional engineering conduct, constructive code reviews, and mutual respect.

---

## 💡 Guiding Principles
1. **Zero Mock Data Policy**: All features, analytics, and operational workflows must be backed by real database models and live API endpoints. Hardcoded mocks or artificial timeouts are strictly forbidden in production paths.
2. **Mathematical Correctness**: Salary rules and computation DAGs (Directed Acyclic Graphs) must be evaluated without `eval()` or dangerous runtime string evaluation. Safe AST parsing and cycle detection are mandatory.
3. **Atomic Operations**: All financial operations—including payrun validation, wage disbursements, and leave quota deductions—must execute within ACID transactions.
4. **Defense in Depth**: Role-Based Access Control (RBAC) must be enforced at both the API gateway / middleware layer and repository queries, never solely in frontend client state.

---

## 💻 Development Environment Setup

### Prerequisites
- **Node.js** >= 18.18.0 (LTS recommended)
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0
- **Redis** >= 6.2 (optional, used for caching and queue locks)

### Quick Bootstrap
```bash
# 1. Clone repository
git clone https://github.com/naveencmy/PeoplePay360.git
cd PeoplePay360

# 2. Setup backend
cd backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev

# 3. Setup frontend (in a separate terminal)
cd ../frontend
npm install
npm run dev
```

---

## 🌿 Branching & Workflow
We follow the **Trunk-Based Development** model with short-lived feature branches:
* `main`: Production-ready, passing all CI unit & integration checks.
* `feature/<feature-name>`: Dedicated feature development (e.g., `feature/tax-slab-optimizer`).
* `fix/<bug-name>`: Bug fixes and patching (e.g., `fix/attendance-rounding-error`).
* `refactor/<scope>`: Code restructuring with zero behavior modification.

---

## 🏛️ Coding & Architecture Standards

### Backend (Node.js & Express)
* **Layered Separation**: Adhere strictly to:
  $$\text{Route} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Repository} \longrightarrow \text{PostgreSQL}$$
* **No Raw Concatenation in SQL**: Always use parameterized queries (`$1, $2, ...`) to prevent SQL injection vulnerabilities.
* **UUID v7**: Use time-ordered UUIDs (`uuidv7`) for primary keys to optimize B-Tree index locality.
* **Error Handling**: Use the centralized `AppError` class with appropriate HTTP status codes and structured logging.

### Frontend (React 19, Tailwind CSS, Zustand)
* **Design Consistency**: Utilize pre-defined design tokens in `tailwind.config.js` and standard CSS variables for dark/light mode compatibility.
* **State Management**: Keep server state in `@tanstack/react-query` and client authentication/theme state in `zustand`.
* **Accessibility (a11y)**: All interactive elements, inputs, and modals must have proper semantic tags, `aria-label`, and keyboard focus handlers.

---

## 🧪 Testing Standards
Before opening a pull request, ensure all test suites pass without warnings:

```bash
# In backend/
npm test

# In frontend/
npm run build
```

Every new business feature must be accompanied by unit or integration tests verifying:
* Happy path execution.
* Edge cases (e.g., leap years, zero-wage contracts, circular rule dependencies).
* Unauthorized access rejection (RBAC assertions).

---

## 📝 Commit Message Conventions
We enforce the **Conventional Commits** specification:

```text
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Types
* `feat`: A new user-facing feature.
* `fix`: A bug fix.
* `docs`: Documentation updates only.
* `refactor`: Code change that neither fixes a bug nor adds a feature.
* `test`: Adding missing tests or correcting existing tests.
* `perf`: Performance optimizations.
* `chore`: Maintenance tasks, dependency bumps, or tool configurations.

### Examples
* `feat(payroll): add bulk payslip email dispatch worker`
* `fix(attendance): prevent overlapping check-in sessions for single employee`
* `refactor(salary-engine): optimize topological sort on large rule DAGs`

---

## 🚀 Submitting a Pull Request
1. Fork the repo and create your branch from `main`.
2. Ensure your code passes all lint and build checks.
3. Provide a clear description in your Pull Request:
   * **Problem**: What issue does this address?
   * **Solution**: How was it resolved?
   * **Verification**: Steps taken to test (include screenshots/GIFs for UI changes).
4. Tag reviewers and link relevant GitHub issues (`Closes #123`).

Thank you for building the future of workforce intelligence with **PeoplePay360**!
