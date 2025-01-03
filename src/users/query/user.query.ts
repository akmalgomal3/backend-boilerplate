import { each } from "lodash";

export const UserQuery = {
  GET_USER_BY_USER_ID: (userId: string) => {
    return `
            SELECT user_id       as "userId",
                 username,
                 email,
                 password,
                 active,
                 full_name     as "fullName",
                 phone_number  as "phoneNumber",
                 birthdate,
                 roles.role_id as "roleId",
                 role_name     as "roleName",
                 role_type     as "roleType"
            FROM users
            LEFT JOIN roles ON users.role_id = roles.role_id
            WHERE user_id = '${userId}'
        `;
  },
  GET_USER_AUTH_BY_USER_ID: (userId: string) => {
    return `
            SELECT user_id        as "userId",
                 username,
                 email,
                 password,
                 active,
                 full_name      as "fullName",
                 phone_number   as "phoneNumber",
                 birthdate,
                 roles.role_id  as "roleId",
                 role_name      as "roleName",
                 role_type      as "roleType",
                 request_status as "requestStatus"
            FROM users_auth
            LEFT JOIN roles ON users_auth.role_id = roles.role_id
            WHERE user_id = '${userId}'`;
  },
  GET_USER_BY_EMAIL: (email: string) => {
    return `
            SELECT user_id       as "userId",
                 username,
                 email,
                 password,
                 active,
                 full_name     as "fullName",
                 phone_number  as "phoneNumber",
                 birthdate,
                 roles.role_id as "roleId",
                 role_name     as "roleName",
                 role_type     as "roleType"
            FROM users
            LEFT JOIN roles ON users.role_id = roles.role_id
            WHERE email = '${email}'
        `;
  },
  GET_USER_AUTH_BY_EMAIL: (email: string) => {
    return `
        SELECT user_id             as "userId",
               username,
               email,
               password,
               active,
               full_name      as "fullName",
               phone_number   as "phoneNumber",
               birthdate,
               roles.role_id  as "roleId",
               role_name      as "roleName",
               role_type      as "roleType",
               request_status as "requestStatus"
        FROM users_auth
        LEFT JOIN roles ON users_auth.role_id = roles.role_id
        WHERE email = '${email}'`;
  },
  GET_USER_BY_USERNAME: (username: string) => {
    return `
            SELECT user_id       as "userId",
                    username,
                    email,
                    password,
                    active,
                    full_name     as "fullName",
                    phone_number  as "phoneNumber",
                    birthdate,
                    roles.role_id as "roleId",
                    role_name     as "roleName",
                    role_type     as "roleType"
            FROM users
            LEFT JOIN roles ON users.role_id = roles.role_id
            WHERE username = '${username}'
        `;
  },
  GET_USER_AUTH_BY_USERNAME: (username: string) => {
    return `
            SELECT user_id as "userId",
                    username,
                    full_name as "fullName",
                    role_id as "roleId",
                    birthdate,
                    created_at as "createdAt",
                    updated_at as "updatedAt",
                    created_by as "createdBy",
                    updated_by as "updatedBy"
            FROM users_auth
            WHERE username = '${username}'`;
  },
  CREATE_USER: (
    email: string | null,
    username: string | null,
    password: string | null,
    fullName: string | null,
    phoneNumber: string | null,
    birthdate: string | null,
    roleId: string | null,
    createdBy: string | null,
    isActive: boolean | null,
  ) => {
    return `
            INSERT INTO users (email, username, password, full_name, phone_number, birthdate, role_id, created_by, active)
            VALUES ('${email}', '${username}', '${password}', '${fullName}', '${phoneNumber}', '${birthdate}', '${roleId}', '${createdBy}', ${isActive})
            RETURNING user_id as "userId", username, email, full_name as "fullName", phone_number as "phoneNumber", birthdate, role_id as "roleId"`;
  },
  CREATE_USER_AUTH: (
    userId: string,
    email: string | null,
    username: string | null,
    fullName: string | null,
    password: string | null,
    roleId: string | null,
    birthdate: string | null,
    phoneNumber: string | null,
    requestStatus: string | null,
    createdBy: string | null,
    isActive: boolean | null,
  ) => {
    return `
        INSERT INTO users_auth (user_id, email, username, full_name, password, role_id, birthdate, phone_number, request_status, created_by, active, created_at, updated_at)
        VALUES ('${userId}', '${email}', '${username}', '${fullName}', '${password}', '${roleId}', '${birthdate}', '${phoneNumber}', '${requestStatus}', '${createdBy}', ${isActive}, NOW(), NOW())
        RETURNING user_id as "userId", username, email, full_name as "fullName", phone_number as "phoneNumber", birthdate, role_id as "roleId", request_status as "requestStatus"`;
  },
  UPDATE_USER_BY_USER_ID: (
    userId: string | null,
    roleId: string | null,
    username: string | null,
    fullName: string | null,
    birthdate: string | null,
    updatedBy: string | null,
  ) => {
    return `
            UPDATE users SET username = COALESCE('${username}', username),
                            full_name = COALESCE('${fullName}', full_name),
                            birthdate = COALESCE('${birthdate}', birthdate),
                            role_id = COALESCE('${roleId}', role_id),
                            updated_by = '${updatedBy}',
                            updated_at = NOW()
            WHERE user_id = '${userId}' RETURNING user_id as "userId"`;
  },
  UPDATE_USER_AUTH_BY_USER_ID: (
    userId: string,
    roleId: string | null,
    username: string | null,
    fullName: string | null,
    birthdate: string | null,
    updatedBy: string | null,
  ) => {
    return `
            UPDATE users_auth SET username = COALESCE('${username}', username),
                        full_name = COALESCE('${fullName}', full_name),
                        birthdate = COALESCE('${birthdate}', birthdate),
                        role_id = COALESCE('${roleId}', role_id),
                        updated_by = '${updatedBy}',
                        updated_at = NOW()
            WHERE user_id = '${userId}' RETURNING user_id as "userId"`;
  },
  UPDATE_USER_AUTH_STATUS: (
    userAuthId: string,
    updatedBy: string,
    requestStatus: string,
  ) => {
    return `
            UPDATE users_auth 
                SET request_status = '${requestStatus}', 
                updated_by = '${updatedBy}', 
                updated_at = NOW()
            WHERE user_id = '${userAuthId}' 
            RETURNING user_id as "userId", 
                      username, 
                      request_status as "requestStatus"`;
  },
  UPDATE_USER_BAN: (userId: string, updatedBy: string, isActive: boolean) => {
    return `
            UPDATE users SET 
                active = ${isActive},
                updated_by = '${updatedBy}',
                updated_at = NOW()
            WHERE user_id = '${userId}'
            RETURNING user_id as "userId"`;
  },
  UPDATE_USER_PASSWORD: (userId: string, updatedBy: string, password: string) => {
    return `UPDATE users SET 
                password = '${password}', 
                updated_by = '${updatedBy}',
                updated_at = NOW() 
            WHERE user_id = '${userId}' 
            RETURNING user_id as "userId", 
                username, 
                email, 
                full_name as "fullName", 
                phone_number as "phoneNumber", 
                birthdate, 
                role_id as "roleId"`;
  },
  UPDATE_USER_AUTH_EMAIL_BY_ID: (
    userAuthId: string,
    email: string
  ) => {
    return `UPDATE users_auth SET 
                email = '${email}', 
                updated_by = '${userAuthId}',
                updated_at = NOW()
            WHERE user_id = ${userAuthId}
            RETURNING user_id as "userId", 
                username, 
                email, 
                full_name as "fullName", 
                phone_number as "phoneNumber", 
                birthdate`;
  },
  UPDATE_USER_EMAIL_BY_USER_ID: (
    userId: string, 
    email: string
  ) => {
    return `UPDATE users SET
                email = '${email}', 
                updated_by = '${userId}',
                updated_at = NOW()
            WHERE user_id = '${userId}'
            RETURNING user_id as "userId", 
                username, 
                email, 
                full_name as "fullName", 
                phone_number as "phoneNumber", 
                birthdate`   
  },
  DELETE_USER_AUTH_BY_ID: (userAuthId: string) => {
    return `DELETE FROM users WHERE user_id = '${userAuthId}' RETURNING user_id as "userId"`;
  },
  DELETE_USER_BY_USER_ID: (userId: string) => {
    return `DELETE FROM users WHERE user_id = '${userId}' RETURNING user_id as "userId"`;
  },
};
