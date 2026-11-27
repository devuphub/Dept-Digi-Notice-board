# ABESEC Bulletin — Department-wise Digital Notice Board (ABESEC Ghaziabad)

A clean, full-stack **Department-wise Digital Notice Board** built for **ABESEC Ghaziabad** to streamline official academic, examination, placement, event, and circular announcements across departments.

## Live Deployment (Render)

- **Deployed Render URL:** https://dept-digi-notice-board.onrender.com/
- **Health Check Endpoint:** https://dept-digi-notice-board.onrender.com/api/health
- **GitHub Repository:** https://github.com/devuphub/Dept-Digi-Notice-board

---

## Login Credentials (All Available Roles)

| Role | Scope / Permissions | Username | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Full access across all departments (create, edit, pin, delete notices, add departments) | `admin` | `Admin@123` |
| **Faculty / Coordinator (CSE)** | Publish, edit, pin, and delete notices for **CSE** and **General** | `faculty_cse` | `Faculty@123` |
| **Faculty / Coordinator (IT)** | Publish, edit, pin, and delete notices for **IT** and **General** | `faculty_it` | `Faculty@123` |
| **Faculty / Coordinator (ECE)** | Publish, edit, pin, and delete notices for **ECE** and **General** | `faculty_ece` | `Faculty@123` |
| **Student (CSE)** | Browse, search, filter, save/bookmark, and acknowledge notices | `student` | `Student@123` |
| **Student (IT)** | Browse, search, filter, save/bookmark, and acknowledge notices | `student_it` | `Student@123` |
| **Student (ECE)** | Browse, search, filter, save/bookmark, and acknowledge notices | `student_ece` | `Student@123` |

### Required Summary Credentials
- **Admin Username:** `admin`
- **Admin Password:** `Admin@123`
- **Student Username:** `student`
- **Student Password:** `Student@123`

---

## Features

- **Department-wise Channels:** Dedicated notice boards for `General`, `CSE`, `IT`, `ECE`, `EN`, `ME`, and `MCA`, plus Admin ability to add new departments.
- **Role-Based Access Control:** JWT authentication with `bcryptjs` password hashing for **Admin**, **Faculty / Department Coordinator**, and **Student** roles.
- **Search & Multi-Filter Toolbar:** Filter notices by Department, Category (`Academic`, `Exam`, `Placement`, `Events`, `Circular`, `Holiday`), Priority (`Urgent`, `Important`, `Normal`), Target Year, Keyword Search, and Saved Bookmarks.
- **Pinning & Engagement:** Pin urgent notices to the top, track view counts, attach PDF/image circulars (`multer`), bookmark notices, and mark notices as Read / Acknowledged.
- **Clean Responsive UI:** Built with React + Vite and served seamlessly alongside the Express API on a single port for one-click Render deployment.

---

## Tech Stack

- **Frontend:** React 18, Vite, Lucide Icons, Custom CSS Design System
- **Backend:** Node.js, Express, JWT (`jsonwebtoken`), `bcryptjs`, `multer`
- **Deployment:** Render Web Service (`render.yaml` included)

---

## Local Development

```bash
# Install dependencies
npm install

# Run backend API (port 5000)
npm run dev:server

# Run frontend dev server (port 5173, proxies /api to 5000)
npm run dev:client

# Production build & start (single server on port 5000)
npm run build
npm start
```

---

## Team & Mentorship

- **Member 1:** Dev Upadhyay
- **Member 2:** Bhaskar Pandey
- **Mentor:** Ashish Bajpai Sir
- **Institution:** ABESEC Ghaziabad
- **© 2026 ABESEC Ghaziabad. All Rights Reserved.**
