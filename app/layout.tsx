import type React from "react";
import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/theme-provider";
import {SupabaseProvider} from "@/components/supabase-provider";
import {Toaster} from "@/components/ui/toaster";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: {
    default: "TransitionFlow | Seamless Spotify Transitions",
    template: "%s | TransitionFlow - Spotify Transitions",
  },
  description:
    "Discover and share perfect Spotify song transitions. Create seamless playlists with smooth transitions between tracks.",
  keywords: [
    "spotify transitions",
    "song transitions",
    "music transitions",
    "spotify playlist transitions",
    "seamless transitions",
    "transition flow",
  ],
  authors: [{name: "TransitionFlow"}],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://transitionflow.vercel.app",
    title: "TransitionFlow | Seamless Spotify Transitions",
    description:
      "Discover and share perfect Spotify song transitions. Create seamless playlists with smooth transitions between tracks.",
    siteName: "TransitionFlow",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TransitionFlow - Discover perfect Spotify transitions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TransitionFlow | Seamless Spotify Transitions",
    description:
      "Discover and share perfect Spotify song transitions. Create seamless playlists with smooth transitions between tracks.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://transitionflow.com" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SupabaseProvider>
            {children}
            <Toaster />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
