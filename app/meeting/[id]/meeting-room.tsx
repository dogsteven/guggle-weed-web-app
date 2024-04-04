"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";
import ChatBox from "./chat-box";
import VideoConference from "./video-conference";
import { toast } from "@/components/ui/use-toast";
import { useAppStore } from "./app-store-provider";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useEffect } from "react";

type MeetingRoomProps = {
  username: string,
  hostId: string,
  meetingId: string
}

type ConnectionState = "initializing" | "initialization_error" | "ready" | "joining" | "joined" | "disconnected";

export default function MeetingRoom({ username, hostId, meetingId }: MeetingRoomProps) {
  const connectionState = useAppStore((state) => state.connectionState);

  const meetingStatus = useAppStore((state) => state.meetingStatus);
  
  const joinMeeting = useAppStore((state) => state.joinMeeting);

  if (meetingStatus === "ended") {
    return (
      <>
        This meeting has ended.
      </>
    );
  }

  if (connectionState === "initializing") {
    return (
      <>
        Connecting to server...
      </>
    );
  }

  if (connectionState === "initialization_error") {
    return (
      <>
        Failed to connect to server, please reload this page.
      </>
    );
  }

  if (connectionState === "ready" || connectionState === "joining") {
    return (
      <Button
        disabled={connectionState === "joining"}
        onClick={async () => {
          try {
            await joinMeeting();
          } catch (error: any) {
            toast({
              title: "Error",
              description: error.message
            });
          }
        }}
      >
        { (connectionState === "joining") && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> } Join this meeting
      </Button>
    );
  }

  if (connectionState === "disconnected") {
    return (
      <>
        An unexpected error happened, please reload this page.
      </>
    )
  }

  return (
    <Card className="w-full h-full">
      <ResizablePanelGroup direction="horizontal" className="flex flex-row gap-2">
        <ResizablePanel>
          <div className="flex flex-col w-full h-full p-6 gap-2">
            <VideoConference hostId={hostId} username={username} />
          </div>
        </ResizablePanel>

        <ResizableHandle className="z-0" />

        <ResizablePanel maxSize={25} defaultSize={25} minSize={20}>
          <div className="flex flex-col h-full p-6">
            <ChatBox />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Card>
  )
}