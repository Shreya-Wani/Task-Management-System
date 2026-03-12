# 📋 Task Management System

A multi-tenant, role-based Task Management System API with Stripe payments, OTP-based 2FA, real-time Socket.IO notifications, and a 7-stage task lifecycle.

## ✨ Key Features

- **Role-Based Access** — `superAdmin`, `admin`, `user` with scoped permissions
- **OTP Two-Factor Auth** — Email OTP on login + JWT access/refresh tokens (HTTP-only cookies)
- **Stripe Payments** — Admin registers with plan → Stripe checkout → webhook auto-activates company & admin
- **Real-Time Notifications** — Socket.IO events for task assignment, status updates, and project assignment
- **Email Alerts** — Nodemailer notifications for OTP, task/project assignments, and status changes
- **Subscription Plans** — Limits on users, projects, tasks with daily expiry cron job
- **Multi-Tenant** — Company-scoped data isolation with soft deletes
- **Task Lifecycle** — `to-do` → `in-progress` → `done` → `testing` → `qa-verified` → `re-open` → `deployment`
- **Task Comments & Audit Trail** — Comments + auto-tracked history (creation, status changes)
- **Admin Dashboard** — Aggregated stats: total users, projects, tasks, and status breakdown
- **Pagination & Filtering** — Paginated lists with sort, filter by status/priority/assignee
- **Validation** — Joi schemas, custom ApiError/ApiResponse, async error wrapping

## 🛠️ Tech Stack

Node.js · Express v5 · MongoDB (Mongoose v9) · JWT · bcryptjs · Stripe · Socket.IO · Nodemailer · Joi · node-cron · cookie-parser · Nodemon

## 📂 Project Structure

```
src/
├── controllers/     # Route handlers — auth, company, dashboard, plan, project, task, user, webhook
├── services/        # Business logic layer (7 service modules)
├── models/          # Mongoose schemas — User, Company, Plan, Project, Task, TaskComment, TaskHistory
├── routes/          # API route definitions (8 route files)
├── middlewares/     # verifyJWT, restrictTo(roles), validate(schema), errorHandler
├── validations/     # Joi schemas — user, company, plan, pagination
├── utils/           # ApiError, ApiResponse, asyncHandler, OTP, tokens, pagination, email, socket, stripe, taskAccess
├── cron/            # Daily plan expiry checker
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
| POST | `/register` | Register admin + company + Stripe checkout |
| POST | `/login` | Login → sends OTP to email |
| POST | `/verify-login-otp` | Verify OTP → receive JWT cookies |
| POST | `/refresh-token` | Refresh access token |
| POST | `/logout` | Logout (clears cookies) |

### Users — `/api/v1/users`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/super-admin` | Public | Register first super admin |
| POST | `/admin` | SuperAdmin | Create admin |
| POST | `/` | Admin | Create user (plan limit enforced) |
| GET | `/` | SuperAdmin, Admin | List users (paginated) |
| GET | `/:id` | All | Get user by ID |
| PATCH | `/:id` | Admin, User | Update user |
| DELETE | `/:id` | Admin, User | Soft delete user |

### Companies — `/api/v1/companies`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Admin | Create company |
| GET | `/me` | Admin | Get own company |
| GET | `/` | SuperAdmin | List all companies (paginated) |
| GET | `/:id` | SuperAdmin | Get company by ID |
| PATCH | `/:id` | Admin | Update company |
| DELETE | `/:id` | SuperAdmin, Admin | Soft delete company |

### Plans — `/api/v1/plans`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | SuperAdmin | Create plan |
| GET | `/` | Public | Get active plans |
| PATCH | `/:planId` | SuperAdmin | Update plan |
| PATCH | `/:planId/disable` | SuperAdmin | Disable plan |

### Projects — `/api/v1/projects`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Admin | Create project (plan limit enforced) |
| POST | `/:projectId/assign-user` | Admin | Assign user (+ email & socket notification) |
| GET | `/my-projects` | Admin, User | Get projects (paginated) |
| PATCH | `/:id` | Admin | Update project |
| DELETE | `/:id` | Admin | Soft delete project |

### Tasks — `/api/v1/tasks`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Admin | Create task with auto-ID `TMS-{n}` |
| GET | `/` | User | Get my tasks (filter: status, priority) |
| GET | `/project/:projectId` | Admin | Get tasks by project |
| PATCH | `/:taskId/status` | Admin, User | Update status (+ notification + audit log) |
| PATCH | `/:taskId` | Admin | Update task details |
| DELETE | `/:taskId` | Admin | Soft delete task |
| POST | `/:taskId/comments` | Admin, User | Add comment |
| GET | `/:taskId/comments` | Admin, User | Get comments (paginated) |

### Dashboard — `/api/v1/dashboard`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/admin` | Admin | Dashboard stats (users, projects, tasks, status breakdown) |

### Webhooks — `/api/webhooks`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/stripe` | Stripe payment webhook |

## 🔌 Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join` | Client → Server | Join personal room with userId |
| `task_assigned` | Server → Client | New task assigned notification |
| `task_status_updated` | Server → Client | Task status change notification |
| `project_assigned` | Server → Client | Project assignment notification |

## 👥 Role Permissions

| Feature | SuperAdmin | Admin | User |
|---------|:----------:|:-----:|:----:|
| Manage Plans | ✅ | ❌ | ❌ |
| Manage All Companies | ✅ | ❌ | ❌ |
| Create Admin | ✅ | ❌ | ❌ |
| Create Users, Projects, Tasks | ❌ | ✅ | ❌ |
| View Dashboard Stats | ❌ | ✅ | ❌ |
| Update Task Status & Comment | ❌ | ✅ | ✅ |
| View Assigned Projects/Tasks | ❌ | ✅ | ✅ |
| List Users (scoped) | ✅ | ✅ | ❌ |
| View/Update Own Profile | ✅ | ✅ | ✅ |

## 👩‍💻 Author

**Shreya Wani** — [GitHub](https://github.com/Shreya-Wani)

---

> *"First, solve the problem. Then, write the code."* 🚀