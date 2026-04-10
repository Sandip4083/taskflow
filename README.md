# TaskFlow — Frontend Implementation

## 1. Overview
This directory contains the **Frontend-only** solution for the TaskFlow project. It is a minimal, highly polished task management interface built with **React**, **Vite**, and **TailwindCSS**. 

It runs entirely against a mock API driven by **MSW (Mock Service Worker)**, allowing users to register, login, view accessible projects, and manage individual tasks seamlessly without hitting an actual backend database. The User Interface leverages a bespoke set of minimalistic, tailored components heavily inspired by ShadcnUI, paired with Lucide-react for sharp iconography.

### Features Included
- **Dark Mode Persistence**: Deep Tailwind `.dark` dynamic styling natively toggled via a custom `ThemeProvider` context hook.
- **Task Drag-and-Drop**: Native HTML5 Drag and Drop logic allowing seamless visual transitions and column rearrangement for tasks.
- **Responsive Interface**: Mobile-friendly layouts built carefully spanning `375px` to `1280px`.

### Tech Stack
- **Framework:** React 18, Vite, TypeScript
- **Routing:** React Router v6
- **Styling:** TailwindCSS (v3.4), clsx, tailwind-merge (for robust conditional styling)
- **Mocking:** MSW (Mock Service Worker)
- **Containerization:** Docker Multi-stage build leveraging NGINX.

## 2. Architecture Decisions
- **Standalone Mock API**: To fully decouple frontend development and satisfy the frontend-only prompt, MSW is initialized directly on bootstrap (`main.tsx`). All API calls interact natively with `fetch/axios` pointing to `http://localhost:4000`, ensuring 100% code parity when migrating to a real backend. State is maintained persistently in memory during the browser session lifecycle.
- **Micro-Component UI**: Instead of bringing in a bulky UI library, I built reusable atomic UI elements (`Button`, `Input`, `Card`) utilizing `tailwind-merge` and `clsx` to guarantee flexible `className` composition. It achieves the high-end look of Shadcn UI while staying lightweight.
- **Context API for Auth**: Authentication relies on idiomatic React Context rather than complex stores like Redux to maintain simplicity, handling `localStorage` persistence securely across refreshes.
- **Optimistic Updates**: Included optimistic state manipulation for task deletion and status changes to keep the application feeling crisp, instant, and reactive to the user.

## 3. Running Locally
You can seamlessly run the pristine production build natively through Docker at the root.

```bash
git clone https://github.com/your-name/taskflow
cd taskflow
cp .env.example .env
docker compose up -d --build
# App is available at http://localhost:3000
```

## 4. Running Migrations
*As this submission is purely for the **Frontend-only** path relying entirely on an MSW Mock server, no database migrations are applicable or necessary. The local state is generated seamlessly on load.*

## 5. Test Credentials
You can log in dynamically using the mock data populated inside MSW without needing to register a new account:

```text
Email:    test@example.com
Password: password123
```

## 6. API Reference
This Frontend connects strictly to the Mock API built using `msw`. All endpoints outlined in the *"Appendix A: Mock API Spec"* have been successfully integrated locally under the `http://localhost:4000` namespace intercept. 

**Endpoints Handled:**
- `POST /auth/register` - Creates a mock user.
- `POST /auth/login` - Validates email/password and returns a mocked JWT token.
- `GET /projects` - Fetches mock projects.
- `POST /projects` - Appends a new project locally.
- `GET /projects/:id` - Fetches a specific project and embeds linked tasks.
- `PATCH /projects/:id` - Updates project metadata dynamically.
- `DELETE /projects/:id` - Drops project and cleans up matching tasks.
- `GET /projects/:id/tasks` - Supports filtering natively (e.g. `?status=todo`).
- `POST /projects/:id/tasks` - Creates tasks defaulted to `todo`.
- `PATCH /tasks/:id` - Dynamically updates task fields (Used extensively for Drag-and-Drop and generic updates).
- `DELETE /tasks/:id` - Deletes tasks successfully.