"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchActiveWorkspace } from "@/actions/tenant";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Workspace = { id: string; name: string; slug: string; plan: string };

type Props = {
  user: { name: string; email: string; image?: string | null };
  activeWorkspace: Workspace;
  workspaces: Workspace[];
};

export function TopBar({ user, activeWorkspace, workspaces }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSwitch(workspaceId: string) {
    startTransition(async () => {
      await switchActiveWorkspace(workspaceId);
      router.refresh();
    });
  }

  return (
    <header className="md:hidden h-14 flex items-center justify-between px-4 border-b bg-background shrink-0">
      <span className="font-semibold text-base">SpecFlow</span>

      {/* Workspace switcher mobile — Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-2">
            <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
              <span className="text-[10px] font-medium text-primary">
                {activeWorkspace.name[0]?.toUpperCase()}
              </span>
            </div>
            <span className="text-sm max-w-[120px] truncate">
              {activeWorkspace.name}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left text-base">
              Changer d&apos;espace de travail
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-1">
            {workspaces.map((workspace) => {
              const isActive = workspace.id === activeWorkspace.id;
              return (
                <button
                  key={workspace.id}
                  onClick={() => handleSwitch(workspace.id)}
                  disabled={isPending || isActive}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left",
                    isActive
                      ? "bg-accent"
                      : "hover:bg-accent/50 active:bg-accent",
                  )}
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {workspace.name[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{workspace.name}</p>
                    <p className="text-xs text-muted-foreground">{workspace.slug}</p>
                  </div>
                  {isActive && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => router.push("/settings/workspaces")}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent/50 text-left"
            >
              <div className="h-9 w-9 rounded-lg border-2 border-dashed border-border flex items-center justify-center shrink-0">
                <span className="text-lg text-muted-foreground">+</span>
              </div>
              <p className="font-medium text-sm">Nouvel espace de travail</p>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <Avatar className="h-8 w-8">
        <AvatarImage src={user.image ?? undefined} />
        <AvatarFallback className="text-xs">
          {user.name[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
