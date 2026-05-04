const express = require('express');
const { body } = require('express-validator');
const { getTasks, getTask, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', auth, getTasks);
router.get('/:id', auth, getTask);

router.post('/', auth, role('admin'), [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('project').notEmpty().withMessage('Project is required'),
  validate
], createTask);

router.put('/:id', auth, [
  body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  validate
], updateTask);

router.delete('/:id', auth, role('admin'), deleteTask);

module.exports = router;
