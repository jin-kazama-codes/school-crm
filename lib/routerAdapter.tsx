"use client";

import { useRouter, usePathname, useParams as useNextParams } from "next/navigation";
import NextLink from "next/link";
import React from "react";

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === "number") {
      if (to === -1) router.back();
      return;
    }
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
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

export function Link({ to, href, children, ...props }: any) {
  const destination = href || to || "#";
  return (
    <NextLink href={destination} {...props}>
      {children}
    </NextLink>
  );
}
