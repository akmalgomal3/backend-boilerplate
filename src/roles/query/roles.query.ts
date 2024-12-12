export const RolesQuery = {
  GET_ROLES: `
        SELECT * FROM roles
        OFFSET $1 LIMIT $2
    `,
  COUNT_ROLES: `
        SELECT COUNT(*) FROM roles
    `,
  GET_ROLE_BY_ID: `
        SELECT * FROM roles WHERE role_id = $1
    `,
  CREATE_ROLE: `
        INSERT INTO roles (
            role_type, 
            role_name, 
            created_by,
            created_at,
            updated_at
        ) VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING role_id
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
};
