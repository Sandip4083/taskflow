import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Trash2, Search, FolderKanban, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

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
    if (!confirm('Are you sure you want to delete this project?')) return;
    deleteProjectMutation.mutate(id);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground h-full flex items-center justify-center">Loading projects...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <FolderKanban className="h-8 w-8 text-primary" />
            Projects
          </h1>
          <p className="text-muted-foreground mt-1">Manage your team's workspaces and task boards.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              className="pl-9 bg-card" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreating(true)}><Plus className="w-4 h-4 mr-2" /> New Project</Button>
        </div>
      </div>
      
      {error && <div className="p-4 mb-6 bg-destructive/10 text-destructive rounded-md border border-destructive/20">Failed to load projects</div>}

      {isCreating && (
        <Card className="mb-8 border-primary/20 shadow-md">
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input label="Project Name" value={newName} onChange={e => setNewName(e.target.value)} autoFocus required />
              </div>
              <div className="md:col-span-2">
                <Input label="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" disabled={createProjectMutation.isPending}>
                  {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {filteredProjects.length === 0 && !isCreating ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-card border-border/50">
          <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="mt-2 text-lg font-semibold">No projects found</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            {searchQuery ? "Try adjusting your search query." : "Get started by creating a new project to organize your tasks."}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsCreating(true)} className="mt-6">
              Create your first project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map(project => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all flex flex-col group bg-card">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start gap-2">
                    <span className="line-clamp-1">{project.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 min-h-[60px]">
                    {project.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md w-fit border border-border/50">
                    <Users className="w-3.5 h-3.5" />
                    {project.members?.length || 1} {project.members?.length === 1 ? 'member' : 'members'}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/50 pt-4 bg-muted/10">
                  <span>Created {format(new Date(project.created_at || new Date()), 'MMM d, yyyy')}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-opacity" 
                    onClick={(e) => handleDelete(project.id, e)}
                    disabled={deleteProjectMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
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
