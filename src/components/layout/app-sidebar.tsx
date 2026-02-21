"use client";

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Ticket, Search, Shield, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/portal", label: "Lodge Complaint", icon: Ticket },
  { href: "/portal/track", label: "Track Complaint", icon: Search },
  { href: "/portal/admin", label: "Admin Panel", icon: Shield },
];

const AppLogo = () => (
    <div className="flex items-center gap-2">
        <div className="bg-sidebar-accent p-1.5 rounded-md leading-none">
            <span className="font-bold text-sidebar-accent-foreground text-lg">RS</span>
        </div>
        <h1 className="font-headline text-2xl font-bold text-inherit group-data-[collapsible=icon]:hidden">
            RAILSEVA
        </h1>
    </div>
);

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Link href="/portal" className="flex items-center gap-2 p-2 text-sidebar-primary-foreground">
            <AppLogo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={{ children: 'Logout' }} asChild>
                    <Link href="/">
                      <LogOut />
                      <span>Logout</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
