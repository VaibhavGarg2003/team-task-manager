const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');

exports.getDashboard = async (req, res) => {
  try {
    let projectFilter = {};

    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      projectFilter = { project: { $in: projectIds } };
    }

    // build match stage for aggregations
    const matchStage = projectFilter.project
      ? { project: { $in: projectFilter.project.$in } }
      : {};

    // tasks grouped by status
    const statusStats = await Task.aggregate([
      { $match: matchStage },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // overdue count
    const overdueTasks = await Task.countDocuments({
      ...projectFilter,
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() }
    });

    const totalTasks = await Task.countDocuments(projectFilter);

    // tasks per project for bar chart
    const tasksPerProject = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$project',
          total: { $sum: 1 },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } }
        }
      },
      { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'info' } },
      { $unwind: '$info' },
      { $project: { name: '$info.title', total: 1, done: 1 } }
    ]);

    // priority breakdown
    const priorityStats = await Task.aggregate([
      { $match: matchStage },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // recent activity
    const recentActivity = await ActivityLog.find()
      .populate('user', 'name')
      .sort('-createdAt')
      .limit(10);

    // upcoming deadlines (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingTasks = await Task.find({
      ...projectFilter,
      status: { $ne: 'done' },
      dueDate: { $gte: new Date(), $lte: nextWeek }
    })
      .populate('assignedTo', 'name')
      .populate('project', 'title')
      .sort('dueDate')
      .limit(5);

    // format into maps
    const statusMap = { todo: 0, 'in-progress': 0, done: 0 };
    statusStats.forEach(s => { statusMap[s._id] = s.count; });

    const priorityMap = { low: 0, medium: 0, high: 0 };
    priorityStats.forEach(p => { priorityMap[p._id] = p.count; });

    res.json({
      totalTasks,
      statusStats: statusMap,
      overdueTasks,
      tasksPerProject,
      priorityStats: priorityMap,
      recentActivity,
      upcomingTasks
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
