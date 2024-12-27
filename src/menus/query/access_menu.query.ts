export const AccessMenuQuery = {
    GET_ACCESS_MENU_BY_ID: `
        SELECT 
            am.access_menu_id as "accessMenuId",
            am.created_by as "createdBy",
            am.created_at as "createdAt",
            am.updated_at as "updatedAt",
            am.updated_by as "updatedBy",
            am.role_id as "roleId", 
            r.role_name as "roleName",
            r.role_type as "roleType",
            am.menu_id as "menuId", 
            m.menu_name as "menuName"
        FROM access_menu am
        LEFT JOIN roles r ON am.role_id = r.role_id
        LEFT JOIN menus m ON am.menu_id = m.menu_id
        WHERE am.access_menu_id = $1
    `,
    GET_ACCESS_MENU_BY_ROLE_ID: `
        SELECT 
            access_menu.access_menu_id as "accessMenuId",
            access_menu.role_id as "roleId",  
            menus.menu_id as "menuId",
            menus.menu_name as "menuName",
            menus.parent_menu_id as "parentMenuId",
            menus.hierarchy_level as "hierarchyLevel",
            menus.route_path as "routePath", 
            menus.icon, 
            menus.active
        FROM access_menu 
        LEFT JOIN 
            menus ON access_menu.menu_id = menus.menu_id 
            AND access_menu.role_id = $1
        WHERE menus.active = true
        ORDER BY menus.hierarchy_level ASC
    `,
    GET_ALL_MENU_ACCESS_BY_ROLE_ID: `
        SELECT 
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
            AND access_menu.role_id = $1
        WHERE menus.active = true
        ORDER BY menus.hierarchy_level ASC
    `,
    CREATE_ACCESS_MENU: `
        INSERT INTO access_menu 
            (role_id, menu_id, created_by, created_at, updated_at) 
        VALUES ($1, $2, $3, NOW(), NOW()) 
        RETURNING access_menu_id as "accessMenuId",
                    menu_id as "menuId", 
                    role_id as "roleId", 
                    created_by as "createdBy"
    `, 
    DELETE_ACCESS_MENU_BY_ROLE_ID: `
        DELETE FROM access_menu WHERE role_id = $1
    `,
};
