export const AccessFeatureQuery = {
  GET_ALL_FEATURE_NO_MENU_ID_ACCESS_BY_ROLE_ID: (roleId: string) => {
    return `
            SELECT
                f.feature_id as "featureId",
                f.feature_name as "featureName",
                f.menu_id as "menuId",
                f.description,
                f.active,
                COALESCE(af.can_access, false) as "canAccess", 
                COALESCE(af.can_read, false) as "canRead",
                COALESCE(af.can_insert, false) as "canInsert",
                COALESCE(af.can_update , false) as "canUpdate",
                COALESCE(af.can_delete, false) as "canDelete",
                CASE WHEN 
                    af.access_feature_id IS NOT NULL THEN true 
                    ELSE false 
                END as "selected",
                f.created_at as "createdAt",
                f.updated_at as "updatedAt",
                f.created_by as "createdBy",
                f.updated_by as "updatedBy"
            FROM features f
            LEFT JOIN access_feature af ON f.feature_id = af.feature_id
            AND af.role_id = '${roleId}'
            WHERE f.menu_id IS NULL AND f.active = true
        `;
  },
  GET_ALL_FEATURE_ACCESS_BY_MENU_ROLE_ID(
    menuId: string,
    roleId: string,
  ){
    return `
        SELECT f.feature_id as "featureId", 
            f.feature_name as "featureName",
            f.menu_id as "menuId",
            f.description,
            f.active,
            COALESCE(af.can_access, false) as "canAccess", 
            COALESCE(af.can_read, false) as "canRead",
            COALESCE(af.can_insert, false) as "canInsert",
            COALESCE(af.can_update , false) as "canUpdate",
            COALESCE(af.can_delete, false) as "canDelete",
            CASE WHEN 
                af.access_feature_id IS NOT NULL THEN true 
                ELSE false 
            END as "selected",
            f.created_at as "createdAt",
            f.updated_at as "updatedAt",
            f.created_by as "createdBy",
            f.updated_by as "updatedBy"
        FROM features f
        LEFT JOIN access_feature af on f.feature_id = af.feature_id 
        AND af.role_id = '${roleId}'
        WHERE f.menu_id = '${menuId}' AND f.active = true
    `
  }, 
  DELETE_ACCESS_FEATURE_BY_ROLE_ID: (roleId: string) => {
    return `DELETE FROM access_feature WHERE role_id = '${roleId}'`
  }
};
