const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');

exports.getTasks = async (req, res) => {
  try {
    const { status, priority, project, search, assignedTo } = req.query;
    let query = {};

    // members only see tasks from their projects
    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      query.project = { $in: userProjects.map(p => p._id) };
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (project && req.user.role === 'admin') query.project = project;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) query.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'title')
      .sort('-createdAt');

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'title');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project, assignedTo } = req.body;

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title, description, status, priority, dueDate,
      project, assignedTo,
      createdBy: req.user._id
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'created_task',
      details: `Created task "${title}" in ${projectDoc.title}`,
      project,
      task: task._id
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
      { path: 'project', select: 'title' }
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // members can only update status of tasks assigned to them
    if (req.user.role === 'member') {
      if (!task.assignedTo || !task.assignedTo.equals(req.user._id)) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }
      const allowed = ['status'];
      const updates = Object.keys(req.body);
      const isValid = updates.every(key => allowed.includes(key));
      if (!isValid) {
        return res.status(403).json({ message: 'Members can only update task status' });
      }
    }

    const oldStatus = task.status;
    Object.assign(task, req.body);
    await task.save();

    // build log message
    let details = `Updated task "${task.title}"`;
    if (req.body.status && req.body.status !== oldStatus) {
      details = `Changed "${task.title}" status from ${oldStatus} to ${req.body.status}`;
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'updated_task',
      details,
      project: task.project,
      task: task._id
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
      { path: 'project', select: 'title' }
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      user: req.user._id,
      action: 'deleted_task',
      details: `Deleted task "${task.title}"`,
      project: task.project
    });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
