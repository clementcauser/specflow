"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  removeMember,
  updateMemberRole,
  cancelInvitation,
  leaveWorkspace,
} from "@/actions/members";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { canManageRole, ROLE_LABELS } from "@/types/workspaces";
import type { Role } from "@/types/workspaces";

type Member = {
  id: string;
  role: string;
  userId: string;
  user: { id: string; name: string; email: string; image: string | null };
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
};

type Props = {
  members: Member[];
  invitations: Invitation[];
  currentUserId: string;
  currentRole: Role;
  workspaceId: string;
};

export function MembersTable({
  members,
  invitations,
  currentUserId,
  currentRole,
  workspaceId,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(memberId: string, role: string) {
    startTransition(async () => {
      await updateMemberRole(workspaceId, memberId, role as Role);
      router.refresh();
    });
  }

  function handleRemove(memberId: string) {
    startTransition(async () => {
      await removeMember(workspaceId, memberId);
      router.refresh();
    });
  }

  function handleLeave() {
    startTransition(async () => {
      await leaveWorkspace(workspaceId);
      router.push("/settings/workspaces");
    });
  }

  function handleCancelInvite(invitationId: string) {
    startTransition(async () => {
      await cancelInvitation(workspaceId, invitationId);
      router.refresh();
    });
  }

  const canManage = ["owner", "admin"].includes(currentRole);

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Membre</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead className="w-25"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => {
            const isSelf = m.userId === currentUserId;
            const targetRole = m.role as Role;
            const canEdit =
              canManage && !isSelf && canManageRole(currentRole, targetRole);

            return (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={m.user.image ?? undefined} />
                      <AvatarFallback>
                        {m.user.name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {m.user.name}{" "}
                        {isSelf && (
                          <span className="text-muted-foreground font-normal">
                            (vous)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {m.user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {canEdit ? (
                    <Select
                      defaultValue={targetRole}
                      onValueChange={(v) => handleRoleChange(m.id, v)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-36 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="member">Membre</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="secondary">{ROLE_LABELS[targetRole]}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isSelf && currentRole !== "owner" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleLeave}
                      disabled={isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      Quitter
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(m.id)}
                      disabled={isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      Retirer
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {invitations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">
            Invitations en attente
          </h3>
          <Table>
            <TableBody>
              {invitations.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <p className="text-sm">{inv.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ROLE_LABELS[inv.role as Role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canManage && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCancelInvite(inv.id)}
                        disabled={isPending}
                      >
                        Annuler
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
