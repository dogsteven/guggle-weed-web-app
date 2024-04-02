"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { AvatarIcon, CameraIcon, DesktopIcon, HamburgerMenuIcon, SpeakerLoudIcon, ViewGridIcon } from "@radix-ui/react-icons";
import { PopoverContent } from "@radix-ui/react-popover";
import { useAppStore } from "./app-store-provider";
import { useMemo } from "react";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function Video({ stream, className }: { stream: MediaStream, className?: string }) {
  return (
    <video className={className} 
      ref={(ref) => {
        if (ref) {
          ref.srcObject = stream;
          ref.onloadedmetadata = (event) => {
            ref.play();
          }
        }
      }}
      autoPlay
    />
  )
}

function Audio({ stream }: { stream: MediaStream }) {
  return (
    <audio
      ref={(ref) => {
        if (ref) {
          ref.srcObject = stream;
        }
      }}
      autoPlay
    />
  )
}

export default function VideoConference() {
  const { video, screenVideo, isSharingVideo, isSharingAudio, isSharingScreenVideo } = useAppStore((state) => state.selfStream);
  const otherMedias = useAppStore((state) => state.otherMedias);

  const openVideo = useAppStore((state) => state.openVideo);
  const openAudio = useAppStore((state) => state.openAudio);
  const openScreenVideo = useAppStore((state) => state.openScreenVideo);
  const closeVideo = useAppStore((state) => state.closeVideo);
  const closeAudio = useAppStore((state) => state.closeAudio);
  const closeScreenVideo = useAppStore((state) => state.closeScreenVideo);

  const visibleVideos = useMemo(() => {
    return otherMedias.filter(({ kind }) => kind === "video").slice(0, 9);
  }, [otherMedias]);

  const audios = useMemo(() => {
    return otherMedias.filter(({ kind }) => kind === "audio");
  }, [otherMedias]);

  const selfMedias = useMemo(() => {
    const medias: { key: string, stream: MediaStream }[] = [];

    if (video) {
      medias.push({ key: "video", stream: video });
    }

    if (screenVideo) {
      medias.push({ key: "screen-video", stream: screenVideo });
    }

    return medias;
  }, [video, screenVideo]);

  return (
    <TooltipProvider>
      <div className="hidden">
        {
          audios.map(({ id, stream }) => {
            return (
              <Audio key={`audio-${id}`} stream={stream} />
            );
          })
        }
      </div>

      <div className="grid grid-cols-3 flex-grow gap-2">
        {
          visibleVideos.map(({ id, stream }) => {
            return (
              <Video key={`video-${id}`} stream={stream} className="w-full" />
            );
          })
        }
      </div>

      <div className="flex flex-row w-full justify-end items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              className="rounded-full"
            >
              <AvatarIcon />
            </Button>
          </PopoverTrigger>

          <PopoverContent side="top">
            <Card className="flex flex-row gap-2 p-2">
              { (selfMedias.length === 0) && "There is nothing to display" }

              {
                selfMedias.map(({ key, stream }) => {
                  return (
                    <Video key={key} stream={stream} className="w-96" />
                  );
                })
              }
            </Card>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              className="rounded-full"
            >
              <HamburgerMenuIcon />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              // @ts-ignore
              event.target.focus();
            }}
          >
            <Card className="flex flex-row gap-2 p-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="rounded-full"

                    variant={ isSharingVideo ? "default" : "secondary" }

                    onClick={async () => {
                      try {
                        if (!isSharingVideo) {
                          await openVideo();
                        } else {
                          await closeVideo();
                        }
                      } catch (error: any) {
                        console.error(error);
                        toast({
                          title: "Error",
                          description: error.message
                        });
                      }
                    }}
                  >
                    <CameraIcon />
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  { isSharingVideo ? "Close camera" : "Open camera" }
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="rounded-full"

                    variant={ isSharingAudio ? "default" : "secondary" }

                    onClick={async () => {
                      try {
                        if (!isSharingAudio) {
                          await openAudio();
                        } else {
                          await closeAudio();
                        }
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message
                        });
                      }
                    }}
                  >
                    <SpeakerLoudIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  { isSharingAudio ? "Close speaker" : "Open speaker" }
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="rounded-full"

                    variant={ isSharingScreenVideo ? "default" : "secondary" }

                    onClick={async () => {
                      try {
                        if (!isSharingScreenVideo) {
                          await openScreenVideo();
                        } else {
                          await closeScreenVideo();
                        }
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message
                        });
                      }
                    }}
                  >
                    <DesktopIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  { isSharingScreenVideo ? "Close screen" : "Open screen" }
                </TooltipContent>
              </Tooltip>
            </Card>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  )
}