import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { getDateColor, getDateLabel, formatDate } from '../utils/dateUtils';
import {
  ArrowLeft, Plus, Users, UserPlus, UserMinus,
  Trash2, Edit2, X
} from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assignedTo: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      const [projRes, tasksRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}`),
        api.get('/auth/users')
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setAllUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/tasks', { ...taskForm, project: id });
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assignedTo: '' });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchAll();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchAll();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await api.post(`/projects/${id}/members`, { userId });
      fetchAll();
    } catch (err) {
      console.error('Add member failed:', err);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      fetchAll();
    } catch (err) {
      console.error('Remove member failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-center py-16 text-surface-400">Project not found</div>;
  }

  const nonMembers = allUsers.filter(u =>
    !project.members.some(m => m._id === u._id)
  );

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1 text-surface-400 hover:text-white text-sm mb-2"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </button>
          <h1 className="text-2xl font-bold text-white">{project.title}</h1>
          <p className="text-surface-400 mt-1">{project.description || 'No description'}</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setShowMemberModal(true)}
                className="flex items-center gap-2 px-3 py-2 border border-surface-700 text-surface-300 hover:bg-surface-800 rounded-lg text-sm"
              >
                <UserPlus size={14} />
                Members
              </button>
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium"
              >
                <Plus size={16} />
                Add Task
              </button>
            </>
          )}
        </div>
      </div>

      {/* team members */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-4">
        <h2 className="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2">
          <Users size={14} />
          Team ({project.members.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          {project.members.map(member => (
            <div key={member._id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-800 rounded-full text-sm">
              <div className="w-5 h-5 rounded-full bg-primary-600/30 flex items-center justify-center text-xs text-primary-400 font-bold">
                {member.name.charAt(0)}
              </div>
              <span className="text-surface-300">{member.name}</span>
              {user?.role === 'admin' && (
                <button
                  onClick={() => handleRemoveMember(member._id)}
                  className="text-surface-500 hover:text-red-400 ml-1"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* tasks list */}
      <div>
        {(() => {
          const isAdmin = user?.role === 'admin';
          const myTasks = tasks.filter(t => t.assignedTo?._id === user?.id);
          const teamTasks = tasks.filter(t => t.assignedTo?._id !== user?.id);
          const canEditStatus = (task) => isAdmin || task.assignedTo?._id === user?.id;

          const renderTask = (task) => (
            <div
              key={task._id}
              className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center gap-4 hover:border-surface-700"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-white truncate">{task.title}</h3>
                  <PriorityBadge priority={task.priority} />
                </div>
                <div className="flex items-center gap-3 text-xs text-surface-500">
                  {task.assignedTo && (
                    <span>→ {task.assignedTo.name}</span>
                  )}
                  {task.dueDate && (
                    <span className={getDateColor(task.dueDate)}>
                      {getDateLabel(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>

              {canEditStatus(task) ? (
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              ) : (
                <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  task.status === 'done' ? 'bg-emerald-500/15 text-emerald-400' :
                  task.status === 'in-progress' ? 'bg-primary-500/15 text-primary-400' :
                  'bg-surface-700/50 text-surface-400'
                }`}>
                  {task.status === 'todo' ? 'To Do' : task.status === 'in-progress' ? 'In Progress' : 'Done'}
                </span>
              )}

              {isAdmin && (
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-1.5 text-surface-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );

          if (isAdmin) {
            return (
              <>
                <h2 className="text-lg font-semibold text-white mb-3">
                  Tasks ({tasks.length})
                </h2>
                <div className="space-y-2">
                  {tasks.map(renderTask)}
                  {tasks.length === 0 && (
                    <div className="text-center py-12 text-surface-500">
                      No tasks in this project yet
                    </div>
                  )}
                </div>
              </>
            );
          }

          return (
            <>
              {/* my tasks */}
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                My Tasks
                <span className="text-sm font-normal text-surface-400">({myTasks.length})</span>
              </h2>
              <div className="space-y-2 mb-8">
                {myTasks.map(renderTask)}
                {myTasks.length === 0 && (
                  <div className="text-center py-8 text-surface-500 bg-surface-900 border border-surface-800 rounded-xl">
                    No tasks assigned to you in this project
                  </div>
                )}
              </div>

              {/* team tasks */}
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                Team Tasks
                <span className="text-sm font-normal text-surface-400">({teamTasks.length})</span>
              </h2>
              <div className="space-y-2">
                {teamTasks.map(renderTask)}
                {teamTasks.length === 0 && (
                  <div className="text-center py-8 text-surface-500 bg-surface-900 border border-surface-800 rounded-xl">
                    No other tasks in this project
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </div>

      {/* create task modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">New Task</h2>
              <button onClick={() => setShowTaskModal(false)} className="text-surface-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg mb-4 text-sm">{error}</div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Task name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-20"
                  placeholder="Brief description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Assign To</label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Unassigned</option>
                  {project.members.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 py-2.5 border border-surface-700 text-surface-300 rounded-lg hover:bg-surface-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* add member modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Add Member</h2>
              <button onClick={() => setShowMemberModal(false)} className="text-surface-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {nonMembers.length > 0 ? (
              <div className="space-y-2">
                {nonMembers.map(u => (
                  <div key={u._id} className="flex items-center justify-between px-3 py-2 bg-surface-800 rounded-lg">
                    <div>
                      <p className="text-sm text-white">{u.name}</p>
                      <p className="text-xs text-surface-500">{u.email}</p>
                    </div>
                    <button
                      onClick={() => handleAddMember(u._id)}
                      className="text-xs px-3 py-1 bg-primary-600 hover:bg-primary-500 text-white rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-500 text-sm text-center py-4">All users are already members</p>
            )}

            <button
              onClick={() => setShowMemberModal(false)}
              className="w-full mt-4 py-2 border border-surface-700 text-surface-300 rounded-lg hover:bg-surface-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
