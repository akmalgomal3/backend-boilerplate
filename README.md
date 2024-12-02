
# Backend Boilerplate Documentation

## Overview
This backend boilerplate provides a scalable and modular architecture using **NestJS** for building robust APIs. It integrates with **PostgreSQL**, **Elasticsearch**, **Redis**, and **MongoDB** to handle relational data, search indexing, caching, and session management.

---

## Features
1. **Authentication**:
    - JWT-based authentication with token storage in Redis.
    - User sessions managed in MongoDB.

2. **Role-Based Access Control (RBAC)**:
    - Guards enforce role-specific access permissions.
    - Admins and Operators have different access levels.

3. **Relational Data Management**:
    - PostgreSQL stores structured data, including users and roles.

4. **Search and Analytics**:
    - Elasticsearch stores and indexes user activity logs for fast querying and analytics.

5. **Session Management**:
    - Redis manages active JWT tokens for quick validation.
    - MongoDB tracks session details, including device type and geolocation.

---

## Architecture Overview

### Tech Stack
1. **NestJS**: Framework for modular and scalable backend development.
2. **PostgreSQL**: Relational database for structured data storage.
3. **Elasticsearch**: Search and analytics engine for activity logs and querying large datasets.
4. **Redis**: In-memory key-value store for caching and session token management.
5. **MongoDB**: NoSQL database for flexible schema storage, such as session data and user activities.

### High-Level System Architecture

```plaintext
                 ┌──────────────────────────┐
                 │      Client (Web/Mobile) │
                 └────────────┬─────────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │      API Gateway   │
                    └────────────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │         NestJS Backend    │
                └────────┬────┬──────┬──────┘
                         │    │      │
       ┌─────────────────┘    │      └────────────────┐
       ▼                      ▼                       ▼
┌─────────────┐       ┌───────────────┐         ┌─────────────┐
│ PostgreSQL  │       │ Elasticsearch │         │  MongoDB    │
│   (Users)   │       │ (Activity     │         │ (Sessions)  │
└─────────────┘       │ Logs)         │         └─────────────┘
       ▲              └───────────────┘                                
       │                                              
       │                                              
       ▼                                              
┌─────────────┐                                 
│  Redis      │                                 
│  (Caching)  │                                 
│             │                                 
└─────────────┘                                 
```

---

## Database Design

### PostgreSQL
**Tables**:
1. **Users**:
    - `user_id` (Primary Key)
    - `username`
    - `password` (Hashed)
    - `email`
    - `role_id` (Enum: [Admin, Executive, Operator])
    - `full_name`
    - `active`
    - `created_by`
    - `created_at`
    - `updated_by`
    - `updated_at`
    - `is_dev`
    - `failed_login_attempts`
    - `is_banned`

### MongoDB
**Collections**:
1. **Sessions**:
    - `userId`: User's ID.
    - `username`: User's username.
    - `deviceType`: Type of device (e.g., iOS, Postman).
    - `ipAddress`: IP address of the user.
    - `email`: User's email address.
    - `loginTime`: Time when the user logged in.
    - `logoutTime`: Time when the user logged out.
    - `latitude` & `longitude`: Geolocation data.

### Elasticsearch
**Indexes**:
1. **Activity Logs**:
    - `userId`: User's ID.
    - `username`: User's username.
    - `email`: User's email address.
    - `method`: Method of action performed.
    - `endpoint`: Endpoint called.
    - `timestamp`: When the activity occurred.

---

## API Endpoints

### Authentication
| Method | Endpoint     | Description                    | Protected |
|--------|--------------|--------------------------------|-----------|
| POST   | `/login`     | Logs in a user and returns a JWT token | No        |
| POST   | `/logout`    | Logs out a user from a specific device type | Yes       |

### User Management
| Method | Endpoint            | Description                        | Protected |
|--------|---------------------|------------------------------------|-----------|
| POST   | `/register`         | Registers a new user               | No        |
| GET    | `/users`            | Fetches all users (Admin/Operator) | Yes       |
| GET    | `/user/:id`         | Fetches a user by ID               | Yes       |
| PATCH  | `/user/:id`         | Updates user information           | Yes       |

### Session Management
| Method | Endpoint            | Description                     | Protected |
|--------|---------------------|---------------------------------|-----------|
| GET    | `/banned`           | Fetches banned users (Admin)    | Yes       |
| GET    | `/logged-in`        | Fetches currently logged-in users | Yes       |

---

## Setup and Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd backend-boilerplate
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password
   DB_HOST=your_db_host
   DB_PORT=your_db_port
   DB_NAME=your_db_name

   JWT_SECRET=your_jwt_secret
   CRYPTO_SECRET=your_crypto_secret
   REDIS_HOST=your_redis_host
   REDIS_PORT=your_redis_port
   MONGODB_URL=your_mongodb_URL
   ELASTICSEARCH_URL=your_elastic_URL
   MONGODB_DBNAME=your_mongodb_name
   ```


4. **Start the Application**:
   ```bash
   npm run start:dev
   ```

---

## Error Handling
- **Authentication Errors**:
    - Missing Token: `401 Unauthorized - Bearer token needed`
    - Invalid Token: `401 Unauthorized - Unauthorized`
- **Role Errors**:
    - Forbidden Action: `403 Forbidden - Access Denied`
- **Duplicate Session**:
    - `401 Unauthorized - User already logged in`

---
