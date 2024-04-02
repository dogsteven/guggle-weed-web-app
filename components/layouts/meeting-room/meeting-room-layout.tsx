import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ThemeModeButton from "@/components/utils/theme-mode-button"
import Link from "next/link"
import * as React from "react"
import DropdownMenuEndMeetingItem from "./utils/dropdown-menu-end-meeting.item"

type MeetingRoomLayoutProps = {
  username: string,
  hostId: string,
  meetingId: string,
  children?: React.ReactNode
}

export default async function MeetingRoomLayout({ username, hostId, meetingId, children }: MeetingRoomLayoutProps) {
  return (
    <div className="flex h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div>
          <Link href="/" className="text-lg font-semibold">
            GuggleWeed
          </Link>
        </div>

        <div className="flex flex-row flex-grow justify-center gap-6 font-semibold text-sm">
        </div>

        <div className="flex items-center justify-end gap-2 font-medium text-sm">
          <ThemeModeButton />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="icon" className="rounded-full">
                { username.charAt(0).toUpperCase() }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{username}</DropdownMenuLabel>
              {
                (username === hostId) && (
                  <React.Fragment>
                    <DropdownMenuSeparator />
                    <DropdownMenuEndMeetingItem meetingId={meetingId} />
                  </React.Fragment>
                )
              }
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {children}
    </div>
  )
}