# Full Stack Performance Appraisal System

A comprehensive performance appraisal system built with Angular frontend and Spring Boot backend.

## Project Structure

```
FullStack-PerformaceAppraisal/
├── angularapp/          # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── component/    # Angular components
│   │   │   ├── service/      # Angular services
│   │   │   ├── model/        # TypeScript models
│   │   │   └── guards/       # Route guards
│   │   └── assets/           # Static assets
│   ├── package.json
│   └── angular.json
└── springapp/           # Spring Boot backend application
    ├── src/main/java/
    │   └── com/example/springapp/
    │       ├── controller/   # REST controllers
    │       ├── service/      # Business logic services
    │       ├── repository/   # Data access layer
    │       ├── model/        # JPA entities
    │       └── config/       # Configuration classes
    ├── src/main/resources/
    │   └── application.properties
    └── pom.xml
```

## Features

### Frontend (Angular)
- Employee dashboard
- Performance appraisal management
- Goal setting and tracking
- Feedback system
- Review cycle management
- User authentication and authorization
- Responsive design

### Backend (Spring Boot)
- RESTful API endpoints
- JPA/Hibernate for data persistence
- Spring Security for authentication
- Swagger documentation
- Comprehensive CRUD operations

## Technologies Used

### Frontend
- Angular 17+
- TypeScript
- HTML5/CSS3
- Angular Material (if used)

### Backend
- Spring Boot 3.x
- Spring Data JPA
- Spring Security
- H2/MySQL Database
- Maven
- Swagger/OpenAPI

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Angular CLI
- Java 17 or higher
- Maven 3.6+

### Running the Backend (Spring Boot)

1. Navigate to the springapp directory:
   ```bash
   cd springapp
   ```

2. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   Or on Windows:
   ```bash
   mvnw.cmd spring-boot:run
   ```

3. The backend will be available at `http://localhost:8080`

### Running the Frontend (Angular)

1. Navigate to the angularapp directory:
   ```bash
   cd angularapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

4. The frontend will be available at `http://localhost:4200`

## API Documentation

Once the Spring Boot application is running, you can access the Swagger documentation at:
`http://localhost:8080/swagger-ui.html`

## Database

The application uses an embedded H2 database by default. Database configuration can be modified in `springapp/src/main/resources/application.properties`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes
5. Push to the branch
6. Create a Pull Request

## License

This project is licensed under the MIT License.
