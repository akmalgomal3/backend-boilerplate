export const FeaturesQuery = {
  GET_FEATURES: `
        SELECT
            feature_id as "featureId", 
            feature_name as "featureName", 
            menu_id as "menuId", 
            description, 
            active,
            created_at as "createdAt",
            updated_at as "updatedAt",
            created_by as "createdBy",
            updated_by as "updatedAt"
        FROM features
        OFFSET $1 LIMIT $2
    `,
  COUNT_FEATURES: `
        SELECT COUNT(*) FROM features
    `,
  GET_FEATURE_BY_ID: `
        SELECT feature_id as "featureId",
               feature_name as "featureName",
               menu_id as "menuId",
               description,
               active,
               created_at as "createdAt",
               updated_at as "updatedAt",
               created_by as "createdBy",
               updated_by as "updatedAt"
        FROM features 
        WHERE feature_id = $1
    `,
  GET_FEATURE_BY_NAME: `
        SELECT feature_id as "featureId",
               feature_name as "featureName",
               menu_id as "menuId",
               description,
               active,
               created_at as "createdAt",
               updated_at as "updatedAt",
               created_by as "createdBy",
               updated_by as "updatedAt"
        FROM features 
        WHERE feature_name = $1
    `,
  CREATE_FEATURE: `
        INSERT INTO features (
            feature_name, 
            menu_id,
            description,
            active,
            created_by,
            created_at,
            updated_at
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING feature_id as "featureId"
    `,
  UPDATE_FEATURE: `
        UPDATE features 
        SET 
            feature_name = COALESCE($1, feature_name),
            menu_id = COALESCE($2, menu_id),
            description = COALESCE($3, description),
            active = COALESCE($4, active),
            updated_by = $5,
            updated_at = NOW()
        WHERE feature_id = $6
    `,
  DELETE_FEATURE: `
        DELETE FROM features WHERE feature_id = $1
    `,
};
