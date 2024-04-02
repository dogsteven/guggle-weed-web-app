import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import NavLink from "@/components/utils/nav-link";
import DropdownMenuSignoutItem from "./utils/dropdown-menu-signout-item";
import ThemeModeButton from "@/components/utils/theme-mode-button";
import getUsername from "@/actions/auth/get-username";
import DropdownMenuStartMeetingItem from "./utils/dropdown-menu-start-meeting-item";

export default async function StandardLayout({ children }: { children?: React.ReactNode }) {
  const username = await getUsername();

  if (!username) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <div>
            <Link href="/" className="text-lg font-semibold">
              GuggleWeed
            </Link>
          </div>

          <div className="flex flex-row flex-grow justify-center gap-6 font-semibold text-sm">
            <NavLink href="/" className="transition-colors hover:text-foreground">Home</NavLink>

            <NavLink href="/about" className="transition-colors hover:text-foreground">About</NavLink>
          </div>

          <div className="flex items-center justify-end gap-2 font-medium text-sm">
            <ThemeModeButton />
            <Button variant="ghost" asChild>
              <Link href="/account/sign-in" className="transition-colors hover:text-foreground">
                  Sign in
              </Link>
            </Button>
      
            <Button asChild>
              <Link href="/account/sign-up" className="transition-colors hover:text-foreground">
                  Sign up
              </Link>
            </Button>
          </div>
        </header>

        {children}
      </div>
    );
  } else {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <div>
            <Link href="/" className="text-lg font-semibold">
              GuggleWeed
            </Link>
          </div>
  
          <div className="flex flex-row flex-grow justify-center gap-6 font-semibold text-sm">
            <NavLink href="/" className="transition-colors hover:text-foreground">Home</NavLink>
  
            <NavLink href="/about" className="transition-colors hover:text-foreground">About</NavLink>
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
                <DropdownMenuSeparator />
                <DropdownMenuStartMeetingItem />
                <DropdownMenuSeparator />
                <DropdownMenuSignoutItem />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
  
        {children}
      </div>
    );
  }
}