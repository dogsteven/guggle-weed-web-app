"use server";

import { unwrapResult } from "@/lib/utils";
import { redirect } from "next/navigation";
import getUsername from "../auth/get-username";

type StartMeetingActionState = {
  errorMessage?: string
}

export default async function startMeeting(prevState: any, formData: FormData): Promise<StartMeetingActionState> {
  const username = await getUsername();

  if (!username) {
    redirect("/account/sign-in");
  }

  const response = await fetch("http://localhost:8000/meetings/start", {
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

  const { meetingId } = unwrapResult<{ meetingId: any }>(await response.json());

  redirect(`/meeting/${meetingId}`)
}