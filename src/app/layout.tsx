import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Bro Media | Tech. Media. Marketing.",
  description:
    "Agencia de tecnología, medios y marketing digital. Interpretamos tus necesidades, identificamos oportunidades publicitarias y ejecutamos campañas efectivas.",
  keywords: "tech, media, marketing, BTL, WiFi marketing, activaciones, inteligencia artificial",
  openGraph: {
    title: "The Bro Media",
    description: "The Bro experience starts here",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      <body>{children}</body>
    </html>
  );
}
