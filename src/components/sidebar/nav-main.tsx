'use client';

import React, { useMemo, useState } from 'react';
import { SidebarGroup, SidebarMenu } from '@/components/ui/sidebar';
import { SideBarMenu } from '@/data/sidebar-menu.data';
import { SidebarItemRenderer } from './SidebarItem';
import { services } from '@/lib/constants';

type MenuItem = {
  id: string;
  title: string;
  url: string;
  isActive?: boolean;
  role: string[];
  children?: MenuItem[];
};


export function NavMain() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredMenu = useMemo(() => SideBarMenu, []);

  const toolChildren: MenuItem[] = services.map((service) => ({
    id: `tool-${service.slug.replace(/^\//, '')}`,
    title: service.title,
    url: service.slug,
    isActive: false,
    role: ['ALL'],
  }));


  return (
    <SidebarGroup>
      <SidebarMenu>
        {toolChildren.map((item, index) => (
          <SidebarItemRenderer
            key={item.id}
            index={index}
            openIndex={openIndex}
            setOpenIndex={setOpenIndex}
            item={item as any}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
