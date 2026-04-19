import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://voleus-admin.vercel.app/"),
  title: {
    default: "Voleus",
    template: "%s | Voleus",
  },
  description: "Gerenciador de jogos de vôlei do grupo.",
  applicationName: "Voleus Manager",
  openGraph: {
    title: "Voleus Manager",
    description: "Gerenciador de jogos de vôlei do grupo.",
    url: "https://voleus-admin.vercel.app/",
    siteName: "Voleus Manager",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Volei Manager",
    description: "Gerenciador de jogos de vôlei do grupo.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
