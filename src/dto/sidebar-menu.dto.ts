 

export interface SideBarMenuDto {
  id: string;
  title: string;
  url: string;
  icon?: React.ComponentType | null;
  isActive?: boolean;
  role?: string[];
  children?: SideBarMenuDto[];
};
