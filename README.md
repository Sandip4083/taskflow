<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

# ⚡ TaskFlow — Premium Project Management

> A production-grade, full-stack Kanban task management platform for modern teams.  
> Organize projects, drag-and-drop tasks, track analytics, and collaborate — all in real-time.

🔗 **Live Demo:** [https://sandip4083.github.io/taskflow/](https://sandip4083.github.io/taskflow/)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure login/signup with access + refresh tokens and bcrypt hashing |
| 📋 **Kanban Board** | Drag-and-drop tasks across Todo, In Progress, and Done columns |
| 📊 **Analytics Dashboard** | Task stats, project progress charts, priority breakdown |
| 📅 **Calendar View** | Visual calendar with color-coded task deadlines |
| 🔔 **Notifications** | In-app notifications for assignments, comments, and invites |
| 🌙 **Dark/Light/System Theme** | Persistent theme toggle with OS preference detection |
| 📱 **Fully Responsive** | Optimized for mobile (375px), tablet (768px), and desktop (1440px+) |
| 💬 **Task Comments** | Threaded discussions on each task with real-time updates |
| 🎯 **Priority & Due Dates** | High/Medium/Low priority badges, due date tracking, overdue alerts |
| 🔄 **Real-Time Updates** | Socket.IO for live task syncing across team members |
| 📈 **Progress Tracking** | Per-project completion percentage with visual progress bars |
| 🔑 **Password Strength Meter** | Real-time password strength feedback during registration |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 8, TailwindCSS v3, React Router v7 |
| **Backend** | Node.js, Express 5, TypeScript, Socket.IO |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT (access + refresh tokens), bcryptjs |
| **Charts** | Recharts (Pie, Bar charts) |
| **Drag & Drop** | @hello-pangea/dnd |
| **State** | TanStack React Query v5, React Context |
| **Styling** | TailwindCSS, clsx, tailwind-merge, Inter (Google Fonts) |
| **Icons** | Lucide React |
| **Deployment** | Vercel (Serverless API + Static SPA) |
| **Containerization** | Docker (multi-stage build with NGINX) |

---

## 📐 Architecture

```
taskflow/
├── api/                          # Vercel serverless entry point
│   └── index.ts                  # Re-exports Express app
│
├── frontend/                     # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           # Navbar, Sidebar (responsive)
│   │   │   ├── ui/               # Button, Card, Input, Badge, Avatar
│   │   │   ├── TaskModal.tsx     # Full task detail modal
│   │   │   └── ErrorBoundary.tsx # Graceful crash recovery
│   │   ├── context/
│   │   │   ├── AuthContext.tsx    # JWT auth + axios interceptors
│   │   │   └── ThemeContext.tsx   # Dark/Light/System persistence
│   │   ├── pages/
│   │   │   ├── Login.tsx         # Premium login with feature showcase
│   │   │   ├── Register.tsx      # Registration with password strength
│   │   │   ├── ProjectList.tsx   # Project grid with search
│   │   │   ├── ProjectDetail.tsx # Kanban board + drag-and-drop
│   │   │   ├── Dashboard.tsx     # Analytics with Recharts
│   │   │   ├── CalendarView.tsx  # Monthly calendar with tasks
│   │   │   └── Settings.tsx      # Profile, theme, notifications
│   │   └── config.ts            # API URL configuration
│   ├── index.html               # SEO-optimized with meta tags
│   └── tailwind.config.js       # Custom design tokens
│
├── backend/                      # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/              # DB connection, environment
│   │   ├── models/              # User, Project, Task, Comment, Notification
│   │   ├── controllers/         # Auth, Project, Task, Analytics, Comments
│   │   ├── routes/              # REST API route definitions
│   │   ├── middleware/          # Auth, roles, validation, error handling
│   │   ├── services/           # Auth tokens, notifications
│   │   ├── socket/             # Socket.IO real-time handlers
│   │   └── server.ts           # Express + Socket.IO entry
│   └── .env                    # Environment variables
│
├── vercel.json                  # Vercel deployment config
└── docker-compose.yml           # Docker containerization
```

### Design Principles
- **Clean Architecture** — Controllers → Services → Models separation
- **Optimistic Updates** — UI updates instantly, reverts on API failure
- **Glassmorphism UI** — Backdrop blur, gradient accents, smooth shadows
- **Staggered Animations** — Entrance animations with progressive delays
- **Mobile-First Responsive** — Every component adapts from 375px to 1440px+

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
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

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

### Docker (Production)

```bash
docker compose up -d --build
# Frontend: http://localhost:3000
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
4. **Deploy** — API routes to serverless, frontend to static CDN

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
<summary><b>💬 Comments</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/tasks/:taskId/comments` | List comments | ✓ |
| `POST` | `/api/tasks/:taskId/comments` | Add comment | ✓ |
| `DELETE` | `/api/comments/:commentId` | Delete comment | ✓ (author/admin) |

</details>

<details>
<summary><b>📊 Analytics & More</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/analytics/overview` | Task stats, project progress | ✓ |
| `GET` | `/api/analytics/productivity` | Weekly completion metrics | ✓ |
| `GET` | `/api/users` | List all users | ✓ |
| `GET` | `/api/notifications` | Get notifications | ✓ |
| `PATCH` | `/api/notifications/:id/read` | Mark as read | ✓ |
| `GET` | `/api/health` | Server status | ✗ |

</details>

---

## 🔌 Real-Time Events (Socket.IO)

Connections authenticated via JWT in handshake.

| Event | Direction | Description |
|-------|-----------|-------------|
| `project:join` | Client → Server | Join project room |
| `task:create` | Client → Server | Broadcast new task |
| `task:update` | Client → Server | Broadcast task change |
| `task:delete` | Client → Server | Broadcast task deletion |
| `task:created` | Server → Client | Receive new task |
| `task:updated` | Server → Client | Receive task change |
| `task:deleted` | Server → Client | Receive task deletion |
| `notification:new` | Server → Client | Receive notification |

---

## 📱 Responsive Breakpoints

| Device | Width | Adaptations |
|--------|-------|-------------|
| **Mobile** | 375px | Single column, compact cards, bottom-sheet modal, abbreviated calendar |
| **Tablet** | 768px | 2-column grids, expanded nav, medium charts |
| **Laptop** | 1024px | 3-column kanban, full sidebar, full charts |
| **Desktop** | 1440px+ | Max-width containers, feature showcase on auth pages |

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