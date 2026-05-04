const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const ActivityLog = require('./models/ActivityLog');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB for seeding...');

    // clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await ActivityLog.deleteMany({});

    // create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });

    const member1 = await User.create({
      name: 'Rahul Sharma',
      email: 'member@test.com',
      password: 'password123',
      role: 'member'
    });

    const member2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@test.com',
      password: 'password123',
      role: 'member'
    });

    console.log('Users created');

    // create projects
    const project1 = await Project.create({
      title: 'E-Commerce Platform',
      description: 'Build a full-stack e-commerce platform with payment integration',
      createdBy: admin._id,
      members: [admin._id, member1._id, member2._id]
    });

    const project2 = await Project.create({
      title: 'Mobile App Redesign',
      description: 'Redesign the mobile app UI/UX for better user engagement',
      createdBy: admin._id,
      members: [admin._id, member1._id]
    });

    const project3 = await Project.create({
      title: 'API Documentation',
      description: 'Create comprehensive API docs for all microservices',
      createdBy: admin._id,
      members: [admin._id, member2._id]
    });

    console.log('Projects created');

    // helper for dates
    const daysFromNow = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d;
    };

    // create tasks
    const tasks = await Task.insertMany([
      // project 1 tasks
      {
        title: 'Set up product database schema',
        description: 'Design MongoDB schema for products, categories, and inventory',
        status: 'done',
        priority: 'high',
        dueDate: daysFromNow(-2),
        project: project1._id,
        assignedTo: member1._id,
        createdBy: admin._id
      },
      {
        title: 'Implement payment gateway',
        description: 'Integrate Razorpay payment gateway for checkout flow',
        status: 'in-progress',
        priority: 'high',
        dueDate: daysFromNow(3),
        project: project1._id,
        assignedTo: member1._id,
        createdBy: admin._id
      },
      {
        title: 'Build shopping cart UI',
        description: 'Create responsive cart page with quantity controls',
        status: 'todo',
        priority: 'medium',
        dueDate: daysFromNow(5),
        project: project1._id,
        assignedTo: member2._id,
        createdBy: admin._id
      },
      {
        title: 'Add product search & filters',
        description: 'Implement search by name and filter by category/price',
        status: 'todo',
        priority: 'medium',
        dueDate: daysFromNow(7),
        project: project1._id,
        assignedTo: member2._id,
        createdBy: admin._id
      },
      {
        title: 'Order confirmation emails',
        description: 'Send confirmation email after successful checkout',
        status: 'todo',
        priority: 'low',
        dueDate: daysFromNow(10),
        project: project1._id,
        assignedTo: member1._id,
        createdBy: admin._id
      },
      // project 2 tasks
      {
        title: 'User research & wireframes',
        description: 'Conduct user interviews and create low-fi wireframes',
        status: 'done',
        priority: 'high',
        dueDate: daysFromNow(-5),
        project: project2._id,
        assignedTo: member1._id,
        createdBy: admin._id
      },
      {
        title: 'Design new navigation flow',
        description: 'Simplify the app navigation based on research findings',
        status: 'in-progress',
        priority: 'high',
        dueDate: daysFromNow(2),
        project: project2._id,
        assignedTo: member1._id,
        createdBy: admin._id
      },
      {
        title: 'Create design system components',
        description: 'Build reusable UI components in Figma',
        status: 'todo',
        priority: 'medium',
        dueDate: daysFromNow(4),
        project: project2._id,
        assignedTo: member1._id,
        createdBy: admin._id
      },
      {
        title: 'Prototype testing',
        description: 'Run usability tests with 5 users on the new prototype',
        status: 'todo',
        priority: 'low',
        dueDate: daysFromNow(-1),
        project: project2._id,
        assignedTo: member1._id,
        createdBy: admin._id
      },
      // project 3 tasks
      {
        title: 'Document auth endpoints',
        description: 'Write OpenAPI specs for all authentication routes',
        status: 'done',
        priority: 'high',
        dueDate: daysFromNow(-3),
        project: project3._id,
        assignedTo: member2._id,
        createdBy: admin._id
      },
      {
        title: 'Document payment APIs',
        description: 'Create detailed docs for payment service endpoints',
        status: 'in-progress',
        priority: 'high',
        dueDate: daysFromNow(1),
        project: project3._id,
        assignedTo: member2._id,
        createdBy: admin._id
      },
      {
        title: 'Add code examples',
        description: 'Add curl and JavaScript examples for each endpoint',
        status: 'todo',
        priority: 'medium',
        dueDate: daysFromNow(6),
        project: project3._id,
        assignedTo: member2._id,
        createdBy: admin._id
      }
    ]);

    console.log('Tasks created');

    // create some activity logs
    await ActivityLog.insertMany([
      {
        user: admin._id,
        action: 'created_project',
        details: 'Created project "E-Commerce Platform"',
        project: project1._id,
        createdAt: daysFromNow(-10)
      },
      {
        user: admin._id,
        action: 'created_project',
        details: 'Created project "Mobile App Redesign"',
        project: project2._id,
        createdAt: daysFromNow(-8)
      },
      {
        user: admin._id,
        action: 'added_member',
        details: 'Added Rahul Sharma to "E-Commerce Platform"',
        project: project1._id,
        createdAt: daysFromNow(-10)
      },
      {
        user: member1._id,
        action: 'updated_task',
        details: 'Changed "Set up product database schema" status from todo to done',
        project: project1._id,
        task: tasks[0]._id,
        createdAt: daysFromNow(-2)
      },
      {
        user: member1._id,
        action: 'updated_task',
        details: 'Changed "User research & wireframes" status from in-progress to done',
        project: project2._id,
        task: tasks[5]._id,
        createdAt: daysFromNow(-5)
      },
      {
        user: member2._id,
        action: 'updated_task',
        details: 'Changed "Document auth endpoints" status from todo to done',
        project: project3._id,
        task: tasks[9]._id,
        createdAt: daysFromNow(-3)
      },
      {
        user: admin._id,
        action: 'created_task',
        details: 'Created task "Add product search & filters" in E-Commerce Platform',
        project: project1._id,
        task: tasks[3]._id,
        createdAt: daysFromNow(-1)
      }
    ]);

    console.log('Activity logs created');
    console.log('\n--- Seed Complete ---');
    console.log('Admin:  admin@test.com / password123');
    console.log('Member: member@test.com / password123');
    console.log('Member: priya@test.com / password123\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedDB();
