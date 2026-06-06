import { services } from '@/lib/constants';

type MenuItem = {
  id: string;
  title: string;
  url: string;
  isActive?: boolean;
  role: string[];
  children?: MenuItem[];
};

const toolChildren: MenuItem[] = services.map((service) => ({
  id: `tool-${service.slug.replace(/^\//, '')}`,
  title: service.title,
  url: service.slug,
  isActive: false,
  role: ['ALL'],
}));

export const SideBarMenu: MenuItem[] = [
  {
    id: 'tools',
    title: 'Tools',
    url: '#',
    isActive: true,
    role: ['ALL'],
    children: toolChildren,
  },
];
