"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { MenuIcon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { clearStoredAccessToken, getStoredAccessToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/events", label: "Browse Events" },
  { href: "/categories", label: "Categories" },
  { href: "/support", label: "Support" },
];

export function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAuthenticated = useSyncExternalStore(
    () => () => undefined,
    () => Boolean(getStoredAccessToken()),
    () => false,
  );

  function handleLogout() {
    clearStoredAccessToken();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(15,15,15,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold uppercase tracking-[0.2em] text-white">
          EventHub
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-white/70 transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <ButtonLink href="/dashboard" variant="secondary">
                Dashboard
              </ButtonLink>
              <Button variant="ghost" onClick={handleLogout}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost">
                Sign In
              </ButtonLink>
              <ButtonLink href="/register" variant="secondary">
                Sign Up
              </ButtonLink>
            </>
          )}
        </div>
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((value) => !value)}
          className="rounded-full border border-white/10 p-3 text-white md:hidden"
        >
          <MenuIcon className="size-5" />
        </button>
      </div>
      <div className={cn("border-t border-white/8 px-4 py-4 md:hidden", open ? "block" : "hidden")}>
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-sm text-white/80"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            {isAuthenticated ? (
              <>
                <ButtonLink href="/dashboard" variant="secondary" className="px-5" >
                  Dashboard
                </ButtonLink>
                <Button variant="ghost" className="px-0" onClick={handleLogout}>
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost" className="px-0">
                  Sign In
                </ButtonLink>
                <ButtonLink href="/register" variant="secondary">
                  Sign Up
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
