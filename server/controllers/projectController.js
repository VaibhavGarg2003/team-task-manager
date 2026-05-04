const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

exports.getProjects = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = {};
    } else {
      query = { members: req.user._id };
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort('-createdAt');

    // attach task counts per project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { $match: { project: project._id } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const counts = { todo: 0, 'in-progress': 0, done: 0, total: 0 };
        taskCounts.forEach(t => {
          counts[t._id] = t.count;
          counts.total += t.count;
        });

        return { ...project.toObject(), taskCounts: counts };
      })
    );

    res.json(projectsWithCounts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // admin or project member can access
    if (req.user.role !== 'admin' && !project.members.some(m => m._id.equals(req.user._id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: members || []
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'created_project',
      details: `Created project "${title}"`,
      project: project._id
    });

    const populated = await project.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'members', select: 'name email' }
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'updated_project',
      details: `Updated project "${project.title}"`,
      project: project._id
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // cascade delete tasks
    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      user: req.user._id,
      action: 'deleted_project',
      details: `Deleted project "${project.title}"`
    });

    res.json({ message: 'Project and its tasks deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push(userId);
    await project.save();

    const populated = await project.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'members', select: 'name email' }
    ]);

    await ActivityLog.create({
      user: req.user._id,
      action: 'added_member',
      details: `Added a member to "${project.title}"`,
      project: project._id
    });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.members = project.members.filter(m => m.toString() !== req.params.userId);
    await project.save();

    const populated = await project.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'members', select: 'name email' }
    ]);

    await ActivityLog.create({
      user: req.user._id,
      action: 'removed_member',
      details: `Removed a member from "${project.title}"`,
      project: project._id
    });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
