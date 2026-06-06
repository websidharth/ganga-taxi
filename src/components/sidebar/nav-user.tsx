// 'use client';

// import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from 'lucide-react';

// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
// import ActiveUserSwitch from '@/components/features/account/active-user-switch';
// import useLogout from '@/hooks/use-logout';
// import Link from 'next/link';
// import { FaRegUser } from 'react-icons/fa';
// import useModalShowHide from '@/hooks/use-modal-show-hide';
// import useGetCurrentUser from '@/hooks/use-get-current-user';
// import { Roles } from '@/enums/roles.enum';
// import ChangePassword from '@/components/features/account/change-password';

// export function NavUser() {
//   const currentUser = useGetCurrentUser()
//   const currentUserRole = currentUser.currentUser?.roleName
//   const { isMobile } = useSidebar();
//   const logout = useLogout();
//   const {
//     showModal: showChangePasswordModal,
//     openModal: openChangePasswordModal,
//     closeModal: closeChangePasswordModal,

//   } = useModalShowHide();

//   return (
//     <>
//       <SidebarMenu>
//         <SidebarMenuItem>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ">
//                 <ActiveUserSwitch />
//                 <ChevronsUpDown className="ml-auto size-4" />
//               </SidebarMenuButton>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent
//               className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg "
//               side={isMobile ? 'bottom' : 'right'}
//               align="end"
//               sideOffset={4}
//             >
//               <DropdownMenuLabel className="p-0 font-normal ">
//                 <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
//                   <ActiveUserSwitch />
//                 </div>
//               </DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               <DropdownMenuGroup>

//                 {currentUserRole !== Roles.ADMINISTRATOR && (
//                   <DropdownMenuItem asChild>
//                     <Link href="/dashboard/account/edit-profile">
//                       <FaRegUser /> My Profile
//                     </Link>
//                   </DropdownMenuItem>
//                 )}

//                 <DropdownMenuItem onClick={() => openChangePasswordModal(0)}>
//                   <Bell />
//                   Change Password
//                 </DropdownMenuItem>
//               </DropdownMenuGroup>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem onClick={async () => {
//                 await logout();
//               }}>
//                 <LogOut />
//                 Log out
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </SidebarMenuItem>
//       </SidebarMenu>
//       {showChangePasswordModal && (
//         <ChangePassword
//           id={0}
//           isOpen={showChangePasswordModal}
//           onClose={closeChangePasswordModal}
//         />
//       )}
//     </>
//   );
// }
