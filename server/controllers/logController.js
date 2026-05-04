const ActivityLog = require('../models/ActivityLog');

exports.getLogs = async (req, res) => {
  try {
    const { project, limit = 50 } = req.query;
    let query = {};

    if (project) query.project = project;

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email')
      .populate('project', 'title')
      .populate('task', 'title')
      .sort('-createdAt')
      .limit(parseInt(limit));

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
