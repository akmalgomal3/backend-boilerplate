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
};
