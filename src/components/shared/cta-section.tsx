import Link from "next/link";
import { Button } from "@/components/ui/button";

type CTASectionProps = {
  title?: string;
  description?: string;
};

export function CTASection({
  title = "Ready to book your next ride?",
  description = "Get a comfortable and safe taxi ride to your destination in minutes.",
}: CTASectionProps) {
  return (
    <section className="rounded-2xl border bg-card p-8 md:p-10 my-8">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild>
            <Link href="/">Book a Ride</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
