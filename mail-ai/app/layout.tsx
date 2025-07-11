import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import * as Tooltip from '@radix-ui/react-tooltip';

const defaultUrl =
  typeof process.env.VERCEL_URL === "string" && process.env.VERCEL_URL.length > 0
    ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3001";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <Tooltip.Provider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
            forcedTheme="light"
          >
            {children}
          </ThemeProvider>
        </Tooltip.Provider>
      </body>
    </html>
  );
}
