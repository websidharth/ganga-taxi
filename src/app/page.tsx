"use client"
import TaxiBookingMap from "@/components/mapples/taxi-booking-map";
import { CTASection } from "@/components/shared/cta-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {

  return (
    <>
      <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
        <div className="mx-auto max-w-7xl space-y-6"> 
          <TaxiBookingMap />
          <CTASection />
        </div>
      </main>
    </>
  );
}
