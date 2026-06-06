 
import type { Metadata } from "next"; 
import { absoluteUrl, site } from "@/lib/seo";
import { AddRiderForm } from "@/components/add-rider";
import { CTASection } from "@/components/shared/cta-section";
import { DriverList } from "@/components/drivers/driver-list";

export const metadata: Metadata = {
  title: "Add Rider",
  description: "Add a new rider to the system.",
  openGraph: {
    title: `Add Rider — ${site.name}`,
    description: "Add a new rider to the system.",
    url: absoluteUrl("/add-rider"),
    images: [{ url: absoluteUrl(site.ogImage) }],
  },
};

 

export default function AddRiderPage() {
  return (
    <main className="mx-auto max-w-6xl container-px py-14 space-y-10">
       <AddRiderForm/>
       <DriverList/>
       <CTASection />
    </main>
  );
}
