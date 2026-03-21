"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, Settings, Layers, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/specs", label: "Mes specs", icon: FileText },
  { href: "/workspaces", label: "Espaces", icon: Users },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function BottomNav({ workspaceType }: { workspaceType?: string }) {
  const pathname = usePathname();

  const items = [
    BASE_NAV_ITEMS[0],
    ...(workspaceType === "PRODUCT"
      ? [{ href: "/epics", label: "Epics", icon: Layers }]
      : workspaceType === "FREELANCE"
        ? [{ href: "/clients", label: "Clients", icon: Briefcase }]
        : []),
    ...BASE_NAV_ITEMS.slice(1),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="flex items-stretch h-16">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 text-[10px] transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
