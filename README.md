
# Backend Application Documentation

## Table of Contents
- [Introduction](#introduction)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Testing](#testing)


---

## Introduction
This is the backend of an application that ensures single-session login in each device type, desktop or mobile using session that stored in [MongoDB](https://www.mongodb.com/). Built using [NestJS](https://nestjs.com/) and [PostgreSQL](https://www.postgresql.org/), it serves as the backbone for secure and efficient data management.

## List Feature
- **Role Management**
   - List Role
   - Update Role
   - Delete Role
- **User Management**: 
   - List User logged in (filter by `is_logged_in`)
   - List User banned (filter by `is_banned`)
   - List User Activities 
- **User Authentication**
   - Register
      - Ensure email and username are unique 
      - Password are strong (must include numbers, uppercase and lowercase letters, and special characters)
      - Also password is being encrypt and decrypt with [Crypto](https://www.npmjs.com/package/crypto-js)
   - Login
      - Only one session running in each device type, mobile or desktop. User can't login because session already exist
      - If you fill in the wrong password more than 5 times, the user will be banned.
- **User Authorization**
   - Only valid JWT token can access the API
   - Only valid Role that has an access can access the API

---

## Technologies Used
List the main technologies or frameworks used:

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL & MongoDB
- **Authentication**: JWT (JSON Web Token)
- **Real-time Communication**: WebSocket
- **ORM**: TypeORM
- **Other Tools**: Docker (optional)

---

## Setup and Installation
### Prerequisites
- Git
- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- Docker (optional, for containerized setup)

### Steps
1. Clone the repository:
   ```bash
   git clone https://gitlab.ntx-technology.com/backend/backend-boilerplate.git
   cd backend-boilerplate
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environment variables (see [Environment Variables](#environment-variables)).
4. Run the application:
   ```bash
   npm run start:dev
   ```

---

## Environment Variables
Define the required environment variables in a `.env` file the example also available in `.env.example.`

```env
# Application
APP_PORT=

# JWT
JWT_SECRET=

# CRYPTO
SECRET_KEY=

# POSTGRESQL CRED
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=


# MONGO CRED
MONGODB_URL=
MONGODB_DBNAME=
```

---

## API Endpoints
Document the main endpoints. Example:

### Authentication
- **POST** `/v1/auth/register`: Register user data
  - **Request Body**:
    ```json
    {
      "role_id": "role.id",
      "full_name": "example.full_name",
      "email": "example.email",
      "username": "example.username",
      "password": "example.password", //must be encrypt
      "confirm_password": "example.confirm_password", //must be encrypt
      "is_dev": true //it's boolean
    }
    ```
  - **Response: 200 Ok**:
    ```json
    {
      "success": true,
      "statusCode": 201,
      "message": "Success",
      "data": {
         "id": "user.id",
         "role_id": "role.email",
         "email": "example.email",
         "username": "example.username",
         "full_name": "example.full_name",
         "created_by": null,
         "active": true,
         "login_attemp": 5,
         "is_dev": true,
         "created_at": "2024-12-03T08:01:26.392Z",
         "updated_at": "2024-12-03T08:01:26.392Z",
         "deleted_at": null,
         "is_logged_in": false,
         "is_banned": false
      }
    }
    ```
  - **Response: 400 Bad Request (password must contain 8-12 characters)**:
    ```json
    {
      "success": false,
      "statusCode": 400,
      "message": "password must contain 8-12 characters",
      "data": null
    }
    ```
  - **Response: 400 Bad Request (password and confirmation password is not equal)**:
    ```json
    {
      "success": false,
      "statusCode": 400,
      "message": "password and confirmation password is not equal",
      "data": null
    }
    ```

- **POST** `/v1/auth/login`: Login and get a JWT token.
  - **Request Body**:
    ```json
    {
      "usernameOrEmail": "example",
      "password": "password" //must be encrypted
    }
    ```
  - **Response: 200 Ok**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Success",
      "data": {
         "accessToken": "your.jwt.token", 
         "refreshToken": "your.jwt.token"
      }
    }
    ```

  - **Response: 400 Bad Request (email or username not exist)**:
    ```json
    {
      "success": false,
      "statusCode": 400,
      "message": "email or username not exist",
      "data": null
    }
    ```

  - **Response: 400 Bad Request (password is incorrect)**:
    ```json
    {
      "success": false,
      "statusCode": 400,
      "message": "password is incorrect, you had 4 attemp left",
      "data": null
    }
    ```

- **POST** `/v1/auth/logout`: Logout and invalidate the session.
  - **Response: 200 Ok**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Success",
      "data": null
    }
    ```
### Authorization
- **GET** `/v1/auth/authorize-token`: Authorize token in Bearer.
  - **Response: 200 Ok**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Success",
      "data": {
         "id": "user.id",
         "email": "user.email",
         "full_name": "user.full_name",
         "role": "role.name"
      }
    }
    ```

### User Management
- **GET** `/v1/users`: Get a list of all users.
  - **Response: 200 Ok**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Success",
      "data": [
        {
          "created_at": "2024-11-28T18:19:55.782Z",
          "id": "c9e1491f-ad87-4c6e-8286-ae6d576093fe",
          "email": "admin@ntx.solution.com",
          "username": "admin",
          "full_name": "Akmalia Trias",
          "active": true,
          "is_banned": false,
          "is_logged_in": true
        }
      ],
      "metadata": {
        "page": 1,
        "limit": 10,
        "totalPages": 1,
        "totalItems": 1
      }
    }
    ```

### User Activities
- **GET** `/v1/user-activity`: Get a list of all users.
  - **Response: 200 Ok**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Success",
      "data": [
        {
          "_id": "674d839e5e2262a34efdaa88",
          "device_id": "f3751268-2c10-4445-b5f7-7c9cef74c690",
          "user_id": "guest",
          "device_type": "desktop",
          "ip_address": "139.255.255.242",
          "latitude": -6.2091508,
          "longitude": 106.8237489,
          "method": "POST",
          "endpoint": "/v1/auth/login",
          "status": 200,
          "action": "LOGIN",
          "message": "Success",
          "timestamp": "2024-12-02T09:53:34.104Z",
          "createdAt": "2024-12-02T09:53:34.286Z",
          "updatedAt": "2024-12-02T09:53:34.286Z",
          "__v": 0
        }
      ],
      "metadata": {
        "page": 1,
        "limit": 1,
        "totalPages": 132,
        "totalItems": 132
      }
    }
    ```


---

## Database
Include details about the database structure or any migrations. For example:

- **Roles Table**
  | Column       | Type        | Description                            |
  |--------------|-------------|----------------------------------------|
  | id           | UUID        | Primary key                            |
  | role         | VARCHAR     | role name                              |
---

- **Users Table**:
  | Column       | Type        | Description                            |
  |--------------|-------------|----------------------------------------|
  | id           | UUID        | Primary key                            |
  | role_id      | UUID        | Foreign key                            |
  | full_name    | VARCHAR     | user fulname                           |
  | username     | VARCHAR     | Unique username                        |
  | email        | VARCHAR     | Unique email                           |
  | password     | TEXT        | Hashed password                        |
  | is_banned    | BOOLEAN     | Tracks banned status                   |
  | is_logged_in | BOOLEAN     | Tracks login status                    |
  | login_attemp | INT4        | Tracks login status                    |
  | created_at   | TIMESTAMPZ  | data creted_at                         |  
  | updated_at   | TIMESTAMPZ  | data updated_at login status           |
  | deleted_at   | TIMESTAMPZ  | data deleted_at (for soft delete)      |

---

## Testing
Explain how to run tests.

1. Run unit tests:
   ```bash
   npm run test
   ```
2. Run unit testsin specific file:
   ```bash
   npm run test <path-to-file>
   ```
3. Run end-to-end tests:
   ```bash
   npm run test:e2e
   ```
---
