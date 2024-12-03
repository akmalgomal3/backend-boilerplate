# Backend Probation Challenge 1

## Description

This is a project that is part of the backend probation challenge. The project is a simple REST API that allows users to
do simple Authentication and Authorization with additional of customization.

The challenge detail is available in
the [Probation Challenge Module](https://gitlab.ntx-technology.com/backend/backend-dokumentation/-/wikis/probation-module/skill-development/Challenge:-Chapter-1)
page.

## Main Features

- **User Authentication**: Users can register and login to the system.
    - Token Expiration: The token expires after 1 hour.
    - Idle timeout: The token expires after 15 minutes of inactivity.
    - Ensure that user can log in on max 2 device type (web and mobile)
    - Ensure that if user already log in on particular device type, user can't log in on the same device type.
- **User Authorization**: Users can be assigned roles and permissions.
    - Ensure that user can only access the API if they have the correct role.
- **User Management**: Certain role can see some protected APIs such as:
    - See banned users.
    - See logged in users.
    - See users log activities.
- **Unit Test**: The project has unit tests for the controller to cover certain test cases.

## Architecture

The project is built using the NestJS framework. I tried to make the project as modular as possible to make it easier to
maintain, scale, and test.

### Diagram of entities

I created a simple diagram of the entities that I used in the project.
This is the entities:
![Entities](./docs/tables.png)

And this is the flow chart of the project main features:
![Flow Chart](./docs/flow-chart.png)

### Data Storage

- **PostgreSQL**: The project uses PostgreSQL as the main database to store the data combined with TypeORM to model the
  data. The reason is that PostgreSQL is
  a powerful database system that uses and extends the SQL language combined with many
  features that safely store and scale the most complicated data workloads.


- **Elasticsearch**: The project uses Elasticsearch to store the user's log activities. The reason is that
  Elasticsearch
  is a distributed, RESTful search and analytics engine capable of solving a growing number of use cases. As the heart
  of
  the Elastic Stack, it centrally stores your data so you can discover the expected and uncover the unexpected.

### Authentication

- **Method**: JWT (JSON Web Token) with Bearer token.
- **Password Hashing**: The project uses [Bcrypt](https://www.npmjs.com/package/bcrypt) to hash the user's password.
- **Encryption & Decryption**: The project uses [CryptoJS](https://www.npmjs.com/package/crypto-js) to encrypt and
  decrypt sensitive informations.

### Logging

- **Purpose**: To record every user's activities, it stores time, action type, device information in Elasticsearch.

### Security

- **Encryption**: Encrypt all sensitive data.
- **Validation**: Validate all request from client before it go through the controller.
- **Authentication**: Ensure all the user is authenticated before they can access the protected API.
- **Authorization**: Ensure that user can only access the API if they have the correct role.
- **Hashing**: Hash the user's password before storing it in the database.

### Testing

- **Jest**: The project uses Jest as the main testing framework to test the controller.

## Installation Guide

### Prerequisites

Before you start, make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/en/download/)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Postman](https://www.postman.com/downloads/)
- [Git](https://git-scm.com/downloads)

### Steps

1. Clone the repository to your local machine.
    ```bash
    git clone https://gitlab.ntx-technology.com/backend/backend-dokumentation/probation-challenge-1.git
    ```
2. Create .env file in the root directory of the project and fill it with the information available in the [.env.example](./.env.example)
   file.
3. Install the dependencies.
    ```bash
    npm install
    ```
4. Start the PostgreSQL and Elasticsearch services using Docker.
    ```bash
    docker-compose up -d
    ```
5. Run the project.
    ```bash
    npm run start:dev
    ```
6. This project uses Swagger for API documentation. You can access the Swagger UI at
    ```bash
    [base_url]/docs
    ```

## API Documentation

Here is the list of the available API endpoints:

### Auth

Base URL: [base_url]/auth

- **POST /generate-password**: Generate encrypted password and confirmPassword.
    - Request Body:
        ```json
        {
          "password": "string",
          "confirmPassword": "string"
        }
        ```
    - Response:
        ```json
        {
          "success": true,
          "statusCode": 201,
          "message": "string",
          "data": {
            "password": "string",
            "confirmPassword": "string"
          }
        }
        ```

- **POST /register**: Register a new user.
    - Request Body:
        ```json
        {
          "email": "fauzi@gmail.com",
          "username": "fauzi",
          "password": "U2FsdGVkX1+T4/7/o5ey7gSeDDcBaMgFxpSsZO/IEc0=",
          "confirmPassword": "U2FsdGVkX1+eZO39MGhsYap8RPA97xzek44uNRvWtbo=",
          "role": "Admin" // Admin | Operator | Executive
        }
        ```
    - Response:
        ```json
        {
          "success": true,
          "statusCode": 201,
          "message": "Success",
          "data": {
            "id": "cd785e1a-177c-4590-ad38-79a06e66a714",
            "email": "fauzi@gmail.com",
            "username": "fauzi",
            "role": "Admin"
          }
        }
        ```

- **POST /login**: Login to the system.
    - Request Body:
        ```json
        {
          "identifier": "fauzi",
          "password": "U2FsdGVkX1+T4/7/o5ey7gSeDDcBaMgFxpSsZO/IEc0="
        }
        ```
    - Response:
        ```json
        {
          "success": true,
          "statusCode": 201,
          "message": "Success",
          "data": {
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNkNzg1ZTFhLTE3N2MtNDU5MC1hZDM4LTc5YTA2ZTY2YTcxNCIsInJvbGUiOiJBZG1pbiIsImVtYWlsIjoiZmF1emlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJmYXV6aSIsImRldmljZV90eXBlIjoid2ViIiwic2Vzc2lvbl9pZCI6IjQ1Nzg1MTkxLTEwMjMtNDU3My05ZWJkLTBiZjBkZDIyMDAyNCIsInVzZXJfYWdlbnQiOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTMxLjAuMC4wIFNhZmFyaS81MzcuMzYgRWRnLzEzMS4wLjAuMCIsImlhdCI6MTczMzEyMjgzOCwiZXhwIjoxNzMzMTI2NDM4fQ.yAJvAnptfv9y8GMfbZbK4bkevC8SWAWuhE8v3XzWyRc"
          }
        }
        ```

- **POST /logout**: Login to the system.
    - Request Header:
        ```json
        {
          "Authorization": "Bearer [token]"
        }
        ```
    - Request Body:
        ```json
        ```
    - Response:
        ```json
        {
          "success": true,
          "statusCode": 201,
          "message": "Success",
          "data": {
            "message": "User has been logged out"
          }
        }
        ```

### Users

Base URL: [base_url]/users

- **GET /**: Get list of users.
    - Authorize Role: `Admin, Operator, Executive`
    - Request Header:
        ```json
        {
          "Authorization": "Bearer [token]"
        }
        ```
    - Request Query:
        ```json
        {
          "page": 1,
          "limit": 2
        }
        ```
    - Response:
        ```json
        {
          "success": true,
          "statusCode": 200,
          "message": "Success",
          "data": [
            {
              "id": "0a44fce1-13f4-415c-9312-d6513494362c",
              "username": "viska123",
              "email": "viska@gmail.com",
              "password": "$2b$10$0rkG3FDcGYjciABtZmvoFOFItDJFtUS69hd.IxpyycX1sJ49KyCze",
              "role": "Operator",
              "failed_login_attempts": 0,
              "is_banned": false,
              "ban_reason": null,
              "created_at": "2024-11-27T08:13:40.265Z",
              "updated_at": "2024-11-27T08:13:40.265Z"
           },
           {
              "id": "fc98de47-19aa-4306-adb1-3bfaf8319056",
              "username": "valcon123",
              "email": "valcon@gmail.com",
              "password": "$2b$10$ZXlJ4RomprNvUe33x9FfQuK1Tkw4Ao7mGX39LJBz2gP65VdqOxmRK",
              "role": "Operator",
              "failed_login_attempts": 0,
              "is_banned": false,
              "ban_reason": "Too many failed login attempts",
              "created_at": "2024-11-27T08:13:07.084Z",
              "updated_at": "2024-11-27T08:13:07.084Z"
           }
         ],
         "metadata": {
            "page": 1,
            "limit": 2,
            "totalPages": 9,
            "totalItems": 17
         } 
        }
        ```

- **GET /banned**: See list of banned users.
    - Authorize Role: `Admin`
    - Request Header:
        ```json
        {
          "Authorization": "Bearer [token]"
        }
        ```
    - Request Query:
        ```json
        {
          "page": 1,
          "limit": 2
        }
        ```
    - Response:
        ```json
        {
          "success": true,
          "statusCode": 200,
          "message": "Success",
          "data": [
            {
              "id": "0a44fce1-13f4-415c-9312-d6513494362c",
              "username": "viska123",
              "email": "viska@gmail.com",
              "password": "$2b$10$0rkG3FDcGYjciABtZmvoFOFItDJFtUS69hd.IxpyycX1sJ49KyCze",
              "role": "Operator",
              "failed_login_attempts": 0,
              "is_banned": false,
              "ban_reason": null,
              "created_at": "2024-11-27T08:13:40.265Z",
              "updated_at": "2024-11-27T08:13:40.265Z"
           },
           {
              "id": "fc98de47-19aa-4306-adb1-3bfaf8319056",
              "username": "valcon123",
              "email": "valcon@gmail.com",
              "password": "$2b$10$ZXlJ4RomprNvUe33x9FfQuK1Tkw4Ao7mGX39LJBz2gP65VdqOxmRK",
              "role": "Operator",
              "failed_login_attempts": 0,
              "is_banned": false,
              "ban_reason": "Too many failed login attempts",
              "created_at": "2024-11-27T08:13:07.084Z",
              "updated_at": "2024-11-27T08:13:07.084Z"
           }
         ],
         "metadata": {
            "page": 1,
            "limit": 2,
            "totalPages": 9,
            "totalItems": 17
         } 
        }
        ```

- **GET /logs/activity**: See users activity logs. 
    - Authorize Role: `Admin, Executive`
    - Request Header:
        ```json
        {
          "Authorization": "Bearer [token]"
        }
        ```
    - Request Query:
        ```json
        {
          "page": 1,
          "limit": 2,
          "userRole": "Admin", // Optional
          "status": "success", // Optional
          "dateFrom": "2024-01-01", // Optional
          "dateTo": "2024-12-31" // Optional
        }
        ```
    - Response:
        ```json
        {
          "success": true,
          "statusCode": 200,
          "message": "Success",
          "data": [
           {
            "user_id": "cd785e1a-177c-4590-ad38-79a06e66a714",
            "user_role": "Admin",
            "identifier": "fauzi",
            "method": "GET",
            "path": "/users",
            "log_type": "user_activity",
            "status": "success",
            "activity": "User fauzi has access the /users route",
            "timestamp": 1733125717570,
            "datetime": "2024-12-02T07:48:37.570Z",
            "device_type": "web",
            "ip_address": "139.255.255.242",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
            "location": {
              "lat": -6.22526,
              "lon": 106.817
             },
            "country": "Indonesia",
            "city": "Jakarta",
            "postal_code": "",
            "timezone": "Asia/Jakarta"
           },
           {
            "user_id": "cd785e1a-177c-4590-ad38-79a06e66a714",
            "user_role": "Admin",
            "identifier": "fauzi",
            "method": "GET",
            "path": "/users",
            "log_type": "user_activity",
            "status": "success",
            "activity": "User fauzi has access the /users route",
            "timestamp": 1733125717570,
            "datetime": "2024-12-02T07:48:37.570Z",
            "device_type": "web",
            "ip_address": "139.255.255.242",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
            "location": {
               "lat": -6.22526,
               "lon": 106.817
            },
            "country": "Indonesia",
            "city": "Jakarta",
            "postal_code": "",
            "timezone": "Asia/Jakarta"
            }
          ],
          "metadata": {
            "page": "1",
            "limit": "2",
            "totalPages": 3,
            "totalItems": 5
            }
          }
        ```

- **GET /logs/auth**: See users activity logs.
    - Authorize Role: `Admin, Executive`
    - Request Header:
        ```json
        {
          "Authorization": "Bearer [token]"
        }
        ```
    - Request Query:
        ```json
        {
          "page": 1,
          "limit": 2,
          "userRole": "Admin", // Optional
          "status": "success", // Optional
          "dateFrom": "2024-01-01", // Optional
          "dateTo": "2024-12-31" // Optional
        }
        ```
    - Response:
        ```json
        {
          "success": true,
          "statusCode": 200,
          "message": "Success",
          "data": [
              {
              "user_id": "cd785e1a-177c-4590-ad38-79a06e66a714",
              "user_role": "Admin",
              "identifier": "fauzi",
              "method": "POST",
              "path": "/auth/login",
              "log_type": "user_auth",
              "status": "success",
              "activity": "User fauzi has login successfully",
              "timestamp": 1733128178760,
              "datetime": "2024-12-02T08:29:38.760Z",
              "ip_address": "139.255.255.242",
              "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
              "location": {
              "lat": -6.22526,
              "lon": 106.817
              },
              "country": "Indonesia",
              "city": "Jakarta",
              "postal_code": "",
              "timezone": "Asia/Jakarta"
              },
              {
              "user_id": "cd785e1a-177c-4590-ad38-79a06e66a714",
              "user_role": "Admin",
              "identifier": "fauzi",
              "method": "POST",
              "path": "/auth/login",
              "log_type": "user_auth",
              "status": "success",
              "activity": "User fauzi has login successfully",
              "timestamp": 1733125672901,
              "datetime": "2024-12-02T07:47:52.901Z",
              "ip_address": "139.255.255.242",
              "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
              "location": {
              "lat": -6.22526,
              "lon": 106.817
              },
              "country": "Indonesia",
              "city": "Jakarta",
              "postal_code": "",
              "timezone": "Asia/Jakarta"
              }
              ],
              "metadata": {
              "page": "1",
              "limit": "2",
              "totalPages": 6,
              "totalItems": 11
              }
          }
        ```

- **GET /logged-in**: Streams user who have active session.
    - Authorize Role: `Admin, Executive`
    - Request Header:
        ```json
        {
          "Authorization": "Bearer [token]",
          "Accept": "text/event-stream"
        }
        ```
    - Request Query:
        ```json
        ```
    - Response:
        ```json
        [
          {
          "id": "60eb4dd7-d918-4725-9eb0-270fb604cbb2",
          "email": "azizah@gmail.com",
          "username": "azizah123",
          "role": "Admin",
          "deviceType": "mobile",
          "lastActivity": "2024-12-02T01:12:14.008Z",
          "expiresAt": "2024-12-02T02:12:14.008Z"
          },
          {
          "id": "60eb4dd7-d918-4725-9eb0-270fb604cbb2",
          "email": "azizah@gmail.com",
          "username": "azizah123",
          "role": "Admin",
          "deviceType": "web",
          "lastActivity": "2024-12-02T01:16:43.333Z",
          "expiresAt": "2024-12-02T02:07:29.354Z"
          },
          {
          "id": "1f546c3e-9d33-4d2a-94ba-80660621b8b7",
          "email": "aziz@gmail.com",
          "username": "aziz123",
          "role": "Executive",
          "deviceType": "web",
          "lastActivity": "2024-12-02T01:19:33.641Z",
          "expiresAt": "2024-12-02T02:13:45.121Z"
          }
        ]
        ```
      
