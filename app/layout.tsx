import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import AuthorizationProvider from "../components/auth/AuthorizationProvider";
import ProfileManager from "../components/ProfileManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AdventurePrep",
  description: "Learn about backpacking, gear, and planning your next adventure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthorizationProvider>
          <ProfileManager>
            {children}
          </ProfileManager>
        </AuthorizationProvider>
      </body>
    </html>
  );
}
