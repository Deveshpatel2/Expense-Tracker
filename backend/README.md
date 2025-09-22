# Expense Tracker Backend

A Spring Boot REST API backend for the Expense Tracker application.

## Features

- **User Authentication**: JWT-based authentication with registration, login, guest users, and Google sign-in
- **Expense Management**: CRUD operations for expenses with filtering and search
- **Multi-currency Support**: Support for multiple currencies
- **Statistics**: Expense totals, averages, and category breakdowns
- **Security**: Spring Security with JWT tokens
- **Database**: H2 in-memory database (configurable for MySQL/PostgreSQL)

## Technology Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security**
- **Spring Data JPA**
- **H2 Database** (in-memory)
- **JWT** (JSON Web Tokens)
- **Maven**

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/guest` - Create guest user
- `POST /api/auth/google` - Google sign-in

### Expenses
- `GET /api/expenses` - Get all expenses (with filtering)
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/{id}` - Get expense by ID
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Statistics
- `GET /api/expenses/statistics/totals` - Get totals by currency
- `GET /api/expenses/statistics/averages` - Get averages by currency
- `GET /api/expenses/statistics/categories` - Get totals by category
- `GET /api/expenses/statistics/counts` - Get counts by category

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd expense-tracker-backend
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### Database Access
- H2 Console: `http://localhost:8080/api/h2-console`
- JDBC URL: `jdbc:h2:mem:expensetracker`
- Username: `sa`
- Password: `password`

## Configuration

### Application Properties
The application uses `application.yml` for configuration:

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:h2:mem:expensetracker
    driver-class-name: org.h2.Driver
    username: sa
    password: password

jwt:
  secret: mySecretKey123456789012345678901234567890
  expiration: 86400000 # 24 hours
```

### CORS Configuration
The application is configured to allow requests from:
- `http://localhost:3000`
- `http://localhost:3004`

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Expense
```bash
curl -X POST http://localhost:8080/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "description": "Grocery Shopping",
    "amount": 85.50,
    "category": "Food & Dining",
    "expenseDate": "2024-01-15",
    "notes": "Weekly groceries",
    "currency": "USD"
  }'
```

### Get Expenses
```bash
curl -X GET http://localhost:8080/api/expenses \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Project Structure

```
src/main/java/com/expensetracker/
├── config/                 # Configuration classes
├── controller/             # REST controllers
├── dto/                    # Data Transfer Objects
├── entity/                 # JPA entities
├── repository/             # JPA repositories
├── security/               # Security configuration
├── service/                # Business logic services
└── util/                   # Utility classes
```

## Development

### Adding New Features
1. Create entity classes in `entity/` package
2. Create repository interfaces in `repository/` package
3. Create service classes in `service/` package
4. Create controller classes in `controller/` package
5. Add DTOs in `dto/` package for request/response objects

### Testing
Run tests with:
```bash
mvn test
```

## Deployment

### Production Configuration
For production deployment, update the `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/expensetracker
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
```

### Environment Variables
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT secret key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
