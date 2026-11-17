# Depósito Vieira - Construction Equipment Rental System

## 📋 Project Description

Depósito Vieira is a complete web system for managing construction equipment rentals, developed as a Database course project. The system allows customers to rent equipment, administrators to manage inventory and suppliers, and generates detailed operational reports.

## 🏗️ Project Architecture

### **Architectural Pattern**: MVC (Model-View-Controller) with Layers
- **Frontend**: Responsive web application with HTML5, CSS3, Bootstrap 5 and JavaScript
- **Backend**: RESTful API in Node.js with Express
- **Database**: PostgreSQL with triggers and procedures

### **Backend Layer Structure**
```
├── Controllers/     # Controllers - Interface between routes and services
├── Services/        # Business rules and validations
├── Repositories/    # Data access (Data Access Layer)
├── Routes/          # API route definitions
└── Config/          # Configurations (database)
```

## 🛠️ Technologies Used

### **Frontend**
- **HTML5** - Page structure
- **CSS3** - Custom styling
- **Bootstrap 5** - Responsive CSS framework
- **JavaScript (ES6+)** - Interactivity and API consumption
- **Bootstrap Icons** - Iconography
- **Google Fonts** - Typography (Playfair Display)

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **pg** - PostgreSQL driver for Node.js
- **CORS** - Cross-Origin Resource Sharing middleware

### **Database**
- **PostgreSQL** - Database management system
- **Triggers** - Process automation (inventory, calculations, payments)
- **Procedures/Functions** - Business logic in database

## 🎯 Main Features

### **For Customers**
- ✅ User registration and authentication
- ✅ Equipment catalog visualization
- ✅ Interactive shopping cart
- ✅ Rental system with daily rates and installments configuration
- ✅ Rental history (active and completed)
- ✅ Filters by rental status

### **For Administrators**
- ✅ Complete administrative panel
- ✅ CRUD for equipment, customers and suppliers
- ✅ Active rental management
- ✅ Management reporting system
- ✅ Automated inventory control

### **Available Reports**
- 📊 Customer with highest rental value
- 📊 Customers who rented all equipment
- 📊 Most rented equipment
- 📊 Total revenue per month
- 📊 Customers with overdue payments
- 📊 Equipment with below-average inventory
- 📊 Customers with active rentals

## 🗄️ Data Model

### **Main Entities**
- **CLIENTE** - Customer data (CPF, name, address, contact)
- **FORNECEDOR** - Supplier information (CNPJ, trade name, contact)
- **EQUIPAMENTO** - Equipment catalog (name, description, daily rate, inventory)
- **ALUGUEL** - Rental records (dates, installments, customer)
- **ALUGUEISATIVOS** - Currently rented equipment
- **REGISTRODEALUGUEIS** - Completed rental history
- **PAGAMENTO** - Financial control and installments

### **Advanced Database Features**
- **Automatic Triggers**:
  - Automatic rental value calculation
  - Inventory control (withdrawal/return)
  - Automatic payment generation
  - Transfer to history upon completion

## 🚀 How to Run

### **Quick Start (Recommended)**
```bash
# Grant permissions to scripts (first time only)
chmod +x *.sh

# Start the project (automatically configures database if needed)
./start.sh

# Stop the project
./stop.sh
```

> **📝 Note:** The `start.sh` script automatically detects if the database needs to be set up and runs `setup-database.sh` when necessary.

### **Database Migration**
If you already have a database called "trabalho" and want to migrate to "deposito_vieira":
```bash
# Migrate data from old database to new one
./migrate-database.sh
```

### **Prerequisites**
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Modern web browser

### **Manual Setup**

#### **Database Setup**
1. Install PostgreSQL
2. Create database: `createdb deposito_vieira`
3. Execute script: `psql -d deposito_vieira -f bd.txt`
4. Copy `Back-end/server/.env.example` to `Back-end/server/.env` and fill in the credentials (`db.js` reads it)

#### **Backend Setup**
```bash
cd Back-end/server
npm install
npm start
```
The server will run at `http://localhost:3000`

#### **Frontend Setup**
1. Open the `Front-end/index.html` file in a browser
2. Or use a local server (Live Server, http-server, etc.)

## 📁 File Structure

```
trabalho/
├── Back-end/
│   └── server/
│       ├── package.json
│       ├── server.js
│       ├── config/db.js
│       ├── controllers/      # API controllers
│       ├── services/         # Business logic
│       ├── repositories/     # Data access
│       └── routes/           # API routes
├── Front-end/
│   ├── index.html           # Main page
│   ├── css/                 # Custom styles
│   ├── html/                # Additional pages
│   └── js/                  # JavaScript scripts
├── Diagramas/               # Visual documentation
├── bd.txt                   # Database script
├── setup-database.sh        # Database setup script
├── migrate-database.sh      # Database migration script
├── start.sh                 # Startup script
├── stop.sh                  # Stop script
└── README.md
```

## 📱 User Interface

### **Responsive Design**
- Adaptive layout for desktop, tablet and mobile
- Bootstrap components for visual consistency
- Intuitive navigation with fixed navbar
- Interactive cards for equipment display

### **Main Pages**
- **Home** - Landing page with presentation
- **Equipment** - Catalog with search and filters
- **Cart** - Selected items management
- **Rentals** - History and rental status
- **Admin** - Complete administrative panel
- **Login/Register** - User authentication

## 🔄 API Endpoints

### **Main Routes**
```
/api/cliente          # Customer CRUD
/api/equipamento      # Equipment CRUD
/api/fornecedor       # Supplier CRUD
/api/aluguel          # Rental management
/api/alugueisAtivos   # Active rentals
/api/pagamento        # Financial control
/api/relatorio        # Management reports
```

## 👥 Development Team

- **Course**: Database
- **Institution**: [Your Institution]
- **Period**: 2024

## 📝 License

This project was developed for academic purposes as part of the Database course.

---

## 🎨 Preview

The system offers a modern and intuitive interface, focusing on user experience and operational efficiency. The application demonstrates advanced database concepts, including triggers, procedures and complex reports.

## 🔧 Future Improvements

### **Backend Architecture Enhancements**
- **Implement Clean Architecture**: Separate domain entities, use cases, and infrastructure
- **Add Domain-Driven Design (DDD)**: Create domain models with rich business logic
- **Implement CQRS Pattern**: Separate command and query responsibilities
- **Add Dependency Injection**: Use IoC container for better testability
- **Implement Unit of Work Pattern**: Better transaction management
- **Add Data Transfer Objects (DTOs)**: Proper data validation and transformation
- **Implement Repository Interfaces**: Abstract data access for better testing
- **Add Event-Driven Architecture**: Use domain events for decoupled communication

### **Code Quality & Testing**
- **Add Comprehensive Testing**: Unit tests, integration tests, and e2e tests
- **Implement TypeScript**: Better type safety and developer experience
- **Add Code Documentation**: JSDoc comments and API documentation
- **Implement Logging**: Structured logging with levels and correlation IDs
- **Add Error Handling**: Centralized error handling and custom exceptions
- **Code Coverage**: Implement code coverage reporting
- **Static Code Analysis**: ESLint, Prettier, and SonarQube integration

### **Frontend Modernization**
- **Migrate to React**: Component-based architecture with modern hooks
- **Implement State Management**: Redux Toolkit or Zustand for global state
- **Add TypeScript**: Type safety for frontend development
- **Component Library**: Create reusable UI components
- **Responsive Design**: Enhanced mobile-first approach
- **Progressive Web App (PWA)**: Offline capabilities and app-like experience
- **Modern Build Tools**: Vite or Webpack for optimized builds
- **Testing Framework**: Jest and React Testing Library

### **Security & Performance**
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Granular permissions system
- **API Rate Limiting**: Prevent abuse and ensure fair usage
- **Input Validation**: Comprehensive validation on both client and server
- **SQL Injection Prevention**: Parameterized queries and ORM usage
- **HTTPS Implementation**: Secure communication protocol
- **Performance Optimization**: Caching strategies and database indexing
- **CDN Integration**: Static asset delivery optimization

### **DevOps & Infrastructure**
- **Containerization**: Docker containers for consistent deployment
- **CI/CD Pipeline**: Automated testing and deployment
- **Environment Configuration**: Proper environment variable management
- **Database Migrations**: Version-controlled database schema changes
- **Monitoring & Alerting**: Application performance monitoring
- **Load Balancing**: Horizontal scaling capabilities
- **Backup Strategy**: Automated database backups and recovery
- **Infrastructure as Code**: Terraform or similar tools

### **Additional Features**
- **Real-time Notifications**: WebSocket implementation for live updates
- **Email Integration**: Automated email notifications for rentals
- **Payment Gateway**: Integration with payment processors
- **Mobile Application**: React Native or Flutter mobile app
- **Analytics Dashboard**: Advanced reporting with charts and insights
- **Multi-language Support**: Internationalization (i18n)
- **File Upload**: Equipment image management system
- **Audit Trail**: Track all system changes and user actions
