"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { UrlObject } from "url";

type NavLinkInternalProps = {
  children?: React.ReactNode,
  activeClassName?: string,
  inactiveClassName?: string,
  checkActive?: (href: string | UrlObject, pathname: string) => boolean
}

export type NavLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & LinkProps & React.RefAttributes<HTMLAnchorElement> & NavLinkInternalProps;

export default function NavLink({ href, className, activeClassName, inactiveClassName, ...props }: NavLinkProps) {
  const pathname = usePathname();

  const checkActive = React.useMemo(() => {
    if (props.checkActive) {
      return props.checkActive;
    } else {
      return ((href: string | UrlObject, pathname: string) => {
        return href === pathname;
      });
    }
  }, [props.checkActive]);

  const isActive = checkActive(href, pathname);

  return (
    <Link href={href} className={cn(className, isActive ? (activeClassName ?? "text-foreground") : (inactiveClassName ?? "text-muted-foreground"))} {...props}>
      {props.children}
    </Link>
  );
}