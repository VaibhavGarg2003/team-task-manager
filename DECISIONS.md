# Technical Decisions

This document explains the key technical choices made during development.

---

## Why MongoDB over PostgreSQL?

- **Flexible schema** — During rapid development, schema changes are frequent. MongoDB lets you iterate on models without running migrations.
- **Natural fit for this data** — Projects have arrays of members, tasks have nested references. Document-based storage maps cleanly to these relationships.
- **Free tier** — MongoDB Atlas offers a generous free tier (512 MB) which is perfect for this app's scale.
- **Mongoose ODM** — Provides schema validation and population (joins) when needed, giving us the best of both worlds.

## How Role-Based Access Works

- Each user has a `role` field: `admin` or `member`
- Two middleware layers protect routes:
  1. **`auth.js`** — Verifies the JWT token and attaches user to the request
  2. **`role.js`** — Checks if the user's role is in the allowed list
- Routes stack these: `router.post('/', auth, role('admin'), createProject)`
- **Member restrictions**: Members can only update the `status` field on tasks assigned to them. The controller explicitly checks `task.assignedTo === req.user._id` and rejects other field updates.

## Why Monorepo (Single Deployment)?

- In production, Express serves the React build (`client/dist/`) as static files
- This means **one Railway deployment** instead of two, reducing complexity and cost
- Eliminates CORS issues in production — API and frontend share the same origin
- The Vite dev server proxies `/api` requests to the backend during development

## Why JWT over Sessions?

- **Stateless** — No server-side session storage needed
- **Simple** — Token is stored in localStorage, sent in Authorization header
- **Scalable** — Works with any number of server instances without shared state
- 7-day expiry balances security with usability

## What I Would Add With More Time

1. **WebSocket notifications** — Real-time alerts when tasks are assigned or updated
2. **Kanban board** — Drag-and-drop task management view
3. **File attachments** — Upload documents to tasks
4. **Email notifications** — Notify users when assigned to a task
5. **Task comments** — Discussion thread on each task
6. **User profile editing** — Change name, password, avatar
7. **Automated tests** — Jest for API testing, React Testing Library for components
8. **Rate limiting** — Prevent API abuse with express-rate-limit
