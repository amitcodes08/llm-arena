import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import { PHProvider } from "@/app/arena/providers/posthog-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LLM Arena",
  description:
    "Send one prompt, watch up to three AI models answer at once, vote for the best one.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <PHProvider>
            <header className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800">
              <span className="font-bold text-lg">LLM Arena</span>
              <div className="flex gap-4 items-center">
                <Show when="signed-out">
                  <SignInButton mode="modal" />
                  <SignUpButton mode="modal" />
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </header>
            {children}
          </PHProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
