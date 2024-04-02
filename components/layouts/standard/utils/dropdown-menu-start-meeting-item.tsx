"use client";

import startMeeting from "@/actions/meeting/start-meeting";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { useEffect,  useRef } from "react";
import { useFormState } from "react-dom";

export default function DropdownMenuStartMeetingItem() {
  const ref = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(startMeeting, {});

  useEffect(() => {
    if (state.errorMessage) {
      toast({
        title: "Error",
        description: state.errorMessage
      });
    }
  }, [state.errorMessage])

  return (
    <DropdownMenuItem onClick={() => {
      ref.current?.requestSubmit();
    }}>
      <form ref={ref} action={formAction} className="hidden" />
      Start a meeting
    </DropdownMenuItem>
  );
}