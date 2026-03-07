# 📋 Task Management System

A multi-tenant, role-based Task Management System API with Stripe payments, OTP-based 2FA, and subscription plan management.

## ✨ Key Features

- **Role-Based Access** — Three roles: `superAdmin`, `admin`, `user` with scoped permissions
- **OTP Two-Factor Auth** — Email OTP on login + JWT access/refresh tokens (HTTP-only cookies)
- **Stripe Payments** — Admin registers with company & plan → Stripe checkout → on successful payment, both company and admin are auto-activated
- **Subscription Plans** — Plan limits on users, projects, and tasks with daily expiry cron job
- **Multi-Tenant** — Company-scoped data isolation with soft deletes
- **Task Lifecycle** — 7-stage workflow: `to-do` → `in-progress` → `done` → `testing` → `qa-verified` → `re-open` → `deployment`
- **Task Comments & History** — Comment on tasks and auto-tracked audit trail
- **Validation & Error Handling** — Joi schemas, custom ApiError/ApiResponse, async error wrapping

## 🛠️ Tech Stack

Node.js · Express v5 · MongoDB (Mongoose) · JWT · bcryptjs · Stripe · Joi · Nodemailer · node-cron · Nodemon

## 📂 Project Structure

```
src/
├── controllers/     # Route handlers (auth, company, user, plan, project, task, webhook)
├── services/        # Business logic layer
├── models/          # Mongoose schemas (User, Company, Task, Project, Plan, TaskComment, TaskHistory)
├── routes/          # API route definitions
├── middlewares/     # JWT auth, role check, Joi validation, error handler
├── validations/     # Joi schemas for request validation
├── utils/           # ApiError, ApiResponse, OTP generator, token utils, email, Stripe client
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
| POST | `/login` | Login (sends OTP to email) |
| POST | `/verify-login-otp` | Verify OTP → receive tokens |
| POST | `/refresh-token` | Refresh access token |
| POST | `/logout` | Logout (clears cookies) |

### Companies — `/api/v1/companies`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | SuperAdmin | List all companies (paginated) |
| GET | `/:id` | SuperAdmin | Get company by ID |

### Users — `/api/v1/users`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/admin` | SuperAdmin | Create admin |
| POST | `/` | Admin | Create user in own company |
| GET | `/` | SuperAdmin, Admin | List users (paginated) |
| GET | `/:id` | All | Get user by ID |
| PATCH | `/:id` | All | Update user |
| DELETE | `/:id` | All | Soft delete user |

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
| POST | `/` | Admin | Create project |
| POST | `/:projectId/assign-user` | Admin | Assign user to project |
| GET | `/my-projects` | User | Get assigned projects |

### Tasks — `/api/v1/tasks`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Admin | Create task |
| PATCH | `/:taskId/status` | Auth | Update task status |
| POST | `/:taskId/comments` | Auth | Add comment |

### Webhooks — `/api/webhooks`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/stripe` | Stripe payment webhook |

## 👥 Role Permissions

| Feature | SuperAdmin | Admin | User |
|---------|:----------:|:-----:|:----:|
| Manage Companies & Plans | ✅ | ❌ | ❌ |
| Create Admin | ✅ | ❌ | ❌ |
| Create Users & Projects & Tasks | ❌ | ✅ | ❌ |
| Update Task Status & Comment | ❌ | ✅ | ✅ |
| View Assigned Projects | ❌ | ❌ | ✅ |
| View/Update Own Profile | ✅ | ✅ | ✅ |

## 📄 License

ISC