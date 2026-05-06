import type { Metadata } from "next";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BestDealsSection from "@/components/BestDealsSection";
import DestinationsSection from "@/components/DestinationsSection";
import WhySection from "@/components/WhySection";
import HotelTypesSection from "@/components/HotelTypesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Finn ditt perfekte hotell – Søk og sammenlign",
  description:
    "Søk blant over 2 millioner hoteller i 190 land. Sammenlign priser, les anmeldelser og bestill enkelt på Sydenklar.no. Alltid best pris, alltid trygt.",
  alternates: {
    canonical: "https://www.sydenklar.no",
  },
  openGraph: {
    title: "Sydenklar – Finn ditt perfekte hotell",
    description:
      "Søk blant over 2 millioner hoteller i 190 land. Alltid best pris, alltid trygt.",
    url: "https://www.sydenklar.no",
  },
};

export default function HomePage() {
  return (
    <main>
      <Header />
      <HeroSection />
      <BestDealsSection />
      <DestinationsSection />
      <WhySection />
      <HotelTypesSection />
      <TestimonialsSection />
      <NewsletterSection />
      <Footer />
    </main>
  );
}
