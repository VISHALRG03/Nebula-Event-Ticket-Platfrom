#  Nebula - Event Ticket Management Platform

<div align="center">
  
  ![Nebula Logo](https://via.placeholder.com/200x100/ff0057/ffffff?text=Nebula+🎫)
  
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
- [🚀 Installation](#-installation)
- [📁 Project Structure](#-project-structure)
- [🔌 API Endpoints](#-api-endpoints)
- [🎯 Usage Guide](#-usage-guide)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)
- [📧 Contact](#-contact)

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
- 🗑️ Delete events when needed

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
- 📱 Responsive design for mobile and desktop
- 🌈 Beautiful gradient themes (pink, orange, yellow)
- ✨ Smooth animations and transitions
- 🔄 Real-time polling for ticket status
- ❌ Error handling with user-friendly messages

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
- **IDE** (VS Code, IntelliJ IDEA, or Eclipse)

---

## 🚀 **Installation**

### **1. Clone the repository**
```bash
git clone https://github.com/VISHALRG03/Nebula-Event-Ticket-Platfrom.git
cd Nebula-Event-Ticket-Platfrom
```

### **2. Database Setup (PostgreSQL)**

Open pgAdmin or psql and create a database:

```sql
CREATE DATABASE eventdb;
```

### **3. Backend Configuration**

Edit `backend/src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/eventdb
spring.datasource.username=postgres
spring.datasource.password=your_password

# JWT Configuration
jwt.secret-key=your_secret_key_here_min_32_chars_long
jwt.token-expiration=86400000

# File Upload
file.upload-dir=uploads/events/
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
```

### **4. Run the Backend**

```bash
cd backend

# On Windows
./mvnw spring-boot:run

# On Linux/Mac
./mvnw spring-boot:run
```

The backend will start at `http://localhost:8080`

### **5. Frontend Setup**

Install all frontend dependencies:

```bash
cd frontend
npm install
```

This installs:
- `react`, `react-router-dom` - Core libraries
- `axios` - API calls
- `html5-qrcode` - QR scanning
- `qrcode.react` - QR generation
- `tailwindcss` - Styling

### **6. Configure Frontend API URL**

Create `.env` file in `frontend` folder:

```env
VITE_API_URL=http://localhost:8080/api
```

### **7. Start the Frontend**

```bash
npm run dev
```

The frontend will start at `http://localhost:5173`

### **8. Access the Application**

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8080
- **Database**: PostgreSQL on port 5432

---

## 📁 **Project Structure**

```
Nebula-Event-Ticket-Platfrom/
├── frontend/                 # React application
│   ├── src/
│   │   ├── pages/            # All page components
│   │   ├── api.js             # API calls
│   │   └── App.jsx            # Main app with routing
│   └── public/                # Static assets
│
└── backend/                   # Spring Boot application
    ├── src/
    │   ├── main/
    │   │   ├── java/          # Java source files
    │   │   └── resources/      # Configuration files
    │   └── test/               # Unit tests
    └── pom.xml                 # Maven dependencies
```

---

## 🔌 **API Endpoints**

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/events` | Get all events |
| GET | `/api/events/page/{page}` | Get paginated events |

### User Endpoints (USER role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/booking` | Book tickets |
| GET | `/api/booking/mybookings` | Get user's bookings |
| DELETE | `/api/booking/{bookingId}` | Cancel booking |
| POST | `/api/qr/generate/{bookingId}` | Generate QR codes |

### Admin Endpoints (ADMIN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/events` | Create event |
| DELETE | `/api/admin/events/{id}` | Delete event |
| GET | `/api/admin/bookings` | View all bookings |
| GET | `/api/admin/registerusers` | View all users |

### Ticket Checker Endpoints (TICKET_CHECKER role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scan/validate` | Validate QR code |
| GET | `/api/scan/status/{bookingId}` | Get ticket status |

---

## 🎯 **Usage Guide**

### **User Flow**
1. **Register/Login** to the platform
2. **Browse events** on the home page
3. **Click "Get Passes"** on any event
4. **Select number of tickets** and book
5. **Go to "My Bookings"** to view your bookings
6. **Click "Generate QR"** to create tickets
7. **Show QR code** at venue entrance

### **Admin Flow**
1. **Login with ADMIN credentials**
2. **Create new events** with images
3. **View all events** in the system
4. **Monitor all bookings** and users

### **Ticket Checker Flow**
1. **Login with TICKET_CHECKER credentials**
2. **Click "START SCANNING"** to activate camera
3. **Scan attendee's QR code**
4. **See instant validation** (success/error)

---

## 🧪 **Testing Credentials**

| Role | Email | Password |
|------|-------|----------|
| **USER** | `user@example.com` | `password123` |
| **ADMIN** | `admin@example.com` | `admin123` |
| **TICKET_CHECKER** | `checker@example.com` | `checker123` |

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 **Contact**

**VISHALRG03**
- GitHub: [@VISHALRG03](https://github.com/VISHALRG03)
- Project Link: [https://github.com/VISHALRG03/Nebula-Event-Ticket-Platfrom](https://github.com/VISHALRG03/Nebula-Event-Ticket-Platfrom)

---

<div align="center">
  
**Made with ❤️ for event lovers everywhere**

[⬆ Back to Top](#-nebula---event-ticket-management-platform)

</div>
