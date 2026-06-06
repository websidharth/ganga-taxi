import type { Metadata } from "next";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { absoluteUrl, site } from "@/lib/seo";
import { CTASection } from "@/components/shared/cta-section";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about our mission, values, and the team driving our reliable taxi booking platform.",
  openGraph: {
    title: `About Us — ${site.name}`,
    description: "Learn about our mission, values, and the team driving our reliable taxi booking platform.",
    url: absoluteUrl("/about"),
    images: [{ url: absoluteUrl(site.ogImage) }],
  },
};

const team = [
  { name: "Saurabh Kumar", role: "Fleet Manager", bio: "Available 24/7 to solve booking issues and assist riders." },
  { name: "Monu Patel", role: "Customer Support", bio: "Ensures every vehicle is safe, clean, and road-ready." },
 
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl container-px py-14 space-y-10">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">About Us</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          We’re a dedicated team focused on providing safe, reliable, and comfortable taxi rides for every occasion.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Our mission</h2>
          <p className="text-sm text-muted-foreground">
            To provide the most dependable and convenient transportation service in the city. We pick you up on time, drive safely, and keep pricing transparent.
          </p>

          <h2 className="text-xl font-semibold">Brief history</h2>
          <p className="text-sm text-muted-foreground">
            What started as a single cab operation has grown into a city-wide fleet. We established this booking platform to make finding a reliable ride easier than ever for our growing community of happy passengers.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-card">
          <Image
            src="/images/hero.jpg"
            alt="Taxi fleet and operations team"
            width={1200}
            height={900}
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <Separator />

      <section aria-labelledby="team-heading" className="space-y-6">
        <h2 id="team-heading" className="text-2xl font-semibold tracking-tight">
          Team
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {team.map((m) => (
            <Card key={m.name}>
              <CardHeader>
                <CardTitle className="text-base">{m.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{m.role}</p>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{m.bio}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <CTASection />
    </main>
  );
}
