import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

type Project = { id: string; name: string; description: string; created_at: string };

export const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/projects`);
      setProjects(data.projects);
    } catch (err: any) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    try {
      const { data } = await axios.post(`${API_URL}/projects`, { name: newName, description: newDesc });
      setProjects([...projects, data]);
      setNewName('');
      setNewDesc('');
      setIsCreating(false);
    } catch (err) {
      setError('Failed to create project');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(`${API_URL}/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading projects...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <Button onClick={() => setIsCreating(true)}><Plus className="w-4 h-4 mr-2" /> New Project</Button>
      </div>
      
      {error && <div className="p-4 mb-6 bg-destructive/10 text-destructive rounded-md">{error}</div>}

      {isCreating && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Project Name" value={newName} onChange={e => setNewName(e.target.value)} autoFocus required />
              <Input label="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 && !isCreating ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
          <h3 className="mt-2 text-sm font-semibold">No projects</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new project.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card className="h-full hover:border-primary/50 transition-colors flex flex-col group">
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {project.description || 'No description provided.'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
                  <span>Created {format(new Date(project.created_at), 'MMM d, yyyy')}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive" onClick={(e) => handleDelete(project.id, e)}>
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
