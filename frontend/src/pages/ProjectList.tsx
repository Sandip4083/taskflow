import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Plus, Trash2, Search, FolderKanban, Users, Loader2, ArrowRight, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

type Project = { id: string; name: string; description: string; created_at: string; owner: string; members: string[] };

const projectColors = [
  { bg: 'bg-gradient-to-br from-violet-500/10 to-purple-500/5', border: 'border-violet-500/20 hover:border-violet-500/40', dot: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-400' },
  { bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/5', border: 'border-blue-500/20 hover:border-blue-500/40', dot: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  { bg: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5', border: 'border-emerald-500/20 hover:border-emerald-500/40', dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  { bg: 'bg-gradient-to-br from-orange-500/10 to-amber-500/5', border: 'border-orange-500/20 hover:border-orange-500/40', dot: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
  { bg: 'bg-gradient-to-br from-pink-500/10 to-rose-500/5', border: 'border-pink-500/20 hover:border-pink-500/40', dot: 'bg-pink-500', text: 'text-pink-600 dark:text-pink-400' },
  { bg: 'bg-gradient-to-br from-indigo-500/10 to-blue-500/5', border: 'border-indigo-500/20 hover:border-indigo-500/40', dot: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400' },
];

export const ProjectList = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: projects = [], isLoading, error } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return data.projects;
    }
  });

  const createProjectMutation = useMutation({
    mutationFn: async (newProject: { name: string; description: string }) => {
      const { data } = await axios.post(`${API_URL}/projects`, newProject, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setNewName('');
      setNewDesc('');
      setIsCreating(false);
      toast.success('Project created successfully!');
    },
    onError: () => {
      toast.error('Failed to create project');
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted');
    },
    onError: () => {
      toast.error('Failed to delete project');
    }
  });

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createProjectMutation.mutate({ name: newName.trim(), description: newDesc });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    deleteProjectMutation.mutate(id);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex flex-col gap-4 mb-6 sm:mb-8 animate-fade-in-down">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3">
            <div className="page-header-icon">
              <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            Projects
          </h1>
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div 
              key={i} 
              className="rounded-2xl border bg-card p-0 overflow-hidden animate-pulse" 
              {...{ style: { animationDelay: `${i * 80}ms` } }}
            >
              <div className="h-1 w-full skeleton" />
              <div className="p-4 sm:p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 skeleton rounded-full" />
                  <div className="h-5 w-3/4 skeleton" />
                </div>
                <div className="h-3 w-full skeleton" />
                <div className="h-3 w-2/3 skeleton" />
                <div className="flex gap-2 mt-4">
                  <div className="h-5 w-20 skeleton rounded-full" />
                </div>
              </div>
              <div className="border-t border-border/30 p-3 sm:p-4 flex justify-between items-center">
                <div className="h-3 w-28 skeleton" />
                <div className="h-6 w-6 skeleton rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:mb-8 animate-fade-in-down">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2 sm:gap-3">
            <div className="page-header-icon">
              <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            Projects
            {projects.length > 0 && (
              <span className="text-sm font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full ml-1">
                {projects.length}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm ml-11 sm:ml-[52px]">
            Manage and organize your team's workspaces.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              className="pl-9 bg-card/60 border-border/60" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search projects"
            />
          </div>
          <Button 
            onClick={() => setIsCreating(true)} 
            className="shrink-0 shadow-md shadow-primary/20 w-full sm:w-auto gap-1.5"
            aria-label="Create new project"
          >
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>
      </div>
      
      {/* Error state */}
      {error && (
        <div className="p-4 mb-6 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 animate-fade-in text-sm font-medium">
          ⚠️ Failed to load projects. Please check your connection.
        </div>
      )}

      {/* Create form */}
      {isCreating && (
        <Card className="mb-6 sm:mb-8 border-primary/25 shadow-lg shadow-primary/8 overflow-hidden animate-scale-in">
          <div className="h-1 w-full bg-gradient-to-r from-primary via-violet-500 to-blue-500" />
          <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
            <h3 className="font-bold text-base mb-4">Create New Project</h3>
            <form onSubmit={handleCreate} className="space-y-3 sm:grid sm:gap-4 sm:grid-cols-2 sm:space-y-0">
              <div className="sm:col-span-2">
                <Input 
                  label="Project Name" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  autoFocus 
                  required 
                  placeholder="e.g., Website Redesign" 
                  id="new-project-name"
                />
              </div>
              <div className="sm:col-span-2">
                <Input 
                  label="Description (optional)" 
                  value={newDesc} 
                  onChange={e => setNewDesc(e.target.value)} 
                  placeholder="What is this project about?" 
                  id="new-project-desc"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={() => { setIsCreating(false); setNewName(''); setNewDesc(''); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createProjectMutation.isPending || !newName.trim()}>
                  {createProjectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {filteredProjects.length === 0 && !isCreating ? (
        <div className="text-center py-14 sm:py-24 border-2 border-dashed rounded-2xl bg-gradient-to-b from-card to-muted/10 border-border/40 animate-fade-in-up">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/15 to-violet-500/15 text-primary rounded-2xl flex items-center justify-center mb-5 sm:mb-6 animate-float border border-primary/15">
            {searchQuery ? (
              <Search className="w-7 h-7 sm:w-9 sm:h-9 text-muted-foreground/60" />
            ) : (
              <FolderOpen className="w-7 h-7 sm:w-9 sm:h-9" />
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-bold">
            {searchQuery ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto px-4">
            {searchQuery 
              ? `No projects match "${searchQuery}". Try a different search.` 
              : 'Create your first project to start organizing tasks and collaborating with your team.'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsCreating(true)} className="mt-6 sm:mt-8 shadow-md shadow-primary/20" size="lg">
              <Plus className="w-5 h-5" /> Create your first project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, idx) => {
            const palette = projectColors[idx % projectColors.length];
            return (
              <Link key={project.id} to={`/projects/${project.id}`} className="group">
                <Card className={cn(
                  'h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col border animate-fade-in-up',
                  palette.bg, palette.border
                )} style={{ animationDelay: `${idx * 60}ms` }}>
                  <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-5 pt-4 sm:pt-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn('w-2.5 h-2.5 rounded-full shrink-0 mt-0.5', palette.dot)} />
                        <CardTitle className="line-clamp-1 text-base sm:text-lg">{project.name}</CardTitle>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-0.5" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-3 sm:pb-4 px-4 sm:px-5">
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3 sm:mb-4 min-h-[32px] sm:min-h-[40px] leading-relaxed">
                      {project.description || 'No description provided.'}
                    </p>
                    <Badge variant="outline" className={cn('gap-1.5 font-medium text-[10px] sm:text-xs border-transparent', palette.bg)}>
                      <Users className="w-3 h-3" />
                      {project.members?.length || 1} {project.members?.length === 1 ? 'member' : 'members'}
                    </Badge>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center text-[10px] sm:text-xs text-muted-foreground border-t border-border/25 pt-3 sm:pt-3.5 bg-background/20 px-4 sm:px-5 pb-3 sm:pb-3.5">
                    <span className="font-medium">
                      {format(new Date(project.created_at || new Date()), 'MMM d, yyyy')}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 sm:h-7 sm:w-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 rounded-lg" 
                      onClick={(e) => handleDelete(project.id, e)}
                      disabled={deleteProjectMutation.isPending}
                      aria-label={`Delete project ${project.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
