"use client";

import { useState, useTransition } from "react";
import { deleteTeam } from "@/actions/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = { orgId: string; teamName: string };

export function DeleteTeamDialog({ orgId, teamName }: Props) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError("");
    startTransition(async () => {
      try {
        await deleteTeam(orgId);
      } catch (err: unknown) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Supprimer l&apos;équipe
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer l&apos;équipe</DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Toutes les données de l&apos;équipe
            seront supprimées.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>
              Tapez <span className="font-mono font-medium">{teamName}</span>{" "}
              pour confirmer
            </Label>
            <Input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={teamName}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={confirm !== teamName || isPending}
              onClick={handleDelete}
            >
              {isPending ? "Suppression…" : "Supprimer définitivement"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
