import type { Metadata } from "next";
import { readFileSync } from "fs";
import path from "path";
import "./globals.css";
import AppShell from "@/components/fx/AppShell";
import type { SiteContent } from "@/types/content";

function getFooter() {
  const filePath = path.join(process.cwd(), "content", "site.json");
  const raw = readFileSync(filePath, "utf-8");
  return (JSON.parse(raw) as SiteContent).footer;
}

export const metadata: Metadata = {
  // Tab title template — every child page gets "<page> | The Bro Media"
  // unless it overrides title. Default falls back to the full string.
  title: {
    default: "The Bro Media | Tech. Media. Marketing.",
    template: "%s | The Bro Media",
  },
  description:
    "Agencia de tecnología, medios y marketing digital. Interpretamos tus necesidades, identificamos oportunidades publicitarias y ejecutamos campañas efectivas.",
  keywords: "tech, media, marketing, BTL, WiFi marketing, activaciones, inteligencia artificial",
  // Favicon / tab icon — the BRO hex on dark, sized for browsers + iOS
  icons: {
    icon: [
      { url: "/images/logo-icon-dark.jpeg", type: "image/jpeg" },
    ],
    apple: { url: "/images/logo-icon-dark.jpeg", type: "image/jpeg" },
    shortcut: "/images/logo-icon-dark.jpeg",
  },
  openGraph: {
    title: "The Bro Media",
    description: "The Bro experience starts here",
    type: "website",
    siteName: "The Bro Media",
    images: [
      {
        url: "/images/logo-thumbnail.png",
        width: 947,
        height: 470,
        alt: "The Bro Media",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Bro Media",
    description: "The Bro experience starts here",
    images: ["/images/logo-thumbnail.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const footer = getFooter();
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&family=Gothic+A1:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppShell footer={footer}>{children}</AppShell>
      </body>
    </html>
  );
}
