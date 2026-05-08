import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Plus, Trash2, Search, FolderKanban, Users, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';

type Project = { id: string; name: string; description: string; created_at: string; owner: string; members: string[] };

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
    if (!newName) return;
    createProjectMutation.mutate({ name: newName, description: newDesc });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project and all its tasks?')) return;
    deleteProjectMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading your projects...</p>
      </div>
    );
  }

  const projectColors = [
    'from-violet-500/10 to-purple-500/5 border-violet-500/20 hover:border-violet-500/40',
    'from-blue-500/10 to-cyan-500/5 border-blue-500/20 hover:border-blue-500/40',
    'from-emerald-500/10 to-teal-500/5 border-emerald-500/20 hover:border-emerald-500/40',
    'from-orange-500/10 to-amber-500/5 border-orange-500/20 hover:border-orange-500/40',
    'from-pink-500/10 to-rose-500/5 border-pink-500/20 hover:border-pink-500/40',
    'from-indigo-500/10 to-blue-500/5 border-indigo-500/20 hover:border-indigo-500/40',
  ];

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
      <div className="flex flex-col gap-4 mb-6 sm:mb-8 animate-fade-in-down">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
              <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            Projects
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm ml-10 sm:ml-[52px]">Manage your team's workspaces.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              className="pl-9 bg-card/50" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreating(true)} className="shrink-0 shadow-md shadow-primary/20 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 animate-fade-in text-sm">
          Failed to load projects. Please check your connection.
        </div>
      )}

      {isCreating && (
        <Card className="mb-6 sm:mb-8 border-primary/30 shadow-lg shadow-primary/5 overflow-hidden animate-scale-in">
          <div className="h-1 w-full bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <form onSubmit={handleCreate} className="space-y-3 sm:grid sm:gap-4 sm:grid-cols-2 sm:space-y-0">
              <div className="sm:col-span-2">
                <Input label="Project Name" value={newName} onChange={e => setNewName(e.target.value)} autoFocus required placeholder="e.g., Website Redesign" />
              </div>
              <div className="sm:col-span-2">
                <Input label="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Brief description..." />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" disabled={createProjectMutation.isPending}>
                  {createProjectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {filteredProjects.length === 0 && !isCreating ? (
        <div className="text-center py-12 sm:py-20 border-2 border-dashed rounded-2xl bg-gradient-to-b from-card to-muted/20 border-border/50 animate-fade-in-up">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary rounded-2xl flex items-center justify-center mb-4 sm:mb-6 animate-float border border-primary/10">
            <FolderKanban className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold">No projects found</h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto px-4">
            {searchQuery ? "Try adjusting your search query." : "Get started by creating a new project."}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsCreating(true)} className="mt-6 sm:mt-8" size="lg">
              <Plus className="w-5 h-5" /> Create your first project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, idx) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card className={`h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group bg-gradient-to-br ${projectColors[idx % projectColors.length]} animate-fade-in-up`}>
                <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1 text-base sm:text-lg">{project.name}</CardTitle>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-0.5" />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pb-3 sm:pb-4 px-4 sm:px-6">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3 sm:mb-4 min-h-[32px] sm:min-h-[40px]">
                    {project.description || 'No description provided.'}
                  </p>
                  <Badge variant="outline" className="gap-1.5 font-medium text-[10px] sm:text-xs">
                    <Users className="w-3 h-3" />
                    {project.members?.length || 1} {project.members?.length === 1 ? 'member' : 'members'}
                  </Badge>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-[10px] sm:text-xs text-muted-foreground border-t border-border/30 pt-3 sm:pt-4 bg-muted/5 px-4 sm:px-6 pb-3 sm:pb-4">
                  <span>Created {format(new Date(project.created_at || new Date()), 'MMM d, yyyy')}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all duration-200" 
                    onClick={(e) => handleDelete(project.id, e)}
                    disabled={deleteProjectMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
