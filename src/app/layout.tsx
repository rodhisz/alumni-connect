import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Alumni Connect | Premium Global Network",
  description: "Platform manajemen data alumni berskala besar dengan interaktivitas premium.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300`}
      >
        <AuthSessionProvider>
          <Providers>
            <ConfirmProvider>
              {children}
            </ConfirmProvider>
          </Providers>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
