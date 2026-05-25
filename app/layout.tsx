import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getMe } from "@/lib/dal";
import { resolveAppRole } from "@/lib/navigation";
import { getAppRole, getSessionToken } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Werefa",
  description: "Skip the line.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Werefa",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a5fd4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasSession = Boolean(await getSessionToken());
  const me = hasSession ? await getMe() : null;
  const roleFromCookie = await getAppRole();
  const role = me ? resolveAppRole(me) : roleFromCookie;

  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="h-full min-h-0 bg-background text-foreground">
        <Providers seekerNav={{ hasSession, role }}>{children}</Providers>
      </body>
    </html>
  );
}
