export const MenusQuery = {
  GET_MENUS: `
    SELECT
      menu_id as "menuId",
      menu_name as "menuName",
      parent_menu_id as "parentMenuId",
      route_path as "routePath",
      icon,
      hierarchy_level as "hierarchyLevel",
      description,
      active,
      created_at as "createdAt",
      updated_at as "updatedAt",
      created_by as "createdBy",
      updated_by as "updatedBy"
    FROM menus
    ORDER BY hierarchy_level ASC
    OFFSET $1 LIMIT $2
  `,

  COUNT_MENUS: `
    SELECT COUNT(*) FROM menus
  `,

  GET_MENU_BY_ID: `
    SELECT
      menu_id as "menuId",
      menu_name as "menuName",
      parent_menu_id as "parentMenuId",
      route_path as "routePath",
      icon,
      hierarchy_level as "hierarchyLevel",
      description,
      active,
      created_at as "createdAt",
      updated_at as "updatedAt",
      created_by as "createdBy",
      updated_by as "updatedBy"
    FROM menus
    WHERE menu_id = $1
  `,

  GET_MENU_BY_NAME: `
    SELECT
      menu_id as "menuId",
      menu_name as "menuName",
      parent_menu_id as "parentMenuId",
      route_path as "routePath",
      icon,
      hierarchy_level as "hierarchyLevel",
      description,
      active,
      created_at as "createdAt",
      updated_at as "updatedAt",
      created_by as "createdBy",
      updated_by as "updatedBy"
    FROM menus
    WHERE menu_name = $1
  `,

  CREATE_MENU: `
    INSERT INTO menus (
      menu_name,
      parent_menu_id,
      route_path,
      icon,
      hierarchy_level,
      description,
      active,
      created_by,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    RETURNING menu_id as "menuId"
  `,

  UPDATE_MENU: `
    UPDATE menus
    SET
      menu_name = COALESCE($1, menu_name),
      parent_menu_id = COALESCE($2, parent_menu_id),
      route_path = COALESCE($3, route_path),
      icon = COALESCE($4, icon),
      hierarchy_level = COALESCE($5, hierarchy_level),
      description = COALESCE($6, description),
      active = COALESCE($7, active),
      updated_by = $8,
      updated_at = NOW()
    WHERE menu_id = $9
  `,

  DELETE_MENU: `
    DELETE FROM menus WHERE menu_id = $1
  `,
};
