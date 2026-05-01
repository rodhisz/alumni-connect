import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import Providers from "@/components/Providers";
import prisma from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Alumni Connect | Premium Global Network",
  description: "Platform manajemen data alumni berskala besar dengan interaktivitas premium.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let themeColorPrimary = "#10b981"; // emerald-500
  let themeColorSecondary = "#2dd4bf"; // teal-400
  try {
    const primarySetting = await prisma.siteSetting.findUnique({ where: { key: 'theme_color' } });
    const secondarySetting = await prisma.siteSetting.findUnique({ where: { key: 'theme_color_secondary' } });
    if (primarySetting?.value) themeColorPrimary = primarySetting.value;
    if (secondarySetting?.value) themeColorSecondary = secondarySetting.value;
  } catch (e) {
    console.error("Failed to load theme colors:", e);
  }

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --color-emerald-50: ${themeColorPrimary}10;
            --color-emerald-100: ${themeColorPrimary}20;
            --color-emerald-400: ${themeColorPrimary}cc;
            --color-emerald-500: ${themeColorPrimary};
            --color-emerald-600: ${themeColorPrimary}e6;
            --color-emerald-700: ${themeColorPrimary}b3;
            --color-blue-50: ${themeColorPrimary}10;
            --color-blue-100: ${themeColorPrimary}20;
            --color-blue-400: ${themeColorPrimary}cc;
            --color-blue-500: ${themeColorPrimary};
            --color-blue-600: ${themeColorPrimary}e6;
            --color-blue-700: ${themeColorPrimary}b3;
            --color-teal-300: ${themeColorSecondary}cc;
            --color-teal-400: ${themeColorSecondary};
            --color-teal-500: ${themeColorSecondary}e6;
          }
        `}} />
      </head>
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
