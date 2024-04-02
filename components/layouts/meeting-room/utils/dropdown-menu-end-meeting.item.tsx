"use client";

import endMeeting from "@/actions/meeting/end-meeting";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useId } from "react";
import { useFormState } from "react-dom";

export default function DropdownMenuEndMeetingItem({ meetingId }: { meetingId: string }) {
  const id = useId();
  const [state, formAction] = useFormState(endMeeting, {});

  useEffect(() => {
    if (state.errorMessage) {
      toast({
        title: "Error",
        description: state.errorMessage
      });
    }
  }, [state.errorMessage]);

  return (
    <DropdownMenuItem onClick={() => {
      const form = document.getElementById(id) as HTMLFormElement;
      form.requestSubmit();
    }}>
      <form id={id} action={formAction} className="hidden">
        <input type="hidden" name="meetingId" value={meetingId} />
      </form>
      End this meeting
    </DropdownMenuItem>
  );
}