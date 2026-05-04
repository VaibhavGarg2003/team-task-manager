import { useState, useEffect } from 'react';
import api from '../utils/api';
import { timeAgo } from '../utils/dateUtils';
import {
  Activity, FolderKanban, ListTodo, UserPlus,
  Trash2, Edit2, CheckCircle2
} from 'lucide-react';

const actionIcons = {
  created_project: FolderKanban,
  updated_project: Edit2,
  deleted_project: Trash2,
  created_task: ListTodo,
  updated_task: Edit2,
  deleted_task: Trash2,
  added_member: UserPlus,
  removed_member: Trash2,
  updated_status: CheckCircle2
};

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/logs?limit=100');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load logs:', err);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity Log</h1>
        <p className="text-surface-400 mt-1">Track all actions across your projects</p>
      </div>

      <div className="bg-surface-900 border border-surface-800 rounded-xl divide-y divide-surface-800">
        {logs.map(log => {
          const Icon = actionIcons[log.action] || Activity;

          return (
            <div key={log._id} className="flex items-start gap-4 p-4">
              <div className="w-8 h-8 rounded-full bg-primary-600/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={14} className="text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-surface-300">
                  <span className="font-medium text-white">{log.user?.name || 'Unknown'}</span>
                  {' '}{log.details}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-surface-500">{timeAgo(log.createdAt)}</span>
                  {log.project && (
                    <span className="text-xs text-primary-400/60">{log.project.title}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {logs.length === 0 && (
          <div className="text-center py-16 text-surface-500">
            <Activity size={48} className="mx-auto mb-4 opacity-30" />
            <p>No activity yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
