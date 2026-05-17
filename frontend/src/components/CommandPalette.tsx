/* cSpell:words cmdk */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { Search, FolderKanban, CheckSquare, LayoutDashboard, Calendar, Settings, ArrowRight, Command } from 'lucide-react';

type SearchResult = {
  type: 'project' | 'task' | 'page';
  id: string;
  title: string;
  subtitle?: string;
  icon: typeof FolderKanban;
  path: string;
};

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch projects for search
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data.projects;
    },
    enabled: !!user,
  });

  // Keyboard shortcut to open (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Build search results
  const staticPages: SearchResult[] = [
    { type: 'page', id: 'dashboard', title: 'Dashboard', subtitle: 'Analytics & overview', icon: LayoutDashboard, path: '/dashboard' },
    { type: 'page', id: 'projects', title: 'Projects', subtitle: 'All your projects', icon: FolderKanban, path: '/' },
    { type: 'page', id: 'calendar', title: 'Calendar', subtitle: 'Due dates & schedule', icon: Calendar, path: '/calendar' },
    { type: 'page', id: 'settings', title: 'Settings', subtitle: 'Preferences & profile', icon: Settings, path: '/settings' },
  ];

  const projectResults: SearchResult[] = (projects || []).map((p: { id: string; name: string; description?: string }) => ({
    type: 'project' as const,
    id: p.id,
    title: p.name,
    subtitle: p.description || 'Project',
    icon: FolderKanban,
    path: `/projects/${p.id}`,
  }));

  // Collect tasks from all projects
  const taskResults: SearchResult[] = (projects || []).flatMap((p: { id: string; name: string; tasks?: { id: string; title: string; status: string }[] }) =>
    (p.tasks || []).map((t: { id: string; title: string; status: string }) => ({
      type: 'task' as const,
      id: t.id,
      title: t.title,
      subtitle: `${p.name} · ${t.status.replace('_', ' ')}`,
      icon: CheckSquare,
      path: `/projects/${p.id}`,
    }))
  );

  const allResults = [...staticPages, ...projectResults, ...taskResults];

  const filtered = query.trim()
    ? allResults.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
    : staticPages;

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIdx]) {
      navigate(filtered[selectedIdx].path);
      setOpen(false);
    }
  };

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  if (!open) return null;

  const groupedResults = {
    pages: filtered.filter(r => r.type === 'page'),
    projects: filtered.filter(r => r.type === 'project'),
    tasks: filtered.filter(r => r.type === 'task'),
  };

  let flatIdx = 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] animate-fade-in" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-[90vw] max-w-lg bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, tasks, pages..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground/70 bg-muted px-1.5 py-0.5 rounded border border-border/50 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto custom-scrollbar py-2">
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
            </div>
          )}

          {(['pages', 'projects', 'tasks'] as const).map(group => {
            const items = groupedResults[group];
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <div className="px-4 py-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                    {group === 'pages' ? 'Pages' : group === 'projects' ? 'Projects' : 'Tasks'}
                  </span>
                </div>
                {items.map((result) => {
                  const currentIdx = flatIdx++;
                  const isSelected = currentIdx === selectedIdx;
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-100 group ${
                        isSelected ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/50'
                      }`}
                      onClick={() => { navigate(result.path); setOpen(false); }}
                      onMouseEnter={() => setSelectedIdx(currentIdx)}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-primary/20' : 'bg-muted'
                      }`}>
                        <result.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-[10px] text-muted-foreground truncate">{result.subtitle}</p>
                        )}
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition-all ${
                        isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                      }`} />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 bg-muted/30 text-[10px] text-muted-foreground/60">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-muted border border-border/50 rounded text-[9px] font-mono">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-muted border border-border/50 rounded text-[9px] font-mono">↵</kbd> Open</span>
          </div>
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-muted border border-border/50 rounded text-[9px] font-mono">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
};

// Trigger button for the command palette
export const CommandPaletteTrigger = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted border border-border/50 rounded-lg transition-all duration-200 hover:border-primary/30 group"
  >
    <Search className="w-3.5 h-3.5" />
    <span className="text-xs">Search...</span>
    <kbd className="ml-4 flex items-center gap-0.5 text-[10px] text-muted-foreground/60 bg-background px-1.5 py-0.5 rounded border border-border/50 font-mono group-hover:text-primary/60">
      <Command className="w-2.5 h-2.5" />K
    </kbd>
  </button>
);
