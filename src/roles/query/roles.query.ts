export const RolesQuery = {
  GET_ROLES: `
      SELECT role_id as roleId,
             role_type as roleType,
             role_name as roleName,
             created_at as createdAt,
             updated_at as updatedAt,
             created_by as createdBy,
             updated_by as updatedAt
      FROM roles
               OFFSET $1 LIMIT $2
    `,
  COUNT_ROLES: `
        SELECT COUNT(*) FROM roles
    `,
  GET_ROLE_BY_ID: `
        SELECT role_id as roleId,
               role_type as roleType,
               role_name as roleName,
               created_at as createdAt,
               updated_at as updatedAt,
               created_by as createdBy,
               updated_by as updatedAt
        FROM roles WHERE role_id = $1
    `,
  CREATE_ROLE: `
        INSERT INTO roles (
            role_type, 
            role_name, 
            created_by,
            created_at,
            updated_at
        ) VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING role_id as roleId
    `,
  UPDATE_ROLE: `
        UPDATE roles 
        SET 
            role_type = COALESCE($1, role_type),
            role_name = COALESCE($2, role_name),
            updated_by = $3,
            updated_at = NOW()
        WHERE role_id = $4
    `,
  DELETE_ROLE: `
        DELETE FROM roles WHERE role_id = $1
    `,
  GET_BASE_ROLE: `
      SELECT role_id as "roleId"
      FROM roles
      WHERE role_type = 'Operator'
        AND role_name = 'Base Operator'
      LIMIT 1
  `
};
