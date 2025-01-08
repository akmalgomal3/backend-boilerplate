export const AccessMenuQuery = {
    GET_ALL_MENU_ACCESS_BY_ROLE_ID: (roleId: string) =>
        `SELECT 
            access_menu.access_menu_id as "accessMenuId",
            access_menu.role_id as "roleId", 
            CASE WHEN 
                access_menu.access_menu_id IS NOT NULL THEN true 
                ELSE false 
            END as "selected", 
            menus.menu_id as "menuId",
            menus.menu_name as "menuName",
            menus.parent_menu_id as "parentMenuId",
            menus.hierarchy_level as "hierarchyLevel",
            menus.route_path as "routePath", 
            menus.icon, 
            menus.active
        FROM menus 
        LEFT JOIN 
            access_menu ON menus.menu_id = access_menu.menu_id 
            AND access_menu.role_id = '${roleId}'
        WHERE menus.active = true
        ORDER BY menus.hierarchy_level ASC
    `,
};
