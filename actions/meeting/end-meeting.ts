"use server";

import { unwrapResult } from "@/lib/utils";
import { redirect } from "next/navigation";
import getUsername from "../auth/get-username";

type EndMeetingActionState = {
  errorMessage?: string
}

export default async function endMeeting(prevState: any, formData: FormData): Promise<EndMeetingActionState> {
  const username = await getUsername();
  const meetingId = formData.get("meetingId") as string;

  if (!username) {
    redirect(`/account/sign-in?returnUrl=/meeting/${meetingId}`);
  }

  const response = await fetch(`http://localhost:8000/meetings/${meetingId}/end`, {
    method: "post",
    headers: {
      "x-username": username
    }
  });

  if (!response.ok) {
    return {
      errorMessage: "An unexpected error occurred"
    };
  }

  unwrapResult(await response.json());

  redirect("/");
}