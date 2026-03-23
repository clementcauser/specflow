"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEpic } from "@/actions/epics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EpicStatus } from "@/lib/enums";

const STATUS_OPTIONS = [
  { value: EpicStatus.OPEN, label: "Ouverte" },
  { value: EpicStatus.IN_PROGRESS, label: "En cours" },
  { value: EpicStatus.DONE, label: "Terminée" },
  { value: EpicStatus.ARCHIVED, label: "Archivée" },
] as const;

type EpicStatus = (typeof STATUS_OPTIONS)[number]["value"];

export function EpicStatusSelect({
  epicId,
  currentStatus,
}: {
  epicId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(status: string) {
    startTransition(async () => {
      await updateEpic({ epicId, status: status as EpicStatus });
      router.refresh();
    });
  }

  return (
    <Select value={currentStatus} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-36 h-8 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
