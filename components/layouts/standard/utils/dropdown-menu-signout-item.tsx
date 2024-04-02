"use client";

import signout from "@/actions/auth/sign-out";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRef } from "react";

export default function DropdownMenuSignoutItem() {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <DropdownMenuItem onClick={() => {
      ref.current?.requestSubmit();
    }}>
      <form ref={ref} action={signout} className="hidden" />
      Sign out
    </DropdownMenuItem>
  );
}