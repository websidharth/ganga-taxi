'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarTrigger, useSidebar } from '@/components/ui/sidebar'; 
import config from '@/config';
import { ScrollArea } from '../ui/scroll-area';
import { NavMain } from './nav-main';


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <div className="text-end block xl:hidden absolute end-0 top-0 m-1 bg-accent">
        <SidebarTrigger className="" />
      </div>

      {/* <SidebarHeader>
        <div className="text-center">
          <Link href="/" className="inline-block" title={`${config.appName}`}>
            <Logo width={150} height={95} className="dark:grayscale w-[150px] h-[95px]" logoType={state === 'collapsed' ? 'icon' : 'logo'} />
          </Link>
        </div>
      </SidebarHeader> */}
      <SidebarContent> 
        <ScrollArea className="h-svh pe-2 block">
          <NavMain />
        </ScrollArea>
      </SidebarContent>
      {/* <SidebarFooter className="block xl:hidden">
        <NavUser />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}
