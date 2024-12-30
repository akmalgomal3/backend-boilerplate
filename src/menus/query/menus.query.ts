export const MenusQuery = {
  GET_MENUS(offset: number, limit: number, search: string): string {
    return `
        SELECT menu_id         as "menuId",
               menu_name       as "menuName",
               parent_menu_id  as "parentMenuId",
               route_path      as "routePath",
               icon,
               hierarchy_level as "hierarchyLevel",
               description,
               active,
               created_at      as "createdAt",
               updated_at      as "updatedAt",
               created_by      as "createdBy",
               updated_by      as "updatedBy"
        FROM menus 
        WHERE menu_name ILIKE '%${search}%' OR description ILIKE '%${search}%'
        ORDER BY hierarchy_level
        OFFSET ${offset} LIMIT ${limit}
    `;
  },

  COUNT_MENUS: `
    SELECT COUNT(*) FROM menus
  `,

  GET_MENU_BY_ID(menuId: string): string {
    return `
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
    WHERE menu_id = '${menuId}'
  `;
  },
  GET_MENU_BY_NAME(menuName: string): string {
    return `
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
    WHERE menu_name = '${menuName}'
  `;
  },

  GET_MENUS_TO_CREATE_ACCESS: `
    SELECT
      menu_id as "menuId",
      menu_name as "menuName",
      false as "selected",
      parent_menu_id as "parentMenuId",
      hierarchy_level as "hierarchyLevel",
      active
    FROM menus
    WHERE active = true
    ORDER BY hierarchy_level
  `,

  CREATE_MENU(
    menuName: string,
    parentMenuId: string | null,
    routePath: string | null,
    icon: string | null,
    hierarchyLevel: number,
    description: string | null,
    active: boolean | null,
    userId: string,
  ): string {
    return `
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
    ) VALUES ('${menuName}', 
              ${parentMenuId ? `'${parentMenuId}'` : 'NULL'},
              ${routePath ? `'${routePath}'` : 'NULL'},
              ${icon ? `'${icon}'` : 'NULL'}, 
              ${hierarchyLevel},
              ${description ? `'${description}'` : 'NULL'},
              ${active ?? 'NULL'}, 
              '${userId}', 
              NOW(), 
              NOW())
    RETURNING menu_id as "menuId"
  `;
  },

  UPDATE_MENU(
    menuName: string | null,
    parentMenuId: string | null,
    routePath: string | null,
    icon: string | null,
    hierarchyLevel: number | null,
    description: string | null,
    active: boolean | null,
    updatedBy: string,
    menuId: string,
  ): string {
    return `
    UPDATE menus
    SET
        menu_name = COALESCE(${menuName ? `'${menuName}'` : 'NULL'}, menu_name),
        parent_menu_id = COALESCE(${parentMenuId ? `'${parentMenuId}'` : 'NULL'}, parent_menu_id),
        route_path = COALESCE(${routePath ? `'${routePath}'` : 'NULL'}, route_path),
        icon = COALESCE(${icon ? `'${icon}'` : 'NULL'}, icon),
        hierarchy_level = COALESCE(${hierarchyLevel ?? 'NULL'}, hierarchy_level),
        description = COALESCE(${description ? `'${description}'` : 'NULL'}, description),
        active = COALESCE(${active ?? 'NULL'}, active),
        updated_by = '${updatedBy}',
        updated_at = NOW()
    WHERE menu_id = '${menuId}'
  `;
  },

  DELETE_MENU(menuIds: string[]): string {
    const formattedIds = `${menuIds.map((id) => `'${id}'`).join(',')}`;
    return `
        DELETE FROM menus WHERE menu_id = ANY(ARRAY[${formattedIds}]::uuid[]);
    `;
  },
};
