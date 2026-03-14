# 📋 Task Management System

A multi-tenant, role-based Task Management System API built with Node.js, Express v5, and MongoDB. Supports Stripe-powered subscription plans, OTP-based 2FA, real-time WebSocket notifications, email alerts, and a 7-stage task lifecycle.

## ✨ Key Features

- **Three-Role System** — `superAdmin` (platform owner), `admin` (company owner), `user` (team member)
- **Stripe-Gated Registration** — Admin registers with company name & plan → admin + company both created (inactive) in an atomic MongoDB transaction → Stripe Checkout URL returned → on successful payment, webhook activates both company & admin in DB
- **OTP Two-Factor Auth** — Login sends 6-digit OTP to email → verify OTP → receive JWT cookies (access: 15min, refresh: 7 days)
- **Subscription Plans** — Each company tied to a plan with limits on users & projects; daily cron auto-expires subscriptions; `checkSubscription` middleware blocks all actions when expired
- **Real-Time WebSocket Notifications** — Socket.IO pushes instant events when tasks are assigned, task status changes, or users are assigned to projects
- **Email Notifications** — Nodemailer alerts for OTP, task assignments, project assignments, status changes, and welcome emails
- **Multi-Tenant Isolation** — All data scoped to company; admin can only manage own company's resources
- **7-Stage Task Lifecycle** — `to-do` → `in-progress` → `done` → `testing` → `qa-verified` → `re-open` → `deployment`
- **Smart Task IDs** — Auto-generated from project name initials (e.g., `PM-1`, `PM-2` for "Project Management")
- **Task Comments & Audit Trail** — Users and admins can comment on tasks; all status changes auto-logged in TaskHistory with old/new values
- **Dual Dashboards** — Admin sees company stats (users, projects, tasks + per-status breakdown); SuperAdmin sees platform-wide stats (total/active/expired companies, total users)
- **Pagination & Filtering** — Paginated + sorted lists with filters for status, priority, and assignee
- **Validation & Error Handling** — Joi request schemas, custom `ApiError`/`ApiResponse`, centralized error handler, async error wrapping

## 🛠️ Tech Stack

Node.js (ES Modules) · Express v5 · MongoDB (Mongoose v9) · JWT · bcryptjs · Stripe · Socket.IO v4 · Nodemailer (Gmail) · Joi · node-cron · cookie-parser · Nodemon

## 📂 Project Structure

```
src/
├── controllers/     # Route handlers — auth, company, dashboard, plan, project, task, user, webhook
├── services/        # Business logic layer (7 service modules)
├── models/          # Mongoose schemas — User, Company, Plan, Project, Task, TaskComment, TaskHistory
├── routes/          # API route definitions (8 route files)
├── middlewares/     # verifyJWT, restrictTo(roles), validate(schema), checkSubscription, errorHandler
├── validations/     # Joi schemas — user, company, plan, pagination
├── utils/           # ApiError, ApiResponse, asyncHandler, OTP, tokens, pagination, email, socket, stripe, taskAccess
├── cron/            # Daily plan expiry checker (runs at midnight)
└── db/              # MongoDB connection
```

## 🚀 Setup

```bash
git clone https://github.com/Shreya-Wani/Task-Management-System.git
cd Task-Management-System
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_PUBLISHABLE_KEY=your_stripe_pub_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

```bash
npm start       # with nodemon
npm run dev     # without nodemon
```

## 📡 API Endpoints

### Auth — `/api/v1/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Admin registers with name, email, password, companyName, planId → creates admin (inactive) + company (inactive) → returns Stripe Checkout URL |
| POST | `/login` | Validates credentials → sends 6-digit OTP to email |
| POST | `/verify-login-otp` | Verifies OTP → sets JWT cookies (access + refresh) |
| POST | `/refresh-token` | Issues new access token from refresh token cookie |
| POST | `/logout` | Clears JWT cookies + removes refresh token from DB |

### Users — `/api/v1/users`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/super-admin` | Public | One-time registration of the platform super admin |
| POST | `/` | Admin | Create user in admin's company (plan user-limit enforced) + sends welcome email |
| GET | `/` | Admin | List users of admin's company (paginated, sorted) |
| GET | `/:id` | Admin | Get user by ID (company-scoped access) |
| PATCH | `/:id` | Admin, User | Update user — users can only update their own profile |
| DELETE | `/:id` | Admin | Soft delete user (company-scoped) |

### Companies — `/api/v1/companies`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|

| GET | `/me` | Admin | Get own company details |
| GET | `/` | SuperAdmin | List all companies (paginated) |
| GET | `/:id` | SuperAdmin | Get company by ID |
| PATCH | `/:id` | Admin | Update own company |
| DELETE | `/:id` | SuperAdmin, Admin | Soft delete company |

### Plans — `/api/v1/plans`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | SuperAdmin | Create subscription plan (name, price, duration, maxUsers, maxProjects) |
| GET | `/` | Public | List all active plans |
| PATCH | `/:planId` | SuperAdmin | Update plan |
| PATCH | `/:planId/disable` | SuperAdmin | Disable a plan (soft delete) |

### Projects — `/api/v1/projects`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Admin | Create project (plan project-limit enforced) |
| POST | `/:projectId/assign-user` | Admin | Assign user to project → email + WebSocket notification sent |
| GET | `/my-projects` | Admin, User | Admin sees all company projects; user sees only assigned projects (paginated) |
| PATCH | `/:id` | Admin | Update project details |
| DELETE | `/:id` | Admin | Soft delete project |

### Tasks — `/api/v1/tasks`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Admin | Create task → assigns to user → email + WebSocket notification + audit log |
| GET | `/` | Admin, User | Admin sees all company tasks; user sees only assigned tasks (filter: status, priority) |
| GET | `/project/:projectId` | Admin | Get all tasks for a project (filter: status, priority, assignee) |
| PATCH | `/:taskId/status` | Admin, User | Update task status → email + WebSocket notification + audit log (old → new status) |
| PATCH | `/:taskId` | Admin | Update task details (title, description, priority, assignedTo, reportTo) |
| DELETE | `/:taskId` | Admin | Soft delete task |
| POST | `/:taskId/comments` | Admin, User | Add comment on task (user can only comment on assigned tasks) |
| GET | `/:taskId/comments` | Admin, User | Get task comments (paginated) |

### Dashboard — `/api/v1/dashboard`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/admin` | Admin | Company stats — total users, projects, tasks + task count per status |
| GET | `/superadmin` | SuperAdmin | Platform stats — total/active/expired companies (with admin & plan details), total users |

### Webhooks — `/api/webhooks`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/stripe` | Stripe webhook — on `checkout.session.completed`: sets company `isActive: true`, `paymentStatus: "paid"`, calculates `planExpiry` from plan duration, sets admin `status: "active"` |

## 🔌 Socket.IO Events

| Event | Direction | Trigger | Payload |
|-------|-----------|---------|---------|
| `join` | Client → Server | Client connects with userId | `userId` |
| `task_assigned` | Server → Client | Admin creates a task | `{ taskId, title }` |
| `task_status_updated` | Server → Client | Task status changes | `{ taskId, status }` |
| `project_assigned` | Server → Client | Admin assigns user to project | `{ projectId, userId, projectName }` |

## 👥 Role Permissions

| Feature | SuperAdmin | Admin | User |
|---------|:----------:|:-----:|:----:|
| Create & Manage Plans | ✅ | ❌ | ❌ |
| View All Companies | ✅ | ❌ | ❌ |
| Platform Dashboard (companies, users) | ✅ | ❌ | ❌ |
| Delete Any Company | ✅ | ✅ (own) | ❌ |
| Create Users in Company | ❌ | ✅ | ❌ |
| Create Projects & Tasks | ❌ | ✅ | ❌ |
| Assign Users to Projects/Tasks | ❌ | ✅ | ❌ |
| Company Dashboard (stats) | ❌ | ✅ | ❌ |
| Update Task Status | ❌ | ✅ | ✅ (assigned only) |
| Comment on Tasks | ❌ | ✅ | ✅ (assigned only) |
| View Projects/Tasks | ❌ | ✅ (all company) | ✅ (assigned only) |
| Update Own Profile | ❌ | ✅ | ✅ |

## 👩‍💻 Author

**Shreya Wani** — [GitHub](https://github.com/Shreya-Wani)

---

> *"Great things are never built alone — let's build together."* 🚀