"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, List, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

type RailMadadHeaderProps = {
  authenticated?: boolean;
  userName?: string;
};

const authLinks = [
  { href: "/portal", label: "Home", icon: Home },
  { href: "/portal/lodge", label: "Lodge Complaint", icon: FileText },
  { href: "/portal/track", label: "My Complaints", icon: List },
];

const AppLogo = () => (
  <Link href="/" className="flex items-center gap-3">
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">
      RM
    </div>
    <div className="font-headline text-3xl font-semibold uppercase tracking-tight text-white">
      Rail Madad
    </div>
  </Link>
);

export function RailMadadHeader({ authenticated = false, userName = "Passenger" }: RailMadadHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#284fa9] bg-accent text-white">
      <div className="mx-auto flex h-18 w-full max-w-[1280px] items-center justify-between gap-3 px-4 md:px-8">
        <AppLogo />

        {authenticated ? (
          <div className="flex items-center gap-2 md:gap-3">
            <nav className="hidden items-center gap-1 md:flex">
              {authLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-base font-semibold transition-colors",
                      isActive ? "bg-[#3f66bf] text-white" : "text-white/90 hover:bg-[#2f57b1] hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="hidden items-center gap-2 border-l border-white/25 pl-4 text-base md:flex">
              <User className="h-4 w-4" />
              <span className="font-semibold">{userName}</span>
            </div>
            <Link
              href="/"
              className="hidden items-center gap-2 rounded-md px-3 py-2 text-base font-semibold text-white/90 transition-colors hover:bg-[#2f57b1] hover:text-white md:flex"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-md px-3 py-2 text-base font-semibold text-white hover:bg-[#2f57b1]">
              Login
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground hover:opacity-95"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
