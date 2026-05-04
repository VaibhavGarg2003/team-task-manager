import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Plus, Users, FolderKanban, Trash2, X } from 'lucide-react';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/projects', form);
      setShowModal(false);
      setForm({ title: '', description: '' });
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-surface-400 mt-1">{projects.length} projects total</p>
        </div>
        {user?.role === 'admin' && (
          <button
            id="create-project-btn"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium"
          >
            <Plus size={16} />
            New Project
          </button>
        )}
      </div>

      {/* project grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => {
          const progress = project.taskCounts.total > 0
            ? Math.round((project.taskCounts.done / project.taskCounts.total) * 100)
            : 0;

          return (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="group bg-surface-900 border border-surface-800 rounded-xl p-5 hover:border-primary-600/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center">
                  <FolderKanban size={20} className="text-primary-400" />
                </div>
                {user?.role === 'admin' && (
                  <button
                    onClick={(e) => { e.preventDefault(); handleDelete(project._id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-surface-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-primary-400">
                {project.title}
              </h3>
              <p className="text-surface-400 text-sm mb-4 line-clamp-2">
                {project.description || 'No description'}
              </p>

              {/* progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-surface-400">Progress</span>
                  <span className="text-surface-300 font-medium">{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-800 rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* footer stats */}
              <div className="flex items-center justify-between text-xs text-surface-500">
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  {project.members?.length || 0} members
                </div>
                <div className="flex items-center gap-3">
                  <span>{project.taskCounts.todo} todo</span>
                  <span>{project.taskCounts['in-progress']} active</span>
                  <span>{project.taskCounts.done} done</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-16 text-surface-500">
          <FolderKanban size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No projects yet</p>
          {user?.role === 'admin' && <p className="text-sm mt-1">Create one to get started</p>}
        </div>
      )}

      {/* create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">New Project</h2>
              <button onClick={() => setShowModal(false)} className="text-surface-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Project name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-24"
                  placeholder="Brief description..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-surface-700 text-surface-300 rounded-lg hover:bg-surface-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
