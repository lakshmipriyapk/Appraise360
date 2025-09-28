# Backend Connectivity Fix Guide

## Problem
The Angular frontend is showing "Backend not accessible" errors when trying to connect to the Spring Boot backend.

## Solution Steps

### 1. Start the Spring Boot Backend
```bash
# Option 1: Use the batch file
start-backend.bat

# Option 2: Manual command
cd springapp
mvn spring-boot:run
```

**Verify backend is running:**
- Open browser and go to: http://localhost:8080/api/users
- You should see JSON data with user information
- If you see data, the backend is working correctly

### 2. Start the Angular Frontend with Proxy
```bash
# Option 1: Use the batch file
start-frontend.bat

# Option 2: Manual command
cd angularapp
npm start
```

**Important:** The Angular app must be started with the proxy configuration to forward API calls to the backend.

### 3. Verify Configuration

#### Backend Configuration (springapp/src/main/resources/application.properties)
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/springapp
spring.datasource.username=root
spring.datasource.password=root
```

#### Frontend Proxy Configuration (angularapp/proxy.conf.json)
```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

#### Frontend Environment (angularapp/src/environments/environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: '/api' // <- relative path so proxy forwards
};
```

### 4. Troubleshooting

#### If backend is not accessible:
1. **Check if Spring Boot is running:**
   - Go to http://localhost:8080/api/users
   - Should return JSON data

2. **Check MySQL database:**
   - Make sure MySQL is running on localhost:3306
   - Database name: springapp
   - Username: root, Password: root

3. **Check CORS configuration:**
   - CORS is already configured in SecurityConfig.java
   - Allows all origins for development

#### If frontend shows "Backend not accessible":
1. **Make sure you're using the proxy:**
   - Use `npm start` (which now includes proxy config)
   - Don't use `ng serve` directly

2. **Check browser console:**
   - Open Developer Tools (F12)
   - Look for network errors in Console tab
   - Check if API calls are being made to `/api/...`

3. **Verify proxy is working:**
   - In browser, go to http://localhost:4200/api/users
   - Should return the same data as http://localhost:8080/api/users

### 5. Testing the Fix

1. Start backend: `start-backend.bat`
2. Start frontend: `start-frontend.bat`
3. Open browser: http://localhost:4200
4. Try to create a goal, submit feedback, or edit profile
5. Check browser console for any remaining errors

### 6. Alternative Solutions

If the proxy still doesn't work, you can try:

#### Option A: Direct API calls (temporary fix)
Update `angularapp/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api' // Direct URL
};
```

#### Option B: Disable CORS in browser (development only)
Start Chrome with disabled security:
```bash
chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security --disable-features=VizDisplayCompositor
```

## Expected Result
After following these steps, you should see:
- ✅ Backend is accessible, found X users (in console)
- No more "Backend not accessible" error messages
- Successful API calls for goals, feedback, and profile updates
