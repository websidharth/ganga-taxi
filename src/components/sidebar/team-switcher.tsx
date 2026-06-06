// 'use client';
// import * as React from 'react';

// import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
// import Link from 'next/link';
// import Image from 'next/image';
// import config from '@/config';

// export function TeamSwitcher({
//   teams,
// }: {
//   teams: {
//     name: string;
//     logo: React.ElementType;
//     plan: string;
//   }[];
// }) {
//   return (
//     <SidebarMenu>
//       <SidebarMenuItem>
//         <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent  data-[state=open]:text-sidebar-accent-foreground h-full">
//           <Link href="/" className="inline-block" title="RepuGen">
//             <Image src={`${config.cdnUrl}/images/logo.svg`} width={190} height={95} alt={`Logo of ${config.appName}`} className="dark:grayscale" />
//           </Link>
//         </SidebarMenuButton>
//       </SidebarMenuItem>
//     </SidebarMenu>
//   );
// }
