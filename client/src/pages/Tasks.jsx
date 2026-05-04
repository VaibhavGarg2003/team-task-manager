import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { getDateColor, getDateLabel } from '../utils/dateUtils';
import { Search, Filter, ListTodo } from 'lucide-react';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects')
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchData();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // client-side filtering
  const filtered = tasks.filter(task => {
    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && task.status !== statusFilter) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    if (projectFilter && task.project?._id !== projectFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All Tasks</h1>
        <p className="text-surface-400 mt-1">{filtered.length} of {tasks.length} tasks</p>
      </div>

      {/* search and filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            id="task-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-900 border border-surface-800 rounded-lg text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-surface-900 border border-surface-800 rounded-lg text-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2.5 bg-surface-900 border border-surface-800 rounded-lg text-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-3 py-2.5 bg-surface-900 border border-surface-800 rounded-lg text-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>{p.title}</option>
          ))}
        </select>

        {(search || statusFilter || priorityFilter || projectFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setProjectFilter(''); }}
            className="px-3 py-2.5 text-xs text-surface-400 hover:text-white border border-surface-800 rounded-lg hover:bg-surface-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* task list */}
      {(() => {
        const isAdmin = user?.role === 'admin';
        const myFiltered = filtered.filter(t => t.assignedTo?._id === user?.id);
        const teamFiltered = filtered.filter(t => t.assignedTo?._id !== user?.id);
        const canEditStatus = (task) => isAdmin || task.assignedTo?._id === user?.id;

        const renderTask = (task) => (
          <div
            key={task._id}
            className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center gap-4 hover:border-surface-700"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-sm font-medium text-white">{task.title}</h3>
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-surface-500">
                {task.project && (
                  <span className="text-primary-400/70">{task.project.title}</span>
                )}
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

            {canEditStatus(task) && (
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            )}
          </div>
        );

        const emptyState = (
          <div className="text-center py-16 text-surface-500">
            <ListTodo size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No tasks found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        );

        if (isAdmin) {
          return (
            <div className="space-y-2">
              {filtered.map(renderTask)}
              {filtered.length === 0 && emptyState}
            </div>
          );
        }

        return (
          <>
            {/* my tasks */}
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              My Tasks
              <span className="text-sm font-normal text-surface-400">({myFiltered.length})</span>
            </h2>
            <div className="space-y-2 mb-8">
              {myFiltered.map(renderTask)}
              {myFiltered.length === 0 && (
                <div className="text-center py-8 text-surface-500 bg-surface-900 border border-surface-800 rounded-xl">
                  No tasks assigned to you
                </div>
              )}
            </div>

            {/* team tasks */}
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              Team Tasks
              <span className="text-sm font-normal text-surface-400">({teamFiltered.length})</span>
            </h2>
            <div className="space-y-2">
              {teamFiltered.map(renderTask)}
              {teamFiltered.length === 0 && (
                <div className="text-center py-8 text-surface-500 bg-surface-900 border border-surface-800 rounded-xl">
                  No team tasks found
                </div>
              )}
            </div>
          </>
        );
      })()}
    </div>
  );
};

export default Tasks;
