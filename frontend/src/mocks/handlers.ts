import { API_URL } from '../config';
import { http, HttpResponse } from 'msw'

const db = {
  users: [
    { id: '1', name: 'Test User', email: 'test@example.com', password: 'password123' },
    { id: '2', name: 'Jane Doe', email: 'jane@example.com', password: 'secret123' }
  ],
  projects: [
    { id: '101', name: 'Website Redesign', description: 'Q2 project', owner_id: '1', created_at: '2026-04-01T10:00:00Z' }
  ],
  tasks: [
    { id: '201', title: 'Design homepage', description: 'Create Figma file', status: 'in_progress', priority: 'high', project_id: '101', assignee_id: '1', due_date: '2026-04-15', created_at: '2026-04-02T10:00:00Z', updated_at: '2026-04-03T10:00:00Z' },
    { id: '202', title: 'Implement Login', description: 'Frontend login page', status: 'todo', priority: 'medium', project_id: '101', assignee_id: '2', due_date: '2026-04-18', created_at: '2026-04-03T10:00:00Z', updated_at: '2026-04-03T10:00:00Z' }
  ]
};

const requireAuth = (request: Request) => {
  const auth = request.headers.get('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) return false;
  return true;
};

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const { name, email, password } = await request.json() as any;
    if (!name || !email || !password) {
      return HttpResponse.json({ error: 'validation failed', fields: { email: 'is required' } }, { status: 400 })
    }
    const user = { id: Date.now().toString(), name, email, password };
    db.users.push(user);
    return HttpResponse.json({ token: `mock-jwt-token-${user.id}`, user: { id: user.id, name: user.name, email: user.email } }, { status: 201 })
  }),

  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const { email, password } = await request.json() as any;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) {
      return HttpResponse.json({ error: 'invalid credentials' }, { status: 401 })
    }
    return HttpResponse.json({ token: `mock-jwt-token-${user.id}`, user: { id: user.id, name: user.name, email: user.email } })
  }),

  // Projects endpoints
  http.get(`${API_URL}/projects`, ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    return HttpResponse.json({ projects: db.projects })
  }),

  http.post(`${API_URL}/projects`, async ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    const auth = request.headers.get('Authorization');
    const owner_id = auth?.split('mock-jwt-token-')[1] || '1';
    const body = await request.json() as any;
    const newProject = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description,
      owner_id,
      created_at: new Date().toISOString()
    };
    db.projects.push(newProject);
    return HttpResponse.json(newProject, { status: 201 })
  }),

  http.get(`${API_URL}/projects/:id`, ({ request, params }) => {
    if (!requireAuth(request)) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    const { id } = params;
    const project = db.projects.find(p => p.id === id);
    if (!project) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    const tasks = db.tasks.filter(t => t.project_id === id);
    return HttpResponse.json({ ...project, tasks })
  }),

  http.patch(`${API_URL}/projects/:id`, async ({ request, params }) => {
    if (!requireAuth(request)) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    const { id } = params;
    const idx = db.projects.findIndex(p => p.id === id);
    if (idx === -1) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    const body = await request.json() as any;
    db.projects[idx] = { ...db.projects[idx], ...body, updated_at: new Date().toISOString() };
    return HttpResponse.json(db.projects[idx])
  }),

  http.delete(`${API_URL}/projects/:id`, ({ request, params }) => {
    if (!requireAuth(request)) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    const { id } = params;
    db.projects = db.projects.filter(p => p.id !== id);
    db.tasks = db.tasks.filter(t => t.project_id !== id);
    return new HttpResponse(null, { status: 204 })
  }),

  // Tasks endpoints
  http.get(`${API_URL}/projects/:id/tasks`, ({ request, params }) => {
    if (!requireAuth(request)) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const assignee = url.searchParams.get('assignee');
    const { id } = params;
    
    let filtered = db.tasks.filter(t => t.project_id === id);
    if (status) filtered = filtered.filter(t => t.status === status);
    if (assignee) filtered = filtered.filter(t => t.assignee_id === assignee);
    
    return HttpResponse.json({ tasks: filtered })
  }),

  http.post(`${API_URL}/projects/:id/tasks`, async ({ request, params }) => {
    if (!requireAuth(request)) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    const { id } = params;
    const body = await request.json() as any;
    const newTask = {
      id: Date.now().toString(),
      ...body,
      project_id: id,
      status: body.status || 'todo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.tasks.push(newTask);
    return HttpResponse.json(newTask, { status: 201 })
  }),

  http.patch(`${API_URL}/tasks/:id`, async ({ request, params }) => {
    if (!requireAuth(request)) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    const { id } = params;
    const idx = db.tasks.findIndex(t => t.id === id);
    if (idx === -1) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    const body = await request.json() as any;
    db.tasks[idx] = { ...db.tasks[idx], ...body, updated_at: new Date().toISOString() };
    return HttpResponse.json(db.tasks[idx])
  }),

  http.delete(`${API_URL}/tasks/:id`, ({ request, params }) => {
    if (!requireAuth(request)) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    const { id } = params;
    const idx = db.tasks.findIndex(t => t.id === id);
    if (idx === -1) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    db.tasks = db.tasks.filter(t => t.id !== id);
    return new HttpResponse(null, { status: 204 })
  }),

  // Users endpoint for mocking user assignment list
  http.get(`${API_URL}/users`, ({ request }) => {
    if (!requireAuth(request)) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    return HttpResponse.json({ users: db.users.map(u => ({ id: u.id, name: u.name, email: u.email })) })
  }),
]
