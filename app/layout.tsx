import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

const siteUrl = "https://www.sydenklar.no";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sydenklar – Finn ditt perfekte hotell",
    template: "%s | Sydenklar",
  },
  description:
    "Søk og sammenlign hoteller over hele verden. Finn de beste prisene og bestill drømmeferien enkelt med Sydenklar.",
  keywords: [
    "hotell",
    "hotelllsøk",
    "billige hoteller",
    "ferie",
    "reise",
    "overnatting",
    "hotell tilbud",
    "bestill hotell",
    "sydenklar",
  ],
  authors: [{ name: "Sydenklar" }],
  creator: "Sydenklar AS",
  publisher: "Sydenklar AS",
  openGraph: {
    type: "website",
    locale: "nb_NO",
    url: siteUrl,
    siteName: "Sydenklar",
    title: "Sydenklar – Finn ditt perfekte hotell",
    description:
      "Søk og sammenlign hoteller over hele verden. Finn de beste prisene og bestill drømmeferien enkelt.",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Sydenklar – Finn ditt perfekte hotell",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sydenklar – Finn ditt perfekte hotell",
    description:
      "Søk og sammenlign hoteller over hele verden. Finn de beste prisene enkelt.",
    images: [`${siteUrl}/og-image.jpg`],
    creator: "@sydenklar",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "nb-NO": siteUrl,
      "x-default": siteUrl,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.png",
  },
  manifest: "/manifest.json",
  verification: {
    google: "REPLACE_WITH_GOOGLE_VERIFICATION",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Sydenklar",
              url: siteUrl,
              description:
                "Søk og sammenlign hoteller over hele verden. Finn de beste prisene og bestill drømmeferien enkelt.",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${siteUrl}/hoteller?destinasjon={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
              publisher: {
                "@type": "Organization",
                name: "Sydenklar",
                url: siteUrl,
                logo: {
                  "@type": "ImageObject",
                  url: `${siteUrl}/logo.png`,
                },
              },
            }),
          }}
        />
      </head>
      <body><SessionProvider>{children}</SessionProvider></body>
    </html>
  );
}
