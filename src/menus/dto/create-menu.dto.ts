export class CreateMenuDto {
  menuName: string;
  parentMenuId?: string;
  routePath?: string;
  icon?: string;
  hierarchyLevel: number;
  description?: string;
  active?: boolean;
}
