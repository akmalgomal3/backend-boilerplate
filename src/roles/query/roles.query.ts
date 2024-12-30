import { RoleType } from '../../common/enums/user-roles.enum';

export const RolesQuery = {
  GET_ROLES(offset: number, limit: number, search: string): string {
    return `
      SELECT role_id as "roleId",
             role_type as "roleType",
             role_name as "roleName",
             created_at as "createdAt",
             updated_at as "updatedAt",
             created_by as "createdBy",
             updated_by as "updatedAt"
      FROM roles 
      WHERE role_name ILIKE '%${search}%' OR 
                            role_type::TEXT ILIKE '%${search}%'
      OFFSET ${offset} LIMIT ${limit}
    `;
  },
  COUNT_ROLES: `
        SELECT COUNT(*) FROM roles
    `,
  GET_ROLE_BY_ID(roleId: string): string {
    return `
        SELECT role_id as "roleId",
               role_type as "roleType",
               role_name as "roleName",
               created_at as "createdAt",
               updated_at as "updatedAt",
               created_by as "createdBy",
               updated_by as "updatedAt"
        FROM roles WHERE role_id = '${roleId}'
    `;
  },
  GET_ROLE_BY_NAME(roleName: string): string {
    return `
        SELECT role_id as "roleId",
               role_type as "roleType",
               role_name as "roleName",
               created_at as "createdAt",
               updated_at as "updatedAt",
               created_by as "createdBy",
               updated_by as "updatedAt"
        FROM roles WHERE role_name = '${roleName}'
    `;
  },
  CREATE_ROLE(roleType: RoleType, roleName: string, createdBy: string): string {
    return `
        INSERT INTO roles (
            role_type, 
            role_name, 
            created_by,
            created_at,
            updated_at
        ) VALUES ('${roleType}', '${roleName}', ${createdBy ? `'${createdBy}'` : 'NULL'}, NOW(), NOW())
        RETURNING role_id as "roleId"
    `;
  },
  UPDATE_ROLE(
    roleType: RoleType,
    roleName: string,
    updatedBy: string,
    roleId: string,
  ): string {
    return `
        UPDATE roles 
        SET 
            role_type = COALESCE(${roleType ? `'${roleType}'` : 'NULL'}, role_type),
            role_name = COALESCE(${roleName ? `'${roleName}'` : 'NULL'}, role_name),
            updated_by = ${updatedBy ? `'${updatedBy}'` : 'NULL'},
            updated_at = NOW()
        WHERE role_id = '${roleId}'
    `;
  },
  DELETE_ROLE(roleId: string): string {
    return `
        DELETE FROM roles WHERE role_id = '${roleId}'
    `;
  },
  GET_BASE_ROLE: `
      SELECT role_id as "roleId"
      FROM roles
      WHERE role_type = 'Operator'
        AND role_name = 'Base Operator'
      LIMIT 1
  `,
};
