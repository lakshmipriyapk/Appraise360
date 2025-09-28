# Production-Ready Setup Guide

## 🚀 Real-World Project Setup

### **Step 1: Database Setup (MySQL)**

1. **Install MySQL** (if not already installed)
2. **Create Database:**
   ```sql
   CREATE DATABASE springapp;
   USE springapp;
   ```

3. **Verify Database Connection:**
   - Host: localhost
   - Port: 3306
   - Database: springapp
   - Username: root
   - Password: root

### **Step 2: Backend Setup (Spring Boot)**

1. **Navigate to Backend:**
   ```bash
   cd springapp
   ```

2. **Install Dependencies:**
   ```bash
   mvn clean install
   ```

3. **Start Backend:**
   ```bash
   mvn spring-boot:run
   ```

4. **Verify Backend is Running:**
   - Open: http://localhost:8080/api/users
   - Should return JSON array of users

### **Step 3: Frontend Setup (Angular)**

1. **Navigate to Frontend:**
   ```bash
   cd angularapp
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start Frontend:**
   ```bash
   npm start
   ```

4. **Verify Frontend is Running:**
   - Open: http://localhost:4200
   - Should show the application

### **Step 4: Database Tables Creation**

The backend will automatically create these tables:
- `user` - User accounts
- `employee_profile` - Employee information
- `goal` - Employee goals
- `feedback` - Employee feedback
- `appraisal` - Performance appraisals

### **Step 5: Test the Application**

1. **Login** with existing user credentials
2. **Create Employee Profile** - Should save to database
3. **Create Goals** - Should save to database
4. **Add Self Feedback** - Should save to database

## 🔧 Troubleshooting

### **Backend Issues:**
- **Port 8080 in use:** Change port in `application.properties`
- **Database connection failed:** Check MySQL is running
- **Tables not created:** Restart backend

### **Frontend Issues:**
- **Port 4200 in use:** Change port in `package.json`
- **API calls failing:** Check backend is running
- **CORS errors:** Backend has CORS enabled

### **Database Issues:**
- **Connection refused:** Start MySQL service
- **Access denied:** Check username/password
- **Database not found:** Create database manually

## 📋 Production Checklist

- ✅ MySQL database created and running
- ✅ Backend starts without errors
- ✅ Frontend starts without errors
- ✅ Database tables created automatically
- ✅ API endpoints responding correctly
- ✅ Frontend can connect to backend
- ✅ All CRUD operations working

## 🎯 Expected Results

### **Success Messages:**
- "Goal saved to database successfully!"
- "Self feedback saved to database successfully!"
- "Profile created and saved to database successfully!"

### **No Error Messages:**
- ❌ "Database save failed, but goal saved locally"
- ❌ "Database save failed, but self feedback saved locally"
- ❌ "Backend not accessible"

## 🚀 Quick Start Commands

```bash
# Terminal 1 - Backend
cd springapp
mvn spring-boot:run

# Terminal 2 - Frontend  
cd angularapp
npm start

# Test URLs
# Backend: http://localhost:8080/api/users
# Frontend: http://localhost:4200
```

This setup ensures your application works like a real-world production system with proper database persistence.
