# 🎫 Nebula - Event Ticket Management Platform

<div align="center">
  
  **A full-stack event management platform with QR code ticket validation, real-time scanning, and role-based access control.**
  
  [![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1.5-6DB33F?logo=spring)](https://spring.io/projects/spring-boot)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://www.postgresql.org/)
  [![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=json-web-tokens)](https://jwt.io/)
  [![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
  
</div>

---

## 📋 **Table of Contents**
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📋 Prerequisites](#-prerequisites)
- [🚀 Quick Start](#-quick-start)

---

## ✨ **Features**

### 🎫 **For Users**
- 🔍 Browse and discover events with pagination
- 📅 Book tickets for multiple events
- 📱 Generate QR code tickets instantly
- 📋 View all your bookings in one place
- 🔔 Real-time notifications when tickets are scanned
- ❌ Cancel bookings if plans change

### 👑 **For Admins**
- ➕ Create and manage events with image upload
- 👥 View all users and their roles
- 📊 Monitor all bookings across the platform
- ✅ Track ticket checkers and their activity
- 🗑️ Delete events (with booking validation)

### ✅ **For Ticket Checkers**
- 📷 Scan QR tickets at venue entrance using camera
- ⚡ Instant validation with visual feedback
- 🔊 Success sound effect on valid tickets
- ℹ️ See ticket details (event name, attendee name)
- 🚫 Automatic detection of already-used tickets
- 📈 Quick stats dashboard

### 🔐 **Security & Authentication**
- 🔑 JWT-based authentication
- 👤 Role-based access control (USER, ADMIN, TICKET_CHECKER)
- 🔒 Secure password encryption with BCrypt
- 🛡️ Protected API endpoints

### 🎨 **User Experience**
- 📱 Fully responsive design for mobile and desktop
- 🌈 Beautiful gradient themes (pink, orange, yellow)
- ✨ Smooth animations and transitions
- 🔄 Real-time polling for ticket status
- ❌ User-friendly error messages

---

## 🛠️ **Tech Stack**

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://reactjs.org/) | 18.2.0 | UI library |
| [React Router DOM](https://reactrouter.com/) | 6.20.0 | Navigation and routing |
| [Tailwind CSS](https://tailwindcss.com/) | 3.3.6 | Styling and responsive design |
| [Axios](https://axios-http.com/) | 1.6.2 | API calls and HTTP requests |
| [html5-qrcode](https://www.npmjs.com/package/html5-qrcode) | 2.3.8 | QR code scanning in browser |
| [qrcode.react](https://www.npmjs.com/package/qrcode.react) | 3.1.0 | QR code generation |
| [Vite](https://vitejs.dev/) | 5.0.0 | Build tool and development server |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| [Spring Boot](https://spring.io/projects/spring-boot) | 3.1.5 | Java framework |
| [Spring Security](https://spring.io/projects/spring-security) | 6.1.5 | Authentication & authorization |
| [JWT](https://jwt.io/) | 0.11.5 | Token-based authentication |
| [PostgreSQL](https://www.postgresql.org/) | 15 | Database |
| [JPA/Hibernate](https://hibernate.org/) | 6.2.13 | ORM for database operations |
| [Maven](https://maven.apache.org/) | 3.9.0 | Build tool and dependency management |
| [Lombok](https://projectlombok.org/) | 1.18.30 | Reduce boilerplate code |

---

## 📋 **Prerequisites**

Before you begin, ensure you have installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Java JDK** (17 or higher) - [Download](https://www.oracle.com/java/technologies/javase-downloads.html)
- **PostgreSQL** (15 or higher) - [Download](https://www.postgresql.org/download/)
- **Maven** (3.9 or higher) - [Download](https://maven.apache.org/download.cgi)
- **Git** - [Download](https://git-scm.com/downloads)

---

## 🚀 **Quick Start**

### **1. Clone the repository**
```bash
git clone https://github.com/VISHALRG03/Nebula-Event-Ticket-Platfrom.git
cd Nebula-Event-Ticket-Platfrom


--------------------------------------------------------------------------
# 2. Database Setup
# Open PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE eventdb;

# Exit PostgreSQL
\q

--------------------------------------------------------------------------

# 3. Backend Setup

Configure application.properties
Edit backend/src/main/resources/application.properties:

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/eventdb
spring.datasource.username=postgres
spring.datasource.password=your_password

# JWT Configuration
jwt.secret-key=9Fh7Kp2LxQw8MZ5aR3eT1YVJmC0N4B6SxR8JH2UQmP7YdC
jwt.token-expiration=86400000

# File Upload
file.upload-dir=uploads/events/
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
spring.servlet.multipart.file-size-threshold=2KB

# JPA Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
----------------------------------------------------------------------------------

Run Backend
cd backend

# On Windows:
./mvnw spring-boot:run

# On Linux/Mac:
./mvnw spring-boot:run
Backend will start at http://localhost:8080

-----------------------------------------------------------------------------------
# 4. Frontend Setup

In VsCode,  Install Dependencies
cd frontend
npm install


Configure Environment
Create frontend/.env:
env
VITE_API_URL=http://localhost:8080/api


Run Frontend in terminal
npm run dev
Frontend will start at http://localhost:5173

--------------------------------------------------------------------------------
# 5. Access the Application
Frontend: http://localhost:5173

Backend API: http://localhost:8080/api



Note for Checkerpage  open in differnt browser to scan 
