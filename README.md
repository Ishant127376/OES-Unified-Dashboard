# Unified IoT Dashboard – Omkar Energy Solutions (OES)

A full-stack IoT management dashboard built as part of the internship evaluation for **Omkar Energy Solutions (OES)**.  
The project follows the **Unified IoT Dashboard – DRD v1.0** and focuses on secure access control, device management, and backend integrity.

---

## Key Features

- 🔐 **JWT Authentication** with bcrypt password hashing  
- 👑 **Admin Role**: Full access (users, devices, assignments)  
- 👤 **Sub-User Role**: View-only access to assigned devices  
- 🔢 **Mandatory 10-digit Device Serial Numbers** (unique & immutable)  
- 🗄 **MongoDB-based backend** with structured collections  
- 🔒 RBAC enforced at both **UI and API level**

---

## Tech Stack

- **Frontend**: React / Next.js  
- **Backend**: Node.js, Express  
- **Database**: MongoDB  
- **Auth**: JWT, bcrypt  

---

## Local Setup

```bash
git clone https://github.com/Ishant127376/OES-Unified-Dashboard.git
cd OES-Unified-Dashboard
npm install
npm run dev

Create .env.local:

MONGODB_URI=mongodb://localhost:27017/oes_dashboard
JWT_SECRET=your_secret_key
```

RBAC Overview

Admin

Manage users & devices

Assign devices to sub-users

Full system visibility

Sub-User

View-only dashboard

Access limited to assigned devices

Project Walkthrough

Admin & Device Management
https://www.loom.com/share/66771e52e1a94eaa9e1093dd81848a86

RBAC & Sub-User Restrictions
https://www.loom.com/share/c911fbd442174269a4cfc4e78fe3a1cc

Backend Integrity & Final UI
https://www.loom.com/share/70d4954743fd490ba4f397c610ef4231

DRD Compliance

User Roles & Access Control (Section 2.1) ✅

10-digit Device Identification (Section 3.1) ✅

Database & Backend Design (Section 8.1) ✅

Author: Ishant Singh
B.Tech CSE, Thapar University

