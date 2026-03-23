"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchActiveWorkspace } from "@/actions/tenant";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  ChevronDown,
  Check,
  Plus,
  Layers,
  Briefcase,
  Zap,
} from "lucide-react";

const BASE_NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/specs", label: "Mes specs", icon: FileText },
  { href: "/workspaces", label: "Mes espaces", icon: Users },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

type Workspace = { id: string; name: string; slug: string; plan: string; type: string };

type Props = {
  user: { name: string; email: string; image?: string | null };
  activeWorkspace: Workspace;
  workspaces: Workspace[];
};

export function Sidebar({ user, activeWorkspace, workspaces }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSwitch(workspaceId: string) {
    startTransition(async () => {
      await switchActiveWorkspace(workspaceId);
      router.refresh();
    });
  }

  return (
    <aside className="hidden md:flex flex-col w-60 border-r bg-background shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b">
        <span className="font-semibold text-base tracking-tight">SpecFlow</span>
      </div>

      {/* Workspace switcher */}
      <div className="px-3 py-3 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-9 px-2 font-normal"
              disabled={isPending}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-medium text-primary">
                    {activeWorkspace.name[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="truncate text-sm">{activeWorkspace.name}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Mes espaces de travail
            </DropdownMenuLabel>
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onSelect={() => handleSwitch(workspace.id)}
                className="gap-2"
              >
                <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-medium text-primary">
                    {workspace.name[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="flex-1 truncate">{workspace.name}</span>
                {workspace.id === activeWorkspace.id && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/workspaces" className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvel espace de travail
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {[
          ...BASE_NAV_ITEMS.slice(0, 1),
          ...(activeWorkspace.type === "PRODUCT"
            ? [{ href: "/epics", label: "Epics", icon: Layers }]
            : activeWorkspace.type === "FREELANCE"
              ? [{ href: "/clients", label: "Clients", icon: Briefcase }]
              : []),
          ...BASE_NAV_ITEMS.slice(1),
        ].map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA for Free plan */}
      {activeWorkspace.plan === "FREE" && (
        <div className="px-3 pb-2">
          <Link
            href="/plans"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-primary/8 border border-primary/20 text-sm text-primary hover:bg-primary/15 transition-colors group"
            aria-label="Passer au plan Pro"
          >
            <Zap className="h-4 w-4 shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs leading-none">Passer au Pro</p>
              <p className="text-[10px] text-primary/70 mt-0.5 font-mono">
                Plan gratuit actif
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* User */}
      <div className="px-3 py-3 border-t">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-xs">
              {user.name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-none truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
