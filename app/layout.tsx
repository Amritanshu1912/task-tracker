import { Toaster } from "@/components/ui/sonner";
import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Progress Tracker",
  description:
    "Track progress of your heirarchial tasks interactively for your projects",
  keywords: [
    "task tracker",
    "development roadmap",
    "project management",
    "interactive tasks",
    "task management",
  ],
};

export const viewport: Viewport = {
  themeColor: "#020203",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
