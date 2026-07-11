# 🏛️ Director's Office Portal
### The LNM Institute of Information Technology (LNMIIT), Jaipur

![React](https://img.shields.io/badge/React-18.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black)
![Render](https://img.shields.io/badge/Backend-Render-purple)

---

## 🌐 Live Demo

| | URL |
|---|---|
| **Frontend (Live)** | https://dop-portal-final.vercel.app |
| **Backend API** | https://dop-portal-final.onrender.com |

---

## 📌 Project Overview

The **Director's Office Portal (DOP Portal)** is a full-stack web application developed during the Practice School-I (PS-I) internship at LNMIIT, Jaipur (June–July 2026). It digitizes and streamlines the administrative operations of the Director's Office — replacing manual, paper-based processes with a secure, role-based digital platform.

The system supports **four distinct user roles**, each with a customized dashboard and access level:

| Role | Access | Key Responsibilities |
|------|--------|---------------------|
| **Director** | Minimal  | Final approvals, view calendar, post announcements |
| **Secretary** | Full access | Manage all office operations |
| **Faculty / Staff** | Limited | Submit requests, view public info |
| **External Visitor** | Public only | Self-register for campus visits |

---

## 👩‍💻 Team

| Name | Roll No. | Branch | Role |
|------|----------|--------|------|
| Harshita Rathore | 2024Btech178 | B.Tech CSE | Frontend Development (React.js) |
| Garv Sharma | 2024Btech029 | B.Tech CS/AI | Backend Development (Node.js, MySQL) |

**External Supervisor:** Dr. Saurabh Kumar, LNMIIT, Jaipur

---

## ⚙️ Tech Stack

### Frontend
- **React.js** (Create React App)
- **React Router DOM v7** — Role-based routing and navigation
- **Axios** — HTTP client with JWT interceptor
- **@hello-pangea/dnd** — Drag and drop for Kanban task board
- **Deployed on:** Vercel (auto-deploys on every GitHub push)

### Backend
- **Node.js + Express.js** — REST API server
- **MySQL** — Relational database (hosted on Aiven)
- **JWT (JSON Web Token)** — Authentication and role-based access control
- **Multer** — File upload handling
- **Nodemailer + Brevo** — Email notifications
- **Deployed on:** Render

---

## 🗂️ Repository Structure

```
DOP-Portal-Final/
│
├── Frontend/                        # React.js frontend application
│   ├── src/
│   │   ├── pages/                   # All 20+ page components
│   │   │   ├── Login.js
│   │   │   ├── ForgotPassword.js
│   │   │   ├── OTPVerification.js
│   │   │   ├── ResetPassword.js
│   │   │   ├── VisitorRegister.js
│   │   │   ├── SecretaryDashboard.js
│   │   │   ├── DirectorDashboard.js
│   │   │   ├── Calendar.js
│   │   │   ├── Requests.js
│   │   │   ├── Visitors.js
│   │   │   ├── Documents.js
│   │   │   ├── Tasks.js
│   │   │   ├── Settings.js
│   │   │   ├── Announcements.js
│   │   │   ├── Notifications.js
│   │   │   ├── Reports.js
│   │   │   ├── AuditLogs.js
│   │   │   ├── Communications.js
│   │   │   ├── StaffPortal.js
│   │   │   └── NotFound.js
│   │   ├── assets/                  # LNMIIT logo, campus images
│   │   ├── hooks/
│   │   │   └── useNotifCount.js     # Custom hook for notification badge
│   │   ├── api.js                   # Axios instance with JWT interceptor
│   │   └── App.js                   # All routes with ProtectedRoute guards
│   └── package.json
│
├── backend/                         # Node.js + Express.js backend
│   ├── controllers/                 # Business logic
│   │   ├── auth.controller.js
│   │   ├── calendar.controller.js
│   │   ├── meeting.controller.js
│   │   ├── visitor.controller.js
│   │   ├── document.controller.js
│   │   ├── task.controller.js
│   │   ├── announcement.controller.js
│   │   └── notification.controller.js
│   ├── routes/                      # API route definitions
│   │   ├── auth.routes.js
│   │   ├── calendar.routes.js
│   │   ├── meeting.routes.js
│   │   ├── visitor.routes.js
│   │   ├── document.routes.js
│   │   ├── task.routes.js
│   │   ├── announcement.routes.js
│   │   └── notification.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verification
│   │   └── role.middleware.js       # Role-based access control
│   ├── config/
│   │   └── db.js                    # MySQL database connection
│   └── server.js                    # Express app entry point
│
└── README.md                        # This file
```

---

## ✨ Features

### 🔐 Authentication
- Secure login with JWT tokens
- Role-based routing — each role lands on their own dashboard
- Forgot Password with OTP email verification
- Institutional email restriction (@lnmiit.ac.in only, except visitors)

### 📋 Meeting Request Management
- Faculty/Staff submit meeting requests with purpose, date, time, priority
- Secretary can Approve, Reject (with reason), Reschedule, or add Internal Notes
- Director has full Approve/Reject/Reschedule access
- Rejection reason emailed to requester
- Internal notes visible only to Secretary and Director

### 📅 Calendar
- Month, Week, and List view modes
- Color-coded events: 🟢 Public | 🟡 Internal | 🔴 Confidential
- Role-based visibility: Staff sees Internal/Confidential events as "🔒 Busy" blocks only
- Secretary/Director can Add, Edit, Reschedule, and Delete events
- Task deadlines shown alongside events

### 📁 Document Management
- Upload documents with category, version, and access level
- Access levels: Public (all) | Internal (staff+) | Confidential (Secretary/Director only)
- Full version history — uploading v2.0 keeps v1.0 in history
- Google Docs viewer integration for PDF preview

### 👥 Visitor Management
- External visitors self-register via public 3-step form
- Staff can register visitors they personally invite
- Secretary/Director approve or reject visitor appointments
- Digital entry pass generation with LNMIIT branding (printable)

### ✅ Task Management
- Kanban board with three columns: Pending | In Progress | Completed
- Drag and drop tasks between columns
- Task deadlines shown on the Calendar

### 📢 Announcements
- Secretary and Director can create, pin, and delete announcements
- Director can post announcements directly from the topbar on their dashboard
- All roles can view announcements

### 🔔 Notifications
- Real-time notification bell with unread count badge
- Notifications triggered on new events, meeting approvals/rejections, new announcements
- Mark as read functionality

### 🕵️ Audit Logs
- Complete log of all important actions in the system
- Visible to Secretary and Director only

### ⚙️ Settings & User Management
- Profile and password update for all roles
- User Management tab (Secretary only): Add users, assign roles, activate/deactivate
- Director cannot access User Management (security by design)

---

## 🔒 Security Features

- JWT token required for all private API routes
- Role-based access control (RBAC) enforced on both frontend and backend
- Confidential calendar events never sent to Staff/Faculty (backend-level restriction)
- Internal Notes on requests never exposed to requesters
- Director locked out of User Management (Secretary-only admin privilege)
- Visitor list filtered — Staff sees only their own invited visitors

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /auth/login | Public | Login and receive JWT token |
| POST | /auth/forgot-password | Public | Request OTP for password reset |
| POST | /auth/verify-otp | Public | Verify OTP |
| POST | /auth/reset-password | Public | Reset password |
| GET | /meetings/all | Secretary, Director | Get all meeting requests |
| GET | /meetings/my | All logged-in | Get own submitted requests |
| POST | /meetings/request | All logged-in | Submit new meeting request |
| PUT | /meetings/:id/approve | Secretary, Director | Approve request |
| PUT | /meetings/:id/reject | Secretary, Director | Reject request with reason |
| PUT | /meetings/:id/reschedule | Secretary, Director | Reschedule request |
| PUT | /meetings/:id/notes | Secretary, Director | Save internal notes |
| GET | /events/full | Secretary, Director | All events with full details |
| GET | /events/staff | Staff | All events, sensitive fields hidden |
| GET | /events/public | All | Public events only |
| POST | /events | Secretary, Director | Create new event |
| PUT | /events/:id | Secretary, Director | Edit event |
| DELETE | /events/:id | Secretary, Director | Delete event |
| GET | /visitors/today | Secretary, Director | Today's visitor appointments |
| POST | /visitors/request | Public, Staff | Submit visitor appointment |
| PUT | /visitors/:id/approve | Secretary, Director | Approve visitor |
| PUT | /visitors/:id/reject | Secretary, Director | Reject visitor |
| GET | /documents | Role-filtered | Get documents by access level |
| POST | /documents/upload | Secretary, Director | Upload new document |
| GET | /documents/:id/versions | All | Get version history |
| POST | /documents/:id/version | Secretary, Director | Upload new version |
| DELETE | /documents/:id | Secretary, Director | Delete document |
| GET | /tasks | All | Get tasks by status |
| POST | /tasks | Secretary, Director | Create new task |
| PUT | /tasks/:id | Secretary, Director | Update task |
| GET | /announcements | All | Get all announcements |
| POST | /announcements | Secretary, Director | Create announcement |
| DELETE | /announcements/:id | Secretary, Director | Delete announcement |
| GET | /user/notifications | All | Get notifications |
| PUT | /user/notifications/:id/read | All | Mark notification as read |
| GET | /audit-logs | Secretary, Director | Get audit log entries |
| GET | /users | Secretary | Get all users |
| POST | /users | Secretary | Create new user |
| PUT | /users/:id/status | Secretary | Activate/deactivate user |

---

## 🗄️ Database Schema (Key Tables)

```sql
users           (id, name, email, password, role, department, status)
meeting_requests(id, requester_name, department, purpose, preferred_date,
                 preferred_time, priority, status, internal_notes,
                 rejection_reason, created_at)
events          (id, title, description, start_time, end_time, type,
                 visibility, created_by, notes, participants)
visitors        (id, name, email, organization, purpose, visit_date,
                 visit_time, approval_status, invited_by, pass_number)
documents       (id, title, category, access_level, version, file_path,
                 uploaded_by, upload_date)
document_versions(id, document_id, version, notes, file_path, upload_date)
tasks           (id, title, description, status, assigned_to, deadline,
                 created_by, created_at)
announcements   (id, title, content, category, priority, created_by,
                 is_pinned, created_at)
notifications   (id, user_id, message, type, read_status, created_at)
audit_logs      (id, user_id, action, details, created_at)
```

---

## 📦 Deployment

### Frontend — Vercel
- Root Directory: `Frontend/`
- Framework: Create React App
- Build Command: `CI=false react-scripts build`
- Auto-deploys on every push to `main` branch
- **Live:** https://dop-portal-final.vercel.app

### Backend — Render
- Environment: Node.js
- Start Command: `node server.js`
- Environment variables configured in Render dashboard
- **API Base:** https://dop-portal-final.onrender.com

### Database — Aiven (MySQL Cloud)
- Managed MySQL instance
- SSL connection enabled
- Connection string configured via environment variables
  
---

## 📄 License

This project was developed as part of the Practice School-I internship at LNMIIT, Jaipur under JK Lakshmipat University's PS-I program. All rights reserved © 2026 Harshita Rathore & Garv Sharma.
