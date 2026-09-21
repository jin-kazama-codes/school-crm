"use client";

import { useRouter, usePathname, useParams as useNextParams } from "next/navigation";
import NextLink from "next/link";
import React from "react";

// Global navigation state store to emulate React Router's location.state in Next.js
let _currentState: any = null;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function setNavigationState(state: any) {
  _currentState = state;
  emitChange();
}

export function getNavigationState() {
  return _currentState;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, options?: { replace?: boolean; scroll?: boolean; state?: any }) => {
    if (typeof to === "number") {
      if (to === -1) router.back();
      return;
    }
    if (options && "state" in options) {
      setNavigationState(options.state);
    }
    const scroll = options?.scroll ?? false;
    if (to === "#" || to === "") {
      return;
    }
    if (options?.replace) {
      router.replace(to, { scroll });
    } else {
      router.push(to, { scroll });
    }
  };
}

export function useLocation() {
  const pathname = usePathname();
  const state = React.useSyncExternalStore(subscribe, getNavigationState, () => null);

  return {
    pathname: pathname || "/",
    search: typeof window !== "undefined" ? window.location.search : "",
    state: state,
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
