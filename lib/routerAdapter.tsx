"use client";

import { useRouter, usePathname, useParams as useNextParams } from "next/navigation";
import NextLink from "next/link";
import React from "react";

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, options?: { replace?: boolean; scroll?: boolean }) => {
    if (typeof to === "number") {
      if (to === -1) router.back();
      return;
    }
    const scroll = options?.scroll ?? false;
    if (options?.replace) {
      router.replace(to, { scroll });
    } else {
      router.push(to, { scroll });
    }
  };
}

export function useLocation() {
  const pathname = usePathname();
  return {
    pathname: pathname || "/",
    search: typeof window !== "undefined" ? window.location.search : "",
    state: null,
    hash: typeof window !== "undefined" ? window.location.hash : "",
  };
}

export function useParams() {
  const params = useNextParams();
  return (params as Record<string, string>) || {};
}

export function Link({ to, href, children, scroll = false, ...props }: any) {
  const destination = href || to || "#";
  return (
    <NextLink href={destination} scroll={scroll} {...props}>
      {children}
    </NextLink>
  );
}
