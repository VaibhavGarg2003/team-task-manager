import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { timeAgo, getDateColor, getDateLabel, formatDate } from '../utils/dateUtils';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import {
  ListTodo, CheckCircle2, Clock, AlertTriangle,
  TrendingUp, Activity
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CHART_COLORS = {
  todo: '#64748b',
  'in-progress': '#6366f1',
  done: '#10b981'
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  // prep chart data
  const pieData = [
    { name: 'To Do', value: data.statusStats.todo, color: CHART_COLORS.todo },
    { name: 'In Progress', value: data.statusStats['in-progress'], color: CHART_COLORS['in-progress'] },
    { name: 'Done', value: data.statusStats.done, color: CHART_COLORS.done }
  ].filter(d => d.value > 0);

  const barData = data.tasksPerProject.map(p => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name,
    Total: p.total,
    Completed: p.done
  }));

  const statCards = [
    { label: 'Total Tasks', value: data.totalTasks, icon: ListTodo, color: 'from-primary-600 to-primary-400' },
    { label: 'In Progress', value: data.statusStats['in-progress'], icon: Clock, color: 'from-blue-600 to-blue-400' },
    { label: 'Completed', value: data.statusStats.done, icon: CheckCircle2, color: 'from-emerald-600 to-emerald-400' },
    { label: 'Overdue', value: data.overdueTasks, icon: AlertTriangle, color: 'from-red-600 to-red-400' }
  ];

  return (
    <div className="space-y-6">
      {/* greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-surface-400 mt-1">Here's what's happening with your projects</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-surface-900 border border-surface-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-surface-400 text-sm">{card.label}</span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon size={16} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* pie chart */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-400" />
            Tasks by Status
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
                <Legend
                  formatter={(value) => <span className="text-surface-300 text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-surface-500">
              No tasks yet
            </div>
          )}
        </div>

        {/* bar chart */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-400" />
            Progress per Project
          </h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
                <Bar dataKey="Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Legend
                  formatter={(value) => <span className="text-surface-300 text-sm">{value}</span>}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-surface-500">
              No projects yet
            </div>
          )}
        </div>
      </div>

      {/* bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* upcoming deadlines */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={18} className="text-warning" />
            Upcoming Deadlines
          </h2>
          <div className="space-y-3">
            {data.upcomingTasks.length > 0 ? data.upcomingTasks.map(task => (
              <div key={task._id} className="flex items-center justify-between py-2 border-b border-surface-800 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-surface-200 truncate">{task.title}</p>
                  <p className="text-xs text-surface-500">{task.project?.title}</p>
                </div>
                <span className={`text-xs font-medium ml-3 whitespace-nowrap ${getDateColor(task.dueDate)}`}>
                  {getDateLabel(task.dueDate)}
                </span>
              </div>
            )) : (
              <p className="text-surface-500 text-sm">No upcoming deadlines</p>
            )}
          </div>
        </div>

        {/* recent activity */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={18} className="text-primary-400" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {data.recentActivity.length > 0 ? data.recentActivity.map(log => (
              <div key={log._id} className="flex items-start gap-3 py-2 border-b border-surface-800 last:border-0">
                <div className="w-6 h-6 rounded-full bg-primary-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity size={12} className="text-primary-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-surface-300">
                    <span className="font-medium text-surface-200">{log.user?.name}</span>
                    {' '}{log.details}
                  </p>
                  <p className="text-xs text-surface-500 mt-0.5">{timeAgo(log.createdAt)}</p>
                </div>
              </div>
            )) : (
              <p className="text-surface-500 text-sm">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
