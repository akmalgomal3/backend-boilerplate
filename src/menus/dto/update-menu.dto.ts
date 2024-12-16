export class UpdateMenuDto {
  menuName?: string;
  parentMenuId?: string;
  routePath?: string;
  icon?: string;
  hierarchyLevel?: number;
  description?: string;
  active?: boolean;
}
