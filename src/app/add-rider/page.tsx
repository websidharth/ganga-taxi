import type { Metadata } from "next"; 
import { absoluteUrl, site } from "@/lib/seo";
import { DriverList } from "@/components/drivers/driver-list";

export const metadata: Metadata = {
  title: "Driver Directory",
  description: "Manage Ganga Taxi drivers, license details, and fleet assignments.",
  openGraph: {
    title: `Driver Directory — ${site.name}`,
    description: "Manage Ganga Taxi drivers, license details, and fleet assignments.",
    url: absoluteUrl("/add-rider"),
    images: [{ url: absoluteUrl(site.ogImage) }],
  },
};

export default function AddRiderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          Driver Directory
        </h1>
        <p className="text-slate-500 mt-1">
          Manage register records, contact details, driver licenses, and active vehicle numbers.
        </p>
      </div>

      <DriverList />
    </div>
  );
}
