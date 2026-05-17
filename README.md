<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

# ⚡ TaskFlow — Premium Project Management

> A production-grade, full-stack Kanban task management platform for modern teams.  
> Organize projects, drag-and-drop tasks, track analytics, and collaborate — all with a premium UI.

🔗 **Live Demo:** [https://taskflow-inky-theta.vercel.app/](https://taskflow-inky-theta.vercel.app/)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure login/signup with access + refresh tokens and bcrypt hashing |
| 📋 **Kanban Board** | Drag-and-drop tasks across Todo, In Progress, and Done columns with optimistic UI |
| 🔍 **Global Search (Ctrl+K)** | Command palette to instantly search projects, tasks, and pages |
| 🏷️ **Kanban Filters** | Filter tasks by priority, search by title/description, with active filter badges |
| 📊 **Analytics Dashboard** | Task stats, project progress charts, priority breakdown, recent activity timeline |
| 📅 **Calendar View** | Visual calendar with color-coded task deadlines and overdue alerts |
| 🔔 **Notifications** | In-app notifications for assignments, comments, and invites |
| 📷 **Avatar Upload** | Profile picture upload with preview, stored as base64 |
| 📥 **CSV Export** | One-click download of project tasks as a spreadsheet |
| 👥 **Team Members** | View project members, invite new members by email |
| 🎉 **Celebration Effects** | Confetti animation when all tasks are completed |
| 🌙 **Dark/Light Theme** | Persistent theme toggle with smooth transitions |
| 📱 **Fully Responsive** | Optimized for mobile (375px), tablet (768px), and desktop (1440px+) |
| 💬 **Task Comments** | Threaded discussions on each task |
| ✅ **Subtasks/Checklists** | Break tasks into smaller actionable subtasks |
| 🎯 **Priority & Due Dates** | High/Medium/Low priority badges, due date tracking, overdue alerts |
| 📈 **Progress Tracking** | Per-project completion percentage with visual progress bars |
| 🔑 **Password Strength Meter** | Real-time password strength feedback during registration |
| 🦴 **Skeleton Loading** | Premium skeleton cards with shimmer animation instead of spinners |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------| 
| **Frontend** | React 19, TypeScript, Vite 8, TailwindCSS v3, React Router v7 |
| **Backend** | Node.js, Express 5, TypeScript |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT (access + refresh tokens), bcryptjs |
| **Charts** | Recharts (Pie, Bar charts) |
| **Drag & Drop** | @hello-pangea/dnd |
| **State** | TanStack React Query v5, React Context |
| **Styling** | TailwindCSS, clsx, tailwind-merge, Inter (Google Fonts) |
| **Icons** | Lucide React |
| **Notifications** | Sonner (toast notifications) |
| **Deployment** | Vercel (Serverless API + Static SPA) |

---

## 📐 Architecture

```
taskflow/
├── api/                          # Vercel serverless entry point
│   └── index.ts                  # Delegates requests to Express app
│
├── frontend/                     # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           # Navbar, Sidebar (responsive)
│   │   │   ├── ui/               # Button, Card, Input, Badge, Avatar
│   │   │   ├── CommandPalette.tsx # Ctrl+K global search
│   │   │   ├── TaskModal.tsx     # Full task detail modal
│   │   │   └── ErrorBoundary.tsx # Graceful crash recovery
│   │   ├── context/
│   │   │   ├── AuthContext.tsx    # JWT auth + user state
│   │   │   └── ThemeContext.tsx   # Dark/Light persistence
│   │   ├── pages/
│   │   │   ├── Login.tsx         # Premium login with feature showcase
│   │   │   ├── Register.tsx      # Registration with password strength
│   │   │   ├── ProjectList.tsx   # Project grid with skeleton loading
│   │   │   ├── ProjectDetail.tsx # Kanban board + filters + CSV export
│   │   │   ├── Dashboard.tsx     # Analytics with Recharts
│   │   │   ├── CalendarView.tsx  # Monthly calendar with tasks
│   │   │   └── Settings.tsx      # Profile avatar, theme, preferences
│   │   └── config.ts            # API URL configuration
│   ├── index.html               # SEO-optimized with meta tags
│   └── tailwind.config.js       # Custom design tokens
│
├── backend/                      # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/              # DB connection, environment
│   │   ├── models/              # User, Project, Task, Comment, Notification, Subtask
│   │   ├── controllers/         # Auth, Project, Task, Analytics, Comments, Users, Subtasks
│   │   ├── routes/              # REST API route definitions
│   │   ├── middleware/          # Auth, validation, error handling
│   │   ├── services/           # Auth tokens, notification creation
│   │   └── server.ts           # Express entry (serverless-ready)
│   └── .env                    # Environment variables (not committed)
│
├── vercel.json                  # Vercel deployment config
├── tsconfig.json                # Root TypeScript config for API
└── package.json                 # Root scripts & shared dependencies
```

### Design Principles
- **Clean Architecture** — Controllers → Services → Models separation
- **Optimistic Updates** — UI updates instantly, reverts on API failure
- **Glassmorphism UI** — Backdrop blur, gradient accents, smooth shadows
- **Staggered Animations** — Entrance animations with progressive delays
- **Mobile-First Responsive** — Every component adapts from 375px to 1440px+
- **Serverless-Ready** — Lazy DB connection with caching for cold starts

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (v22 recommended)
- **MongoDB Atlas** account (or local MongoDB)
- **npm** package manager

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Sandip4083/taskflow.git
cd taskflow

# Install all dependencies
npm run install:all

# Start both servers (backend + frontend)
npm run dev

# App: http://localhost:5173
# API: http://localhost:4000
```

### Environment Variables

**Backend** (`backend/.env`)
```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/taskflow
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

---

## ☁️ Vercel Deployment

The app is pre-configured for Vercel with `vercel.json`:

1. **Import** the repository in [Vercel Dashboard](https://vercel.com)
2. **Add Environment Variables** in Project Settings:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CLIENT_URL` (your Vercel deployment URL)
3. **Whitelist Vercel IPs** in MongoDB Atlas → Network Access → Allow `0.0.0.0/0`
4. **Deploy** — API routes go to serverless functions, frontend to static CDN

### How it works
- `api/index.ts` exports a Vercel serverless handler wrapping the Express app
- `vercel-build` script builds frontend to `build-output/` for static hosting
- Routes: `/api/*` → serverless function, `/*` → SPA `index.html`
- CORS headers configured at edge level for API reliability

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>` header.

<details>
<summary><b>🔐 Authentication</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Create account | ✗ |
| `POST` | `/api/auth/login` | Login, get tokens | ✗ |
| `POST` | `/api/auth/refresh` | Refresh access token | ✗ |
| `POST` | `/api/auth/logout` | Invalidate refresh token | ✓ |
| `GET`  | `/api/auth/me` | Get current user | ✓ |

</details>

<details>
<summary><b>📁 Projects</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/projects` | List user's projects | ✓ |
| `POST` | `/api/projects` | Create project | ✓ |
| `GET` | `/api/projects/:id` | Get project + tasks | ✓ |
| `PATCH` | `/api/projects/:id` | Update project | ✓ (owner) |
| `DELETE` | `/api/projects/:id` | Delete project + tasks | ✓ (owner) |
| `POST` | `/api/projects/:id/members` | Add member | ✓ (owner) |
| `DELETE` | `/api/projects/:id/members/:userId` | Remove member | ✓ (owner) |

</details>

<details>
<summary><b>✅ Tasks</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/projects/:id/tasks` | List tasks (filter: status, priority, assignee) | ✓ |
| `POST` | `/api/projects/:id/tasks` | Create task | ✓ |
| `GET` | `/api/tasks/:id` | Get task detail | ✓ |
| `PATCH` | `/api/tasks/:id` | Update task | ✓ |
| `DELETE` | `/api/tasks/:id` | Delete task | ✓ |

</details>

<details>
<summary><b>📝 Subtasks</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/tasks/:taskId/subtasks` | List subtasks | ✓ |
| `POST` | `/api/tasks/:taskId/subtasks` | Create subtask | ✓ |
| `PATCH` | `/api/subtasks/:id` | Update subtask | ✓ |
| `DELETE` | `/api/subtasks/:id` | Delete subtask | ✓ |

</details>

<details>
<summary><b>💬 Comments</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/tasks/:taskId/comments` | List comments | ✓ |
| `POST` | `/api/tasks/:taskId/comments` | Add comment | ✓ |
| `DELETE` | `/api/comments/:commentId` | Delete comment | ✓ (author/admin) |

</details>

<details>
<summary><b>📊 Analytics & Users</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/analytics/overview` | Task stats, project progress | ✓ |
| `GET` | `/api/analytics/productivity` | Weekly completion metrics | ✓ |
| `GET` | `/api/users` | List all users | ✓ |
| `PATCH` | `/api/users/avatar` | Upload profile avatar (base64) | ✓ |
| `GET` | `/api/notifications` | Get notifications | ✓ |
| `PATCH` | `/api/notifications/:id/read` | Mark as read | ✓ |
| `GET` | `/api/health` | Server health check | ✗ |

</details>

---

## 📱 Responsive Breakpoints

| Device | Width | Adaptations |
|--------|-------|-------------|
| **Mobile** | 375px | Single column, compact cards, bottom-sheet modal, abbreviated calendar |
| **Tablet** | 768px | 2-column grids, expanded nav, medium charts |
| **Laptop** | 1024px | 3-column kanban, full sidebar, full charts |
| **Desktop** | 1440px+ | Max-width containers, feature showcase on auth pages |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `⌘+K` | Open global search palette |
| `↑↓` | Navigate search results |
| `Enter` | Open selected result |
| `Esc` | Close search / modals |

---

## 🎨 Design System

- **Font:** Inter (Google Fonts)
- **Colors:** HSL-based CSS custom properties with dark mode variants
- **Animations:** Fade, slide, scale, float, shimmer, gradient-shift
- **Components:** Glassmorphism cards, gradient avatars, colored shadows
- **Accents:** Purple-to-blue gradient theme with emerald/amber status colors

---

## 📝 License

MIT — free for personal and commercial use.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Sandip4083">Sandip</a>
</p>