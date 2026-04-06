"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export function CheckoutSuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const success = searchParams.get("success");

  useEffect(() => {
    if (success !== "true") return;

    router.replace(pathname, { scroll: false });
    toast.success("Abonnement Pro activé — bienvenue !");
  }, [success, pathname, router]);

  return null;
}
