# 🚌 Bus Tracking & Management System

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Backend-black?logo=express)
![MySQL](https://img.shields.io/badge/MySQL-Database-blue?logo=mysql)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-black?logo=socketdotio)
![License](https://img.shields.io/badge/License-Educational-orange)

A **web-based bus management and tracking system** that allows administrators, drivers, and parents to monitor bus routes, schedules, and real-time locations.

The system provides **GPS tracking**, **route management**, **schedule management**, and **real-time notifications** through an intuitive web interface.

This project was developed by a **team of 3 members** as part of a software engineering project.

---

# 🚀 Features

## 👤 User Management

* User registration and login using **JWT authentication**
* Role-based access control
* Profile management
* Secure password hashing

## 🚌 Bus Management

* Add / edit / delete buses
* Manage bus information (license plate, capacity, model)
* Assign drivers to buses
* Track bus status (active, maintenance)

## 🗺 Route Management

* Create and manage bus routes
* Manage bus stops
* View routes on an interactive map

## 📅 Schedule Management

* Weekly bus schedules
* Assign buses and drivers to routes
* Update and manage schedule changes

## 🛰 Real-time Bus Tracking

* Real-time GPS tracking using **Socket.io**
* Interactive map using **Leaflet**

## 🔔 Notification System

* Receive notifications when buses approach stops
* Admin broadcast notifications
* Store notification history

---

# 🔐 User Roles

## 👨‍💼 Admin

* Manage users
* Manage buses and drivers
* Manage routes and schedules
* View reports

## 🚐 Driver

* View assigned schedules
* Update GPS location
* Report vehicle status
* View students on the bus

## 👨‍👩‍👧 Parent

* Track bus location in real time
* Receive notifications
* View student information

---

# 🏗 System Architecture

```
Frontend (JavaScript / Web UI)
        │
        ▼
REST API (Node.js + Express)
        │
        ▼
MySQL Database
        │
        ▼
Realtime Tracking (Socket.io + GPS)
```

---

# 🛠 Tech Stack

| Technology              | Usage                   |
| ----------------------- | ----------------------- |
| Node.js                 | Backend runtime         |
| Express.js              | Backend framework       |
| MySQL                   | Database                |
| Socket.io               | Real-time communication |
| Leaflet                 | Map visualization       |
| React                   | Frontend                |

---

# ⚙️ Installation

## 1️⃣ Requirements

* Node.js 18+
* MySQL Server
* Git

---

## 2️⃣ Clone Repository

```bash
git clone https://github.com/tuanPeo27/BUS_CODE.git
cd QuanLyXeBustest
```

---

## 3️⃣ Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

---

## 4️⃣ Setup Database

Create database:

```sql
CREATE DATABASE QuanLyXeBuyt;
```

Import initial data:

```bash
mysql -u root -p QuanLyXeBuyt < backend/database/init.sql
```

---

## 5️⃣ Environment Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Example configuration:

```
PORT=5000
DB_NAME=bus_tracking
DB_USER=root
DB_PASS=yourpassword
DB_HOST=localhost
JWT_SECRET=bus_tracking_secret
```

---

## 6️⃣ Run the Application

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd frontend
npm run dev
```

---

## 7️⃣ Access the System

Frontend:

```
http://localhost:3000
```

Backend API:

```
http://localhost:5000/api
```

---

# 👤 Demo Accounts

### Admin

```
Username: admin1
Password: 654321
```

### Driver

```
Email: driver1
Password: 654321
```

### Parent

```
Email: parent1
Password: 654321
```

---

# 📡 API Documentation

## Authentication

```
POST /api/user/login
POST /api/user/forgotpass
POST /api/user/create/admin
DELETE /api/user/delete/:id
```

---

## Student API

```
GET /api/students
GET /api/students/:id
GET /api/students/parent/:id
POST /api/students/create
PUT /api/students/edit/:id
DELETE /api/students/delete/:id
```

---

## Bus API

```
GET /api/buses
POST /api/buses/create
PUT /api/buses/edit/:id
DELETE /api/buses/delete/:id
```

---

## Route API

```
GET /api/routes
GET /api/routes/:id
POST /api/routes/create
PUT /api/routes/edit/:id
DELETE /api/routes/delete/:id
```

---

## Driver API

```
GET /api/drivers
GET /api/drivers/:id
POST /api/drivers/create
PUT /api/drivers/edit/:id
DELETE /api/drivers/delete/:id
```

---

## Parent API

```
GET /api/parents
GET /api/parents/:id
POST /api/parents/create
PUT /api/parents/edit/:id
DELETE /api/parents/delete/:id
```

---

## Schedule API

```
GET /api/schedules
GET /api/schedules/:id
GET /api/schedules/driver/:driverId
GET /api/schedules/student/:studentId
POST /api/schedules/create
PUT /api/schedules/edit/:id
DELETE /api/schedules/delete/:id
```

---

# 🛠 Troubleshooting

### Cannot connect to database

* Check `.env` configuration
* Ensure MySQL service is running
* Verify database credentials

### Server cannot start

Check Node version and reinstall dependencies:

```
rm -rf node_modules package-lock.json
npm install
```

### API not responding

* Test API using Postman
* Check backend console logs
* Verify request URL and method

---

# 🔧 Useful Commands

Check if port is used:

```
netstat -ano | findstr :3000
```

Restart MySQL (Windows):

```
net stop mysql80
net start mysql80
```

---

# ⭐ Support

If you find this project useful, please consider giving it a **star ⭐ on GitHub**.

Repository:

```
https://github.com/tuanPeo27/BUS_CODE
```
