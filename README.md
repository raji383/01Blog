# Student Blog Platform

A fullstack blogging platform for students to document their learning journey. Features user registration, posts with media, subscriptions, likes, comments, and admin moderation tools.

## Features

### Backend (Spring Boot)
- **Authentication**: JWT-based auth with role-based access (USER/ADMIN)
- **User Management**: Registration, login, profiles, subscriptions
- **Posts**: CRUD operations with media upload support
- **Interactions**: Likes, comments, notifications
- **Reports**: User reporting system for moderation
- **Admin Panel**: User and post management, report handling

### Frontend (Angular)
- **Responsive UI**: Built with Angular Material
- **Feed System**: Posts from subscribed users
- **Profile Pages**: Personal and public user profiles
- **Post Management**: Create, edit, delete posts with media
- **Admin Dashboard**: Moderation tools

## Tech Stack

- **Backend**: Java 17, Spring Boot 3.3.4, MySQL, JPA/Hibernate, JWT
- **Frontend**: Angular 21, TypeScript, Angular Material
- **Database**: MySQL 8.0
- **Build Tools**: Maven, npm

## Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8.0
- Docker (optional, for MySQL)

## Setup Instructions

### 1. Database Setup

#### Option A: Using Docker (Recommended)
```bash
# Start MySQL container
docker run --name blog-mysql \
  -e MYSQL_ROOT_PASSWORD=1234 \
  -e MYSQL_DATABASE=01blog_db \
  -v ${PWD}/mysql-data:/var/lib/mysql \
  -p 3306:3306 \
  -d mysql:latest

# Connect to MySQL
docker exec -it blog-mysql mysql -u root -p123 01blog_db
```

#### Option B: Local MySQL
- Install MySQL 8.0
- Create database: `blog_db`
- Update `backend/src/main/resources/application.properties` with your credentials

### 2. Backend Setup

```bash
cd backend

# Install dependencies
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8081`

**Default Admin Account:**
- Email: `admin@blog.com`
- Password: `admin123`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will start on `http://localhost:4200`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/profile/{username}` - Get user profile
- `POST /api/users/subscribe/{userId}` - Toggle subscription
- `GET /api/users/subscriptions` - Get subscribed users
- `GET /api/users/admin` - Get all users (Admin only)
- `DELETE /api/users/admin/{userId}` - Delete user (Admin only)

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts/feed` - Get feed posts
- `GET /api/posts/user/{username}` - Get user's posts
- `PUT /api/posts/{postId}` - Update post
- `DELETE /api/posts/{postId}` - Delete post
- `POST /api/posts/{postId}/like` - Toggle like
- `GET /api/posts/{postId}/comments` - Get post comments
- `POST /api/posts/{postId}/comments` - Add comment
- `DELETE /api/posts/comments/{commentId}` - Delete comment
- `GET /api/posts/admin` - Get all posts (Admin only)
- `DELETE /api/posts/admin/{postId}` - Delete post (Admin only)

### Reports
- `POST /api/reports` - Create report
- `GET /api/reports` - Get all reports (Admin only)

## Project Structure

```
├── backend/
│   ├── src/main/java/com/example/demo/
│   │   ├── controller/     # REST controllers
│   │   ├── model/         # JPA entities
│   │   ├── repository/    # Data repositories
│   │   ├── service/       # Business logic
│   │   ├── dto/           # Data transfer objects
│   │   ├── config/        # Configuration classes
│   │   └── clobalException/ # Global exception handling
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   ├── src/app/
│   │   ├── components/    # Angular components
│   │   ├── services/      # Angular services
│   │   ├── guards/        # Route guards
│   │   └── app.config.ts  # App configuration
│   └── src/styles.css     # Global styles
└── mysql-data/            # MySQL data volume
```

## Development

### Running Tests

```bash
# Backend tests
cd backend && ./mvnw test

# Frontend tests
cd frontend && npm test
```

### Building for Production

```bash
# Backend
cd backend && ./mvnw clean package

# Frontend
cd frontend && npm run build
```

## Security Features

- JWT token authentication
- Password encryption (BCrypt)
- Role-based access control
- CORS configuration
- Input validation
- SQL injection prevention

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.



Client
  ↓
Security Filter Chain 🔐
  ↓
Custom Filters (JWT)
  ↓
DispatcherServlet
  ↓
Controller
  ↓
Service
  ↓
Repository (DB)
  ↓
Response ↑