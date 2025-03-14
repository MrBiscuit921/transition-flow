"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {Button} from "@/components/ui/button";
import {ModeToggle} from "@/components/mode-toggle";
import {UserNav} from "@/components/user-nav";
import {useSupabase} from "@/components/supabase-provider";
import {Music} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const {session} = useSupabase();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Music className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">TransitionFlow</span>
        </Link>
        <nav className="hidden md:flex flex-1 items-center gap-6 text-sm">
          <Link
            href="/"
            className={`transition-colors hover:text-foreground/80 ${
              isActive("/")
                ? "text-foreground font-medium"
                : "text-foreground/60"
            }`}>
            Home
          </Link>
          <Link
            href="/browse"
            className={`transition-colors hover:text-foreground/80 ${
              isActive("/browse")
                ? "text-foreground font-medium"
                : "text-foreground/60"
            }`}>
            Browse
          </Link>
          <Link
            href="/submit"
            className={`transition-colors hover:text-foreground/80 ${
              isActive("/submit")
                ? "text-foreground font-medium"
                : "text-foreground/60"
            }`}>
            Submit
          </Link>
          <Link
            href="/recommendations"
            className={`transition-colors hover:text-foreground/80 ${
              isActive("/recommendations")
                ? "text-foreground font-medium"
                : "text-foreground/60"
            }`}>
            Recommendations
          </Link>
          <Link
            href="/favorites"
            className={`transition-colors hover:text-foreground/80 ${
              isActive("/favorites")
                ? "text-foreground font-medium"
                : "text-foreground/60"
            }`}>
            Favorites
          </Link>
          <Link
            href="/analytics"
            className={`transition-colors hover:text-foreground/80 ${
              isActive("/analytics")
                ? "text-foreground font-medium"
                : "text-foreground/60"
            }`}>
            Analytics
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2">
          <nav className="flex md:hidden items-center gap-4">
            <Link href="/">
              <Button variant={isActive("/") ? "default" : "ghost"} size="sm">
                Home
              </Button>
            </Link>
            <Link href="/browse">
              <Button
                variant={isActive("/browse") ? "default" : "ghost"}
                size="sm">
                Browse
              </Button>
            </Link>
            <Link href="/submit">
              <Button
                variant={isActive("/submit") ? "default" : "ghost"}
                size="sm">
                Submit
              </Button>
            </Link>
          </nav>
          <ModeToggle />
          {session ? (
            <UserNav user={session.user} />
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
