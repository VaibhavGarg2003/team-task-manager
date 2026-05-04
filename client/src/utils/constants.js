export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done'
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const STATUS_CONFIG = {
  'todo': { label: 'To Do', color: 'bg-surface-600', textColor: 'text-surface-300' },
  'in-progress': { label: 'In Progress', color: 'bg-primary-600', textColor: 'text-primary-300' },
  'done': { label: 'Done', color: 'bg-success', textColor: 'text-success' }
};

export const PRIORITY_CONFIG = {
  'low': { label: 'Low', color: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400' },
  'medium': { label: 'Medium', color: 'bg-amber-500/20 text-amber-400', dot: 'bg-amber-400' },
  'high': { label: 'High', color: 'bg-red-500/20 text-red-400', dot: 'bg-red-400' }
};
