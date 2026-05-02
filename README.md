# TaskFlow — Full-Stack Task Management Platform

A production-grade task management application built with **React**, **Node.js**, **Express**, and **MongoDB Atlas**. Features real-time collaboration via **Socket.IO**, JWT authentication, drag-and-drop Kanban boards, analytics dashboard, and a polished dark/light theme UI.

---

## 1. Overview

TaskFlow enables teams to organize projects, manage tasks across Kanban boards, and collaborate in real-time. Originally a frontend-only prototype using MSW (Mock Service Worker), it has been transformed into a complete full-stack application with persistent data, secure authentication, and real-time updates.

### Key Features
- **JWT Authentication** — Secure login/signup with access + refresh tokens and bcrypt password hashing.
- **Role-Based Access** — Admin and Member roles with protected routes and middleware.
- **Project Management** — Full CRUD with member management and ownership controls.
- **Kanban Task Board** — Drag-and-drop tasks across Todo, In Progress, and Done columns.
- **Task Features** — Priority levels, due dates, assignees, activity logs, and comments.
- **Real-Time Updates** — Socket.IO for live task and notification syncing across clients.
- **Analytics Dashboard** — Task stats, project progress, priority breakdown, and productivity tracking.
- **Notification System** — In-app notifications for task assignments, comments, and project invites.
- **Dark Mode** — Persistent dark/light theme toggle with system preference detection.
- **Responsive Design** — Mobile-friendly layouts from 375px to 1280px+.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS v3, React Router v7 |
| **Backend** | Node.js, Express 5, TypeScript, Socket.IO |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT (access + refresh tokens), bcryptjs |
| **Validation** | express-validator |
| **Styling** | TailwindCSS, clsx, tailwind-merge |
| **Icons** | Lucide React |
| **Containerization** | Docker (multi-stage build with NGINX) |

---

## 3. Project Structure

```
taskflow/
├── frontend/                    # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/Navbar.tsx
│   │   │   └── ui/             # Button, Card, Input (ShadcnUI-inspired)
│   │   ├── context/
│   │   │   ├── AuthContext.tsx  # JWT auth state + axios interceptors
│   │   │   └── ThemeContext.tsx # Dark/light mode persistence
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ProjectList.tsx
│   │   │   └── ProjectDetail.tsx  # Kanban board + drag-and-drop
│   │   ├── lib/utils.ts        # cn() utility (clsx + tailwind-merge)
│   │   ├── config.ts           # API_URL from environment
│   │   ├── main.tsx
│   │   └── index.css           # Tailwind + CSS custom properties
│   ├── .env                    # VITE_API_BASE_URL
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts           # MongoDB Atlas connection
│   │   │   └── env.ts          # Environment config
│   │   ├── models/
│   │   │   ├── User.ts         # bcrypt hashing, role system
│   │   │   ├── Project.ts      # Owner + members
│   │   │   ├── Task.ts         # Status, priority, activity log
│   │   │   ├── Comment.ts      # Task comments
│   │   │   └── Notification.ts # In-app notifications
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── projectController.ts
│   │   │   ├── taskController.ts
│   │   │   ├── commentController.ts
│   │   │   ├── userController.ts
│   │   │   └── analyticsController.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── projectRoutes.ts
│   │   │   ├── taskRoutes.ts
│   │   │   ├── commentRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   └── analyticsRoutes.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT verification
│   │   │   ├── role.ts         # Role-based access control
│   │   │   ├── errorHandler.ts # Global error handling
│   │   │   └── validate.ts     # Request validation
│   │   ├── services/
│   │   │   ├── authService.ts  # Token generation/verification
│   │   │   └── notificationService.ts
│   │   ├── socket/
│   │   │   └── socketHandler.ts # Real-time event handling
│   │   ├── utils/
│   │   │   ├── ApiError.ts     # Custom error class
│   │   │   └── asyncHandler.ts # Async route wrapper
│   │   └── server.ts           # Express + Socket.IO entry point
│   ├── .env                    # MongoDB URI, JWT secrets
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 4. Architecture Decisions

- **Clean Architecture** — Controllers handle HTTP, services handle business logic, models define data shape. Middleware handles cross-cutting concerns (auth, validation, errors).
- **Micro-Component UI** — Reusable atomic UI elements (`Button`, `Input`, `Card`) built with `tailwind-merge` and `clsx` for flexible className composition, inspired by ShadcnUI.
- **Context API for Auth** — React Context with localStorage persistence, axios interceptors for automatic token management.
- **Optimistic Updates** — Task deletion and status changes update UI instantly, reverting on backend failure.
- **Activity Logging** — Every task change (status, assignee, priority) is automatically logged with timestamp and user reference.
- **Real-Time via Socket.IO** — JWT-authenticated socket connections, project-scoped rooms for targeted broadcasts.

---

## 5. Running Locally

### Prerequisites
- Node.js v18+ (v22 tested)
- MongoDB Atlas account (or local MongoDB)
- npm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Sandip4083/taskflow.git
cd taskflow

# Install backend dependencies
cd backend
npm install

# Configure environment (edit .env with your MongoDB URI)
# Default .env is pre-configured

# Start backend (port 4000)
npm run dev

# In a new terminal — Install & start frontend
cd ../frontend
npm install
npm run dev

# App is available at http://localhost:5173 (or next available port)
```

### Docker (Production Build)

```bash
docker compose up -d --build
# Frontend: http://localhost:3000
```

### Environment Variables

**Backend (`backend/.env`)**
```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/taskflow
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Frontend (`frontend/.env`)**
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

---

## 6. API Reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>` header.

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Create account | ✗ |
| `POST` | `/api/auth/login` | Login, get tokens | ✗ |
| `POST` | `/api/auth/refresh` | Refresh access token | ✗ |
| `POST` | `/api/auth/logout` | Invalidate refresh token | ✓ |
| `GET` | `/api/auth/me` | Get current user | ✓ |

### Projects
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/projects` | List user's projects | ✓ |
| `POST` | `/api/projects` | Create project | ✓ |
| `GET` | `/api/projects/:id` | Get project + tasks | ✓ |
| `PATCH` | `/api/projects/:id` | Update project | ✓ (owner) |
| `DELETE` | `/api/projects/:id` | Delete project + tasks | ✓ (owner) |
| `POST` | `/api/projects/:id/members` | Add member | ✓ (owner) |
| `DELETE` | `/api/projects/:id/members/:userId` | Remove member | ✓ (owner) |

### Tasks
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/projects/:id/tasks` | List tasks (filter: status, priority, assignee, search) | ✓ |
| `POST` | `/api/projects/:id/tasks` | Create task | ✓ |
| `GET` | `/api/tasks/:id` | Get task detail | ✓ |
| `PATCH` | `/api/tasks/:id` | Update task (status, priority, assignee, etc.) | ✓ |
| `DELETE` | `/api/tasks/:id` | Delete task | ✓ |

### Comments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/tasks/:taskId/comments` | List comments | ✓ |
| `POST` | `/api/tasks/:taskId/comments` | Add comment | ✓ |
| `DELETE` | `/api/comments/:commentId` | Delete comment | ✓ (author/admin) |

### Users & Notifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/users` | List all users | ✓ |
| `GET` | `/api/notifications` | Get notifications | ✓ |
| `PATCH` | `/api/notifications/:id/read` | Mark as read | ✓ |
| `PATCH` | `/api/notifications/read-all` | Mark all as read | ✓ |

### Analytics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/analytics/overview` | Task stats, project progress, recent activity | ✓ |
| `GET` | `/api/analytics/productivity` | Weekly completion metrics | ✓ |

### Health Check
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/health` | Server status | ✗ |

---

## 7. Real-Time Events (Socket.IO)

Connections are authenticated via JWT token in handshake.

| Event | Direction | Description |
|-------|-----------|-------------|
| `project:join` | Client → Server | Join project room |
| `project:leave` | Client → Server | Leave project room |
| `task:create` | Client → Server | Broadcast new task |
| `task:update` | Client → Server | Broadcast task change |
| `task:delete` | Client → Server | Broadcast task deletion |
| `task:created` | Server → Client | Receive new task |
| `task:updated` | Server → Client | Receive task change |
| `task:deleted` | Server → Client | Receive task deletion |
| `notification:new` | Server → Client | Receive new notification |

---

## 8. Test Credentials

```
Email:    test@example.com
Password: password123
```

---

## 9. License

MIT