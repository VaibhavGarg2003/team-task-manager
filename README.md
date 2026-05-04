# 🚀 TaskFlow — Team Task Manager

A full-stack web application for team project management with role-based access control, real-time dashboards, and activity tracking. Built with Node.js, React, and MongoDB.

🔗 **Live Demo:** [Website](https://team-task-manager-production-7baa.up.railway.app)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Secure signup/login with JWT tokens and hashed passwords |
| 👥 **Role-Based Access** | Admin (full control) and Member (view + update own tasks) |
| 📁 **Project Management** | Create projects, add/remove team members, track progress |
| ✅ **Task Tracking** | Create, assign, update status, set priority and due dates |
| 📊 **Dashboard** | Interactive charts — tasks by status (pie) and progress per project (bar) |
| 🔍 **Search & Filter** | Search tasks by name, filter by status/priority/project |
| 📝 **Activity Log** | Timeline of all actions — who did what and when |
| 🎨 **Dark/Light Mode** | Toggle between dark and light themes |
| 📱 **Responsive** | Works on desktop, tablet, and mobile |
| 🏷️ **Priority Levels** | Low / Medium / High with color-coded badges |
| ⏰ **Due Date Alerts** | Color-coded: 🔴 overdue, 🟡 due soon, 🟢 upcoming |

---

## 🧪 Test Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@test.com` | `password123` |
| **Member** | `member@test.com` | `password123` |
| **Member** | `priya@test.com` | `password123` |

> The app comes pre-seeded with 3 projects, 12 tasks, and activity history so you can explore immediately.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT + bcrypt.js |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Validation** | express-validator |
| **Deployment** | Railway |

---

## 📂 Project Structure

```
├── server/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers (auth, projects, tasks, dashboard, logs)
│   ├── middleware/       # Auth, role-check, validation
│   ├── models/          # Mongoose schemas (User, Project, Task, ActivityLog)
│   ├── routes/          # API route definitions
│   ├── seed.js          # Database seeder with test data
│   └── server.js        # Express server entry point
├── client/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth and Theme state management
│   │   ├── pages/       # Dashboard, Projects, Tasks, Activity, Login, Signup
│   │   └── utils/       # API client, date helpers, constants
│   └── index.html
├── DECISIONS.md          # Technical decisions and trade-offs
└── README.md
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register user |
| `POST` | `/api/auth/login` | Public | Login, returns JWT |
| `GET` | `/api/auth/me` | Auth | Current user info |
| `GET` | `/api/auth/users` | Auth | List all users |

### Projects
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/projects` | Auth | List projects |
| `POST` | `/api/projects` | Admin | Create project |
| `GET` | `/api/projects/:id` | Member | Project details |
| `PUT` | `/api/projects/:id` | Admin | Update project |
| `DELETE` | `/api/projects/:id` | Admin | Delete project + tasks |
| `POST` | `/api/projects/:id/members` | Admin | Add member |
| `DELETE` | `/api/projects/:id/members/:userId` | Admin | Remove member |

### Tasks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tasks` | Auth | List tasks (filterable) |
| `POST` | `/api/tasks` | Admin | Create task |
| `PUT` | `/api/tasks/:id` | Auth* | Update task |
| `DELETE` | `/api/tasks/:id` | Admin | Delete task |

> *Members can only update the status of tasks assigned to them.

### Dashboard & Logs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard` | Auth | Aggregated stats for charts |
| `GET` | `/api/logs` | Auth | Activity timeline |

---

## ⚡ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/VaibhavGarg2003/team-task-manager.git
cd team-task-manager

# 2. Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and JWT secret

# 3. Install dependencies
cd server && npm install
cd ../client && npm install

# 4. Seed the database
cd ../server && node seed.js

# 5. Start the backend (terminal 1)
npm run dev

# 6. Start the frontend (terminal 2)
cd ../client && npm run dev
```

Frontend: `http://localhost:3000` → Backend: `http://localhost:5000`

---

## 🚀 Deployment (Railway)

1. Push code to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Connect your GitHub repo
4. Set environment variables:
   - `MONGO_URL` — your MongoDB Atlas connection string
   - `JWT_SECRET` — any secure random string
   - `NODE_ENV` — `production`
   - `PORT` — `5000`
5. Railway auto-detects the root `package.json` and deploys

---

## 👤 Author

**Vaibhav Garg**
- GitHub: [@VaibhavGarg2003](https://github.com/VaibhavGarg2003)
- Email: mailvaibhavgarg2003@gmail.com
