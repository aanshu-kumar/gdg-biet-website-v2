import type { Metadata, Viewport } from "next";
import { Outfit, Roboto } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RevealObserver } from "@/components/Reveal";
import { themeScript } from "@/components/ThemeToggle";
import { site } from "@/lib/site";

const body = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-body" });
const display = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-display" });

export const metadata: Metadata = {
  title: { default: site.fullName, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: { title: site.fullName, description: site.description, siteName: site.name, type: "website" },
  twitter: { card: "summary", title: site.fullName, description: site.description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#131314" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-fg">
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <RevealObserver />
      </body>
    </html>
  );
}
