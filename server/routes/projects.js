const express = require('express');
const { body } = require('express-validator');
const {
  getProjects, getProject, createProject,
  updateProject, deleteProject, addMember, removeMember
} = require('../controllers/projectController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', auth, getProjects);
router.get('/:id', auth, getProject);

router.post('/', auth, role('admin'), [
  body('title').trim().notEmpty().withMessage('Project title is required'),
  validate
], createProject);

router.put('/:id', auth, role('admin'), [
  body('title').trim().notEmpty().withMessage('Project title is required'),
  validate
], updateProject);

router.delete('/:id', auth, role('admin'), deleteProject);

router.post('/:id/members', auth, role('admin'), [
  body('userId').notEmpty().withMessage('User ID is required'),
  validate
], addMember);

router.delete('/:id/members/:userId', auth, role('admin'), removeMember);

module.exports = router;
