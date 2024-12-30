export const FeaturesQuery = {
  GET_FEATURES(offset: number, limit: number, search: string): string {
    return `
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
        WHERE feature_name ILIKE '%${search}%'
        OFFSET ${offset} LIMIT ${limit}
    `;
  },
  COUNT_FEATURES: `
        SELECT COUNT(*) FROM features
    `,
  GET_FEATURE_BY_ID(featureId: string): string {
    return `
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
        WHERE feature_id = '${featureId}'
    `;
  },
  GET_FEATURE_BY_NAME(featureName: string): string {
    return `
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
        WHERE feature_name = '${featureName}'
    `;
  },
  CREATE_FEATURE(
    featureName: string,
    menuId: string,
    description: string,
    active: boolean | null,
    createdBy: string,
  ): string {
    return `
        INSERT INTO features (
            feature_name, 
            menu_id,
            description,
            active,
            created_by,
            created_at,
            updated_at
        ) VALUES ('${featureName}',
                  '${menuId}',
                  '${description}',
                  ${active ?? 'NULL'},
                  '${createdBy}', 
                  NOW(), 
                  NOW())
        RETURNING feature_id as "featureId"
    `;
  },
  UPDATE_FEATURE(
    featureName: string,
    menuId: string,
    description: string,
    active: boolean | null,
    updatedBy: string,
    featureId: string,
  ): string {
    return `
        UPDATE features 
        SET 
            feature_name = COALESCE(${featureName ? `'${featureName}'` : 'NULL'}, feature_name),
            menu_id = COALESCE(${menuId ? `'${menuId}'` : 'NULL'}, menu_id),
            description = COALESCE(${description ? `'${description}'` : 'NULL'}, description),
            active = COALESCE(${active ?? 'NULL'}, active),
            updated_by = '${updatedBy}',
            updated_at = NOW()
        WHERE feature_id = '${featureId}'
    `;
  },
  DELETE_FEATURE(featureId: string): string {
    return `
        DELETE FROM features WHERE feature_id = '${featureId}'
    `;
  },
};
