"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@shared/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Trophy,
  Users,
  Scale,
  Settings,
  ArrowLeft,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "", icon: LayoutDashboard },
  { label: "Schedule", href: "/schedule", icon: CalendarDays },
  { label: "Events", href: "/events", icon: Trophy },
  { label: "Staff", href: "/staff", icon: Users },
  { label: "Judges", href: "/judges", icon: Scale },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function DashboardNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const basePath = `/competitions/${slug}/dashboard`;

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const href = `${basePath}${item.href}`;
        const isActive =
          item.href === ""
            ? pathname === basePath
            : pathname.startsWith(href);

        return (
          <Link
            key={item.label}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}

      <div className="mt-4 pt-4 border-t border-border">
        <Link
          href={`/competitions/${slug}`}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to competition
        </Link>
      </div>
    </nav>
  );
}
