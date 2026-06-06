import type { MetadataRoute } from "next"; 
import { absoluteUrl } from "@/lib/seo";
import { services } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/services", "/about", "/contact"].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
  }));

  const serviceRoutes = services.map((s) => ({
    url: absoluteUrl(`/services/${s.slug}`),
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...serviceRoutes];
}
