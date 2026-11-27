# ABESEC Bulletin (Department-wise Digital Notice Board)

A full-stack web application built for **ABESEC Ghaziabad** so students and faculty can view and manage department-wise notices in one place instead of checking multiple WhatsApp groups or physical notice boards.

## Live Links

- **Live Website (Render):** https://dept-digi-notice-board.onrender.com/
- **API Health Check:** https://dept-digi-notice-board.onrender.com/api/health
- **GitHub Repository:** https://github.com/devuphub/Dept-Digi-Notice-board

## Login Credentials

### Main Admin & Student Login
- **Admin Username:** `admin`
- **Admin Password:** `Admin@123`
- **Student Username:** `student`
- **Student Password:** `Student@123`

### All Available User Roles

| Role | Department | Username | Password | What They Can Do |
| :--- | :--- | :--- | :--- | :--- |
| Admin | All | `admin` | `Admin@123` | Add/edit/pin/delete notices in any department, upload files, add new departments |
| Faculty | CSE | `faculty_cse` | `Faculty@123` | Post, edit, pin, and delete notices for CSE and General |
| Faculty | IT | `faculty_it` | `Faculty@123` | Post, edit, pin, and delete notices for IT and General |
| Faculty | ECE | `faculty_ece` | `Faculty@123` | Post, edit, pin, and delete notices for ECE and General |
| Student | CSE | `student` | `Student@123` | View notices, filter by dept/year, bookmark notices, mark notices as read |
| Student | IT | `student_it` | `Student@123` | View notices, bookmark notices, mark notices as read |
| Student | ECE | `student_ece` | `Student@123` | View notices, bookmark notices, mark notices as read |

## What the Portal Does

- Separates notices by department (`General`, `CSE`, `IT`, `ECE`, `EN`, `ME`, `MCA`) with light color coding on each card.
- Lets students search by keyword and filter by category (`Academic`, `Exam`, `Placement`, `Events`, `Circular`, `Holiday`), priority (`Urgent`, `Important`, `Normal`), and target year.
- Allows Admin and Faculty to attach PDF or image circulars (up to 5 MB) and pin important notices to the top.
- Tracks views, saved bookmarks, and read acknowledgements for logged-in users.

## Tech Stack

- **Frontend:** React 18, Vite, Lucide Icons, CSS
- **Backend:** Node.js, Express
- **Auth & Uploads:** JWT (`jsonwebtoken`), `bcryptjs`, `multer`
- **Data Storage:** JSON file storage (`server/data/db.json`) with automatic initial seed data
- **Hosting:** Render Web Service (`render.yaml`)

## Running Locally

```bash
npm install
npm run build
npm start
```

The server starts on `http://localhost:5000` and serves both the API and the React frontend.

## Project Team

- **Developed & Maintained By:** Dev Prakash Upadhyay, Bhaskar Pandey (B.Tech CSE-15)
- **Team:** Full Stack Development Team
- © 2026 ABESEC Ghaziabad. All Rights Reserved.
