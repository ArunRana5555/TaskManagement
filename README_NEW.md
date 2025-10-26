# Task Management System - Backend

This is the backend for a Task Management System built with Node.js, Express, MongoDB, and Redis. It provides a RESTful API for user authentication and task management.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (v14 or later)
- npm (comes with Node.js)
- MongoDB (v4.4 or later)
- Redis (v6 or later)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and add the following environment variables:

```env
PORT=4000
MONGODB_URI=your_mongodb_uri_here
JWT_SECRET=your_jwt_secret_key_here
REDIS_URL=your_redis_url_here
EMAIL_USER=your_email_here
EMAIL_PASS=your_email_password_here
PUSHER_APP_ID=your_pusher_app_id_here
PUSHER_APP_KEY=your_pusher_app_key_here
PUSHER_APP_SECRET=your_pusher_app_secret_here
PUSHER_APP_CLUSTER=your_pusher_app_cluster_here
```

Replace the placeholder values with your actual configuration.

### 4. Start the Development Server

```bash
# Development mode with nodemon
npm run dev
nodemon

The server will start on the port specified in your `.env` file (default: 4000).

## API Documentation

Once the server is running, you can access the API documentation at:

```
http://localhost:4000/api-docs
```

## Available Scripts

- `npm run dev`: Start the server in development mode with nodemon
- `npm test`: Run tests (not yet implemented)

## Project Structure

```
Backend/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/           # Database models
├── routes/           # API routes
├── utils/            # Utility functions
├── .env              # Environment variables
├── index.js          # Application entry point
└── package.json      # Project dependencies
```

## Environment Variables

- `PORT`: Port on which the server will run
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `REDIS_URL`: Redis server URL
- `EMAIL_USER`: Email address for sending notifications
- `EMAIL_PASS`: Email password for sending notifications
- `PUSHER_*`: Pusher configuration for real-time updates

## Dependencies

- Express.js - Web framework
- MongoDB - Database
- Mongoose - MongoDB object modeling
- Redis - Caching and rate limiting
- JWT - Authentication
- Bcrypt - Password hashing
- Nodemailer - Email notifications
- Socket.io - Real-time updates
- Swagger UI - API documentation
