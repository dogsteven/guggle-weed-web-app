import getUsername from "@/actions/auth/get-username";
import { unwrapResult } from "@/lib/utils";
import { redirect } from "next/navigation";
import MeetingRoomLayout from "@/components/layouts/meeting-room/meeting-room-layout";
import MeetingRoom from "./meeting-room";
import AppStoreProvider from "./app-store-provider";

export default async function Page({ params }: { params: { id: string } }) {
  const username = await getUsername();

  if (!username) {
    redirect(`/account/sign-in?returnUrl=/meeting/${params.id}`);
  }

  let meetingHostIdResponse;
  
  try {
    meetingHostIdResponse = (await fetch(`http://localhost:8000/meetings/${params.id}/hostId`, { cache: "no-store" }));
  } catch (error: any) {
    return (
      <main className="w-full h-screen flex flex-row justify-center items-center bg-muted/40">
        {error.message}
      </main>
    );
  }

  if (!meetingHostIdResponse.ok) {
    return (
      <main className="w-full h-screen flex flex-row justify-center items-center bg-muted/40">
        An unexpected error ocurred!
      </main>
    );
  }

  const body = await meetingHostIdResponse.json();

  let hostId: string;

  try {
    hostId = unwrapResult<{ hostId: string }>(body).hostId;
  } catch (error: any) {
    return (
      <main className="w-full h-screen flex flex-row justify-center items-center bg-muted/40">
        {error.message}
      </main>
    );
  }
  
  return (
    <MeetingRoomLayout username={username} hostId={hostId} meetingId={params.id}>
      <main className="w-full h-[calc(100vh_-_theme(spacing.16))] flex flex-row justify-center items-center bg-muted/40 p-4 gap-4">
        <AppStoreProvider username={username} meetingId={params.id}>
          <MeetingRoom username={username} hostId={hostId} meetingId={params.id} />
        </AppStoreProvider>
      </main>
    </MeetingRoomLayout>
  );
}