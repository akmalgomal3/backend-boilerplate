export const MenusQuery = {
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
};
