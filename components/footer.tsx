// components/footer.tsx
"use client";

import Link from "next/link";
import {Music} from "lucide-react";
import {useToast} from "@/components/ui/use-toast";

export default function Footer() {
  const {toast} = useToast();

  const handlePlaceholderLink = (
    e: React.MouseEvent<HTMLAnchorElement>,
    pageName: string
  ) => {
    e.preventDefault();
    toast({
      title: "Coming Soon",
      description: `The ${pageName} page is under development and will be available soon.`,
    });
  };
  return (
    <footer className="border-t bg-muted/40">
      <div className="container flex flex-col gap-6 py-8 px-4 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:justify-between">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">TransitionFlow</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Discover and share seamless transitions between your favorite
              Spotify tracks.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Navigation</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/browse" className="hover:underline">
                    Browse
                  </Link>
                </li>
                <li>
                  <Link href="/submit" className="hover:underline">
                    Submit
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Resources</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:underline"
                    onClick={(e) => handlePlaceholderLink(e, "FAQ")}>
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:underline"
                    onClick={(e) => handlePlaceholderLink(e, "About")}>
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:underline"
                    onClick={(e) => handlePlaceholderLink(e, "Contact")}>
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Legal</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:underline"
                    onClick={(e) => handlePlaceholderLink(e, "Privacy Policy")}>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:underline"
                    onClick={(e) =>
                      handlePlaceholderLink(e, "Terms of Service")
                    }>
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} TransitionFlow. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground"
              onClick={(e) => handlePlaceholderLink(e, "Twitter")}>
              <span className="sr-only">Twitter</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-twitter">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground"
              onClick={(e) => handlePlaceholderLink(e, "GitHub")}>
              <span className="sr-only">GitHub</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-github">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
