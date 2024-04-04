"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { AvatarIcon, CameraIcon, DesktopIcon, EnterFullScreenIcon, HamburgerMenuIcon, HandIcon, ReaderIcon, RocketIcon, SpeakerLoudIcon, ViewGridIcon } from "@radix-ui/react-icons";
import { PopoverContent } from "@radix-ui/react-popover";
import { useAppStore } from "./app-store-provider";
import { useMemo, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";

function Video({ id, stream, className }: { id: string, stream: MediaStream, className?: string }) {
  return (
    <video id={id} className={className} 
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

export default function VideoConference({ hostId, username }: { hostId: string, username: string }) {
  const { video, screenVideo, isSharingVideo, isSharingAudio, isSharingScreenVideo } = useAppStore((state) => state.selfStream);
  const otherMedias = useAppStore((state) => state.otherMedias);
  const presentationRequests = useAppStore((state) => state.presentationRequests);

  const requestPresentation = useAppStore((state) => state.requestPresentation);
  const acceptPresentation = useAppStore((state) => state.acceptPresentation);
  const rejectPresentation = useAppStore((state) => state.rejectPresentation);

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

  const [allowPresentationRequest, setAllowPresentationRequest] = useState(true);

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

      <div className="grid grid-cols-3 grid-rows-3 flex-grow gap-4 items-center overflow-y-auto">
        {
          visibleVideos.map(({ id, username, stream }) => {
            return (
              <Card key={`video-${id}`} className="h-full w-full">
                <div className="relative h-full w-full bg-black rounded-xl">
                  <Video id={`remote-${id}`} key={`video-${id}`} stream={stream} className="absolute h-full w-full object-contain rounded-xl" />

                  <div className="absolute h-full w-full flex flex-row justify-between items-end p-2">
                    <Button size="icon" className="rounded-full">
                      {username.charAt(0).toUpperCase()}
                    </Button>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary" size="icon" className="rounded-full"
                          onClick={() => {
                            const videoElement = document.getElementById(`remote-${id}`) as HTMLVideoElement;

                            videoElement.requestFullscreen({
                              navigationUI: "show"
                            });
                          }}
                        >
                          <EnterFullScreenIcon />
                        </Button>
                      </TooltipTrigger>

                      <TooltipContent>
                        Enter full screen
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </Card>
            );
          })
        }
      </div>
      
      <div className="flex flex-row flex-shrink w-full justify-end items-center gap-4">
        {
          (username === hostId) && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  className="relative rounded-full"
                >
                  <ReaderIcon />

                  {
                    (presentationRequests.length > 0) && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs leading-none text-red-100 transform translate-x-1/3 -translate-y-1/3 bg-red-600 rounded-full">{ presentationRequests.length }</span>
                    )
                  }
                </Button>
              </SheetTrigger>

              <SheetContent className="overflow-y-scroll">
                <SheetHeader>
                  <SheetTitle>Presentation requests</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col w-full gap-2 mt-6">
                  {
                    presentationRequests.map((attendeeId) => {
                      return (
                        <ContextMenu key={attendeeId}>
                          <ContextMenuTrigger>
                            <Alert>
                              <RocketIcon className="h-4 w-4" />
                              <AlertTitle>Request</AlertTitle>
                              <AlertDescription>
                                {attendeeId} has request for a presentation
                              </AlertDescription>
                            </Alert>
                          </ContextMenuTrigger>

                          <ContextMenuContent>
                            <ContextMenuItem onClick={() => acceptPresentation(attendeeId)}>Accept</ContextMenuItem>
                            <ContextMenuItem onClick={() => rejectPresentation(attendeeId)}>Reject</ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      );
                    })
                  }
                </div>
              </SheetContent>
            </Sheet>
          )
        }

        <Button
          size="icon"
          className="rounded-full"
          
          disabled={!allowPresentationRequest}

          onClick={() => {
            if (allowPresentationRequest) {
              try {
                requestPresentation();

                setAllowPresentationRequest(false);
                setTimeout(() => {
                  setAllowPresentationRequest(true);
                }, 5000);
              } catch (error: any) {
                toast({
                  title: "Error",
                  description: error.message
                });
              }
            }
          }}
        >
          <HandIcon />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              className="rounded-full"
            >
              <AvatarIcon />
            </Button>
          </PopoverTrigger>

          <PopoverContent side="top" className="z-50">
            <Card className="flex flex-row gap-2 p-2">
              { (selfMedias.length === 0) && "There is nothing to display" }

              {
                selfMedias.map(({ key, stream }) => {
                  return (
                    <Video id={`local-${key}`} key={key} stream={stream} className="w-96" />
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

            className="z-50"
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